import { Role, User } from "../../generated/prisma";

export interface RegisterUserRequest {
    name: string;
    email: string;
    password: string;
}

export interface LoginUserRequest {
    email: string;
    password: string;
}

export interface UserResponse {
    id: number;
    name: string;
    email: string;
    role: Role;
}

export function toUserResponse(user: User): UserResponse {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };
}