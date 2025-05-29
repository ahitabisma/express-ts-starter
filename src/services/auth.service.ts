import { UserController } from './../controllers/user.controller';
import { prisma } from "../config/database";
import { RegisterUserRequest, LoginUserRequest, toUserResponse, UserResponse, UpdateUserProfileRequest, ResetPasswordEmailRequest, ResetPasswordResponse, ResetPasswordRequest } from "../models/auth.model";
import { ResponseError } from "../types/response.error";
import { UserRequest } from "../types/user";
import { calculateExpiryDate } from "../utils/expired";
import { generateAccessToken, generateRefreshToken, generateResetToken, jwtConfig, verifyResetToken } from "../utils/jwt";
import { AuthValidation } from "../validation/auth.validation";
import { Validation } from "../validation/validation";
import bcrypt from "bcrypt";
import { UserService } from './user.service';
import logger from '../config/logger';
import { EmailService } from './email.service';

export class AuthService {
    static async register(req: RegisterUserRequest) {
        const registerRequest = Validation.validate(AuthValidation.REGISTER, req);

        const exists = await prisma.user.count({
            where: {
                email: registerRequest.email
            }
        });

        if (exists != 0) {
            throw new ResponseError(400, "Email already in use", {
                email: ["Email already in use"]
            });
        }

        registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

        const user = await prisma.user.create({
            data: registerRequest
        });

        return toUserResponse(user);
    }

    static async login(req: LoginUserRequest) {
        const loginRequest = Validation.validate(AuthValidation.LOGIN, req);

        const user = await prisma.user.findUnique({
            where: {
                email: loginRequest.email
            }
        })

        if (!user) {
            throw new ResponseError(400, "Invalid credentials", {
                error: ["Invalid credentials"]
            });
        }

        const isPasswordValid = await bcrypt.compare(loginRequest.password, user.password);

        if (!isPasswordValid) {
            throw new ResponseError(400, "Invalid credentials", {
                error: ["Invalid credentials"]
            });
        }

        const userResponse = toUserResponse(user);

        const accessToken = generateAccessToken(userResponse);
        const refreshToken = generateRefreshToken(userResponse);

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: calculateExpiryDate(jwtConfig.refreshToken.expiresIn)
            }
        });

        return {
            user: userResponse as UserResponse,
            token: accessToken,
            refreshToken
        };
    }

    static async current(req: UserRequest) {
        return req.user;
    }

    static async logout(refreshToken: string) {
        if (!refreshToken) {
            throw new ResponseError(401, "Unauthorized", {
                error: ["Unauthorized"]
            });
        }

        const refreshTokenRecord = await prisma.refreshToken.findUnique({
            where: { token: refreshToken }
        });

        if (!refreshTokenRecord) {
            throw new ResponseError(401, "Unauthorized", {
                error: ["Unauthorized"]
            });
        }

        await prisma.refreshToken.delete({
            where: { id: refreshTokenRecord.id }
        });

        return true;
    }

    static async refreshToken(token: string) {
        const refreshTokenRecord = await prisma.refreshToken.findUnique({
            where: { token },
            include: { user: true }
        });

        if (!refreshTokenRecord) {
            throw new ResponseError(401, "Invalid refresh token", {
                error: ["Invalid refresh token"]
            });
        }

        if (refreshTokenRecord.expiresAt < new Date()) {
            await prisma.refreshToken.delete({
                where: { id: refreshTokenRecord.id }
            });

            throw new ResponseError(401, "Refresh token expired", {
                error: ["Refresh token expired. Please login again."]
            });
        }

        const userResponse = toUserResponse(refreshTokenRecord.user);

        const accessToken = generateAccessToken(userResponse);
        const newRefreshToken = generateRefreshToken(userResponse);

        await prisma.refreshToken.delete({
            where: { id: refreshTokenRecord.id }
        });

        await prisma.refreshToken.create({
            data: {
                token: newRefreshToken,
                userId: refreshTokenRecord.user.id,
                expiresAt: calculateExpiryDate(jwtConfig.refreshToken.expiresIn)
            }
        });

        return {
            user: userResponse as UserResponse,
            token: accessToken,
            refreshToken: newRefreshToken
        };
    }

    static async updateProfile(id: number, req: UpdateUserProfileRequest) {
        const data = Validation.validate(AuthValidation.UPDATE_PROFILE, req);

        logger.info("Update profile data: ", req);

        const user = await prisma.user.findUnique({
            where: {
                id: id
            }
        });

        if (!user) {
            throw new ResponseError(404, "User not found", {
                error: ["User not found"]
            });
        }

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        if (data.photo !== undefined) {
            if (data.photo && user.photo) {
                await UserService.deletePhoto(user.photo);
            }
            else if (data.photo === null && user.photo) {
                await UserService.deletePhoto(user.photo);
            }
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: id
            },
            data
        });

        const { password, ...response } = updatedUser;

        return {
            user: response
        };
    }

    static async sendResetPassworEmail(req: ResetPasswordEmailRequest): Promise<boolean> {
        const resetRequest = Validation.validate(AuthValidation.SEND_RESET_PASSWORD_EMAIL, req);

        const user = await prisma.user.findUnique({
            where: {
                email: resetRequest.email
            }
        });

        if (!user) {
            throw new ResponseError(404, "User not found", {
                error: ["User not found"]
            });
        }

        const token = generateResetToken(user as ResetPasswordResponse);

        await prisma.resetPasswordToken.create({
            data: {
                userId: user.id,
                token,
                expiresAt: calculateExpiryDate(jwtConfig.resetToken.expiresIn)
            }
        });

        await EmailService.sendPasswordResetEmail(resetRequest.email, token);

        return true;
    }

    static async resetPassword(req: ResetPasswordRequest) {
        const resetRequest = Validation.validate(AuthValidation.RESET_PASSWORD, req);

        if (resetRequest.password !== resetRequest.confirmPassword) {
            throw new ResponseError(400, "Passwords do not match", {
                confirmPassword: ["Passwords do not match"]
            });
        }

        const decoded = verifyResetToken(req.token);

        // Check if the reset token exists and is valid
        const resetTokenRecord = await prisma.resetPasswordToken.findUnique({
            where: {
                token: req.token
            }
        });

        if (!resetTokenRecord) {
            throw new ResponseError(400, "Invalid reset token", {
                error: ["Invalid or expired reset token"]
            });
        }

        if (resetTokenRecord.used) {
            throw new ResponseError(400, "Reset token already used", {
                error: ["This reset link has already been used"]
            });
        }

        if (resetTokenRecord.expiresAt < new Date()) {
            throw new ResponseError(400, "Reset token expired", {
                error: ["Reset link has expired. Please request a new one."]
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id
            }
        });

        if (!user) {
            throw new ResponseError(404, "User not found", {
                error: ["User not found"]
            });
        }

        user.password = await bcrypt.hash(resetRequest.password, 10);

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                password: user.password
            }
        });

        await prisma.resetPasswordToken.update({
            where: {
                id: resetTokenRecord.id,
            },
            data: {
                used: true
            }
        });

        //  Delete all refresh tokens for the user
        await prisma.refreshToken.deleteMany({
            where: {
                userId: user.id
            }
        });

        return true;
    }
}