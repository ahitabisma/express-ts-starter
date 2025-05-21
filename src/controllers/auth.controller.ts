import { NextFunction, Request, Response } from "express";
import { RegisterUserRequest, LoginUserRequest } from "../models/auth.model";
import { AuthService } from "../services/auth.service";
import logger from "../config/logger";
import { UserRequest } from "../types/user";

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
            res.status(200).json({
                success: true,
                message: "User logged in successfully",
                data: response,
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
}