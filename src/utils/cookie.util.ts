import { Response } from "express";

const isProduction = process.env.APP_ENV === "production";

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
): void => {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: "/",
  });

  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/auth/refresh", // restrict refresh token to refresh endpoint
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie(ACCESS_TOKEN_COOKIE, { path: "/" });
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/auth/refresh" });
};

export const getAccessTokenFromCookie = (
  cookies: Record<string, string>,
): string | undefined => {
  return cookies[ACCESS_TOKEN_COOKIE];
};

export const getRefreshTokenFromCookie = (
  cookies: Record<string, string>,
): string | undefined => {
  return cookies[REFRESH_TOKEN_COOKIE];
};
