import { prisma } from "../lib/prisma";
import { AppStatus } from "../types/app.type";
import { LoginDTO, RegisterDTO, toUserResponse } from "../types/auth.type";
import { AppError } from "../utils/app-error.util";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiresAt,
  verifyRefreshToken,
} from "../utils/jwt.util";

export class AuthService {
  static async register(data: RegisterDTO) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingEmail) {
      throw new AppError(
        "Email is already registered",
        409,
        AppStatus.CONFLICT,
      );
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

  static async login(data: LoginDTO) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError(
        "Invalid email or password",
        401,
        AppStatus.INVALID_CREDENTIALS,
      );
    }

    if (!user.isActive) {
      throw new AppError(
        "Account is inactive. Please contact support.",
        403,
        AppStatus.FORBIDDEN,
      );
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new AppError(
        "Invalid email or password",
        401,
        AppStatus.INVALID_CREDENTIALS,
      );
    }

    const tokenPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiresAt(),
      },
    });

    return {
      user: toUserResponse(user),
      accessToken,
      refreshToken,
    };
  }

  static async refreshToken(oldToken: string) {
    const payload = await verifyRefreshToken(oldToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: oldToken },
      include: { user: true },
    });

    if (
      !storedToken ||
      storedToken.isRevoked ||
      storedToken.expiresAt < new Date()
    ) {
      throw new AppError(
        "Invalid or expired refresh token",
        401,
        AppStatus.UNAUTHORIZED,
      );
    }

    if (!storedToken.user.isActive) {
      throw new AppError(
        "Your account has been deactivated",
        403,
        AppStatus.FORBIDDEN,
      );
    }

    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    const tokenPayload = {
      sub: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: storedToken.user.id,
        expiresAt: getRefreshTokenExpiresAt(),
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout(token: string) {
    if (!token) return;

    await prisma.refreshToken.updateMany({
      where: { token },
      data: { isRevoked: true },
    });
  }
}
