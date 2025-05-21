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
}