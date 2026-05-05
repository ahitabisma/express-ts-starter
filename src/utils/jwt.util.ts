import { JwtPayload } from "../types/auth.type";
import jwt from "jsonwebtoken";
import { AppError } from "./app-error.util";
import { AppStatus } from "../types/app.type";

const parseDuration = (duration: string): number => {
  const unit = duration.slice(-1);
  const value = parseInt(duration.slice(0, -1));
  const map: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return value * (map[unit] || 1);
};

export const generateAccessToken = (
  payload: Omit<JwtPayload, "type">,
): string => {
  const options: jwt.SignOptions = {};
  const expiresIn = process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"];

  if (expiresIn !== undefined) {
    options.expiresIn = expiresIn;
  }

  return jwt.sign(
    { ...payload, type: "access" },
    process.env.JWT_SECRET!,
    options,
  );
};

export const generateRefreshToken = (
  payload: Omit<JwtPayload, "type">,
): string => {
  const options: jwt.SignOptions = {};
  const expiresIn = process.env
    .JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"];

  if (expiresIn !== undefined) {
    options.expiresIn = expiresIn;
  }

  return jwt.sign(
    { ...payload, type: "refresh" },
    process.env.JWT_REFRESH_SECRET!,
    options,
  );
};

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError("Access token expired", 401, AppStatus.UNAUTHORIZED);
    }
    throw new AppError("Invalid access token", 401, AppStatus.UNAUTHORIZED);
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError("Refresh token expired", 401, AppStatus.UNAUTHORIZED);
    }
    throw new AppError("Invalid refresh token", 401, AppStatus.UNAUTHORIZED);
  }
};

export const getRefreshTokenExpiresAt = (): Date => {
  const seconds = parseDuration(process.env.JWT_REFRESH_EXPIRES_IN!);
  return new Date(Date.now() + seconds * 1000);
};
