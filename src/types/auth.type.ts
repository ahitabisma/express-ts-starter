import { Role, User } from "../../generated/prisma/client";

export interface RegisterDTO {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  password: string;
  confirmPassword: string;
}

export function toUserResponse(user: User) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  type: "access" | "refresh";
}
