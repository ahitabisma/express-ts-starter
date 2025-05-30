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

export interface UpdateUserProfileRequest {
    name?: string;
    password?: string;
    photo?: string;
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

export interface ResetPasswordEmailRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    password: string;
    confirmPassword: string;
}

export interface ResetPasswordResponse {
    id: number;
    email: string;
}