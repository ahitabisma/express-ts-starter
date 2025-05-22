import { prisma } from "../config/database";
import { RegisterUserRequest, LoginUserRequest, toUserResponse, UserResponse } from "../models/auth.model";
import { ResponseError } from "../types/response.error";
import { UserRequest } from "../types/user";
import { calculateExpiryDate } from "../utils/expired";
import { generateAccessToken, generateRefreshToken, jwtConfig } from "../utils/jwt";
import { AuthValidation } from "../validation/auth.validation";
import { Validation } from "../validation/validation";
import bcrypt from "bcrypt";

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
}