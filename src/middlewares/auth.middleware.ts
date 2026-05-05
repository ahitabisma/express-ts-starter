import { NextFunction, Request, Response } from "express";
import { getAccessTokenFromCookie } from "../utils/cookie.util";
import { AppError } from "../utils/app-error.util";
import { AppStatus } from "../types/app.type";
import { verifyAccessToken } from "../utils/jwt.util";
import { prisma } from "../lib/prisma";
import { Role } from "../../generated/prisma/enums";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = getAccessTokenFromCookie(req.cookies);

    if (!token) {
      throw new AppError("Unauthorized", 401, AppStatus.UNAUTHORIZED);
    }

    const payload = verifyAccessToken(token);

    if (payload.type !== "access") {
      throw new AppError("Unauthorized", 401, AppStatus.UNAUTHORIZED);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new AppError("Unauthorized", 401, AppStatus.UNAUTHORIZED);
    }

    (req as Request).user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: Role[]) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401, AppStatus.UNAUTHORIZED));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("Insufficient permissions", 403, AppStatus.FORBIDDEN),
      );
    }

    next();
  };
};
