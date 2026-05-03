import { prisma } from "../lib/prisma";
import { AppStatus } from "../types/app.type";
import { RegisterDTO, toUserResponse } from "../types/auth.type";
import { AppError } from "../utils/app-error.util";
import bcrypt from "bcrypt";

export class AuthService {
  static async register(data: RegisterDTO) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingEmail) {
      throw new AppError("Email is already registered", 409, AppStatus.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        password: hashedPassword,
        role: "USER",
      },
    });

    return toUserResponse(user);
  }
}
