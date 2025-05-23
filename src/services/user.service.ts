import bcrypt from 'bcrypt';
import { prisma } from "../config/database";
import { Pageable, PagingRequest } from "../models/paging.model";
import { CreateUserRequest, UpdateUserRequest, User } from "../models/user.model";
import { UserValidation } from "../validation/user.validation";
import { Validation } from "../validation/validation";
import { ResponseError } from '../types/response.error';
import path from 'path';
import fs from 'fs';
import logger from '../config/logger';
import { UPLOAD_DIR } from '../utils/upload';

const userSelectFields = {
    id: true,
    email: true,
    name: true,
    photo: true,
    role: true,
    createdAt: true,
    updatedAt: true
};

export class UserService {
    static async getUsers(req: PagingRequest): Promise<Pageable<User>> {
        const page = req.page ?? 1;
        const size = req.size ?? 10;
        const skip = (page - 1) * size;

        const [total, users] = await Promise.all([
            prisma.user.count(),
            prisma.user.findMany({
                select: userSelectFields,
                skip,
                take: size,
                orderBy: { id: 'asc' }
            })
        ]);

        return {
            data: users as User[],
            paging: {
                current_page: page,
                total_page: Math.ceil(total / size),
                size
            }
        };
    }

    static async findUserById(id: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { id: parseInt(id) },
            select: userSelectFields
        }) as User | null;
    }

    static async createUser(req: CreateUserRequest): Promise<User> {
        const data = Validation.validate(UserValidation.CREATE, req);

        const emailExists = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (emailExists) {
            throw new ResponseError(400, "User already exists", {
                email: ["User already exists"]
            });
        }

        data.password = await bcrypt.hash(data.password, 10);

        const user = await prisma.user.create({
            data,
            select: userSelectFields
        });

        return user as User;
    }

    static async updateUser(id: string, req: UpdateUserRequest): Promise<User> {
        const userId = parseInt(id);
        const data = Validation.validate(UserValidation.UPDATE, req);

        const existingUser = await this.ensureUserExists(userId);

        if (data.email && data.email !== existingUser.email) {
            const emailExists = await prisma.user.findFirst({
                where: {
                    email: req.email,
                    NOT: { id: userId }
                }
            });

            if (emailExists) {
                throw new ResponseError(400, "Email already exists", {
                    email: ["Email already exists"]
                });
            }
        }

        if (data.photo !== undefined) {
            if (data.photo && existingUser.photo) {
                await this.deletePhoto(existingUser.photo);
            }
            else if (data.photo === null && existingUser.photo) {
                await this.deletePhoto(existingUser.photo);
            }
        }

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data,
            select: userSelectFields
        });

        return user as User;
    }

    static async deleteUser(id: string): Promise<User> {
        const userId = parseInt(id);

        const existingUser = await this.ensureUserExists(userId);

        if (existingUser.photo) {
            await this.deletePhoto(existingUser.photo);
        }

        const user = await prisma.user.delete({
            where: { id: userId },
            select: userSelectFields
        });

        return user as User;
    }

    private static async ensureUserExists(userId: number): Promise<User> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: userSelectFields
        });

        if (!user) {
            throw new ResponseError(404, "User not found", {
                error: ["User not found"]
            });
        }

        return user as User;
    }

    static async deletePhoto(photo: string): Promise<void> {
        try {
            const photoPath = path.join(UPLOAD_DIR, photo);

            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        } catch (error) {
            logger.error(`Failed to delete photo file: ${photo}`, error);
        }
    }
}
