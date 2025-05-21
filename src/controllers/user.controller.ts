import { NextFunction, Response } from "express";
import { UserRequest } from "../types/user";
import { UserService } from "../services/user.service";
import { PagingRequest } from "../models/paging.model";
import { CreateUserRequest, UpdateUserRequest } from "../models/user.model";

export class UserController {
    static async getUsers(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const size = parseInt(req.query.size as string) || 10;

            const paging: PagingRequest = {
                page,
                size
            };

            const response = await UserService.getUsers(paging);

            res.status(200).json({
                success: true,
                message: "Users retrieved successfully",
                data: response,
            });
        } catch (error) {
            next(error);
        }
    }

    static async findUserById(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.params.id;

            const response = await UserService.findUserById(userId);

            res.status(200).json({
                success: true,
                message: "User retrieved successfully",
                data: response,
            });
        } catch (error) {
            next(error);
        }
    }

    static async createUser(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const data = req.body as CreateUserRequest;

            const response = await UserService.createUser(data);

            res.status(201).json({
                success: true,
                message: "User created successfully",
                data: response,
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateUser(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.params.id;
            const data = req.body as UpdateUserRequest;

            const response = await UserService.updateUser(userId, data);

            res.status(200).json({
                success: true,
                message: "User updated successfully",
                data: response,
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteUser(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.params.id;

            await UserService.deleteUser(userId);

            res.status(200).json({
                success: true,
                message: "User deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    }
}