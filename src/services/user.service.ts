import bcrypt from 'bcrypt';
import { prisma } from "../config/database";
import { Pageable, PagingRequest } from "../models/paging.model";
import { CreateUserRequest, UpdateUserRequest, User } from "../models/user.model";
import { UserValidation } from "../validation/user.validation";
import { Validation } from "../validation/validation";
import { ResponseError } from '../types/response.error';

export class UserService {
    static async getUsers(req: PagingRequest): Promise<Pageable<User>> {
        const page = req.page || 1;
        const size = req.size || 10;
        const skip = (page - 1) * size;

        const total = await prisma.user.count();

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true
            },
            skip: skip,
            take: size,
            orderBy: {
                id: 'asc'
            }
        });

        return {
            data: users.map(user => user as User),
            paging: {
                current_page: page,
                total_page: Math.ceil(total / size),
                size: size,
            }
        };
    }

    static async findUserById(id: string): Promise<User | null> {
        const userId = parseInt(id);

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return user as User;
    }

    static async createUser(req: CreateUserRequest): Promise<User> {
        const userRequest = Validation.validate(UserValidation.CREATE, req);

        const existingUser = await prisma.user.findUnique({
            where: {
                email: userRequest.email
            }
        });

        if (existingUser) {
            throw new ResponseError(400, "User already exists", {
                email: ["User already exists"]
            });
        }

        userRequest.password = await bcrypt.hash(userRequest.password, 10);

        const user = await prisma.user.create({
            data: {
                email: req.email,
                name: req.name,
                password: req.password,
                role: req.role
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return user as User;
    }

    static async updateUser(id: string, req: UpdateUserRequest): Promise<User> {
        const userId = parseInt(id);

        const userRequest = Validation.validate(UserValidation.UPDATE, req);

        const existingUser = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if (!existingUser) {
            throw new ResponseError(404, "User not found", {
                error: ["User not found"]
            });
        }

        if (userRequest.password) {
            userRequest.password = await bcrypt.hash(userRequest.password, 10);
        }

        const user = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                email: userRequest.email,
                name: userRequest.name,
                password: userRequest.password,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return user as User;
    }

    static async deleteUser(id: string): Promise<User> {
        const userId = parseInt(id);

        const existingUser = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if (!existingUser) {
            throw new ResponseError(404, "User not found", {
                error: ["User not found"]
            });
        }

        const user = await prisma.user.delete({
            where: {
                id: userId
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return user as User;
    }
}