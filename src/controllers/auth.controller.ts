import { NextFunction, Request, Response } from "express";
import { RegisterUserRequest, LoginUserRequest, UpdateUserProfileRequest, ResetPasswordEmailRequest, ResetPasswordRequest } from "../models/auth.model";
import { AuthService } from "../services/auth.service";
import logger from "../config/logger";
import { UserRequest } from "../types/user";
import path from "path";
import fs from "fs";
import { UPLOAD_DIR } from "../utils/upload";

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body as RegisterUserRequest;

            const response = await AuthService.register(data);

            res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: response,
            });
        } catch (error) {
            logger.error("Error in AuthController.register: ", error);
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body as LoginUserRequest;

            const response = await AuthService.login(data);

            res.cookie("refreshToken", response.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            const { refreshToken, ...newResponse } = response;

            res.status(200).json({
                success: true,
                message: "User logged in successfully",
                data: newResponse,
            });
        } catch (error) {
            logger.error("Error in AuthController.login: ", error);
            next(error);
        }
    }

    static async current(req: UserRequest, res: Response, next: NextFunction) {
        try {
            res.status(200).json({
                status: true,
                message: "User retrieved successfully",
                data: req.user
            });
        } catch (error) {
            logger.error("Error in AuthController.current: ", error);
            next(error);
        }
    }

    static async logout(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (refreshToken) {
                await AuthService.logout(refreshToken);
            }

            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });

            res.status(200).json({
                success: true,
                message: "User logged out successfully",
            });
        } catch (error) {
            logger.error("Error in AuthController.logout: ", error);
            next(error);
        }
    }

    static async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies.refreshToken;

            const response = await AuthService.refreshToken(refreshToken);

            res.cookie("refreshToken", response.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            const { refreshToken: newRefreshToken, ...newResponse } = response;

            res.status(200).json({
                success: true,
                message: "Token refreshed successfully",
                data: newResponse,
            });
        } catch (error) {
            logger.error("Error in AuthController.refreshToken: ", error);
            next(error);
        }
    }

    static async updateProfile(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const data = req.body || {} as UpdateUserProfileRequest;

            if (req.file) {
                data.photo = req.file.filename;
            } else if (req.body && req.body.removePhoto === 'true') {
                data.photo = null; // Using null instead of undefined for explicit DB removal
            }

            logger.info("Update profile data: ", req.body);

            const response = await AuthService.updateProfile(req.user!.id, data);

            res.status(200).json({
                success: true,
                message: "User profile updated successfully",
                data: response,
            });
        } catch (error) {
            if (req.file) {
                const filePath = path.join(UPLOAD_DIR, req.file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }

            logger.error("Error in AuthController.updateProfile: ", error);
            next(error);
        }
    }

    static async sendResetPasswordEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body as ResetPasswordEmailRequest;

            const response = await AuthService.sendResetPassworEmail(data);

            res.status(200).json({
                success: true,
                message: "Reset password email sent successfully",
                data: response,
            });
        } catch (error) {
            logger.error("Error in AuthController.sendResetPasswordEmail: ", error);
            next(error);
        }
    }

    static async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body as ResetPasswordRequest;

            const response = await AuthService.resetPassword(data);

            res.status(200).json({
                success: true,
                message: "Password reset successfully",
                data: response,
            });
        } catch (error) {
            logger.error("Error in AuthController.resetPassword: ", error);
            next(error);
        }
    }
}