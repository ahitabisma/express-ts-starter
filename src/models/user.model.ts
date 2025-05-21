import { Role } from "../../generated/prisma";

export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
    role: Role | "USER";
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    password?: string;
}