import { NextFunction, Request, Response } from "express";
import { appLogger } from "../lib/winston";
import { AuthValidation } from "../validation/auth.validation";
import { response_success } from "../utils/response.util";
import { AuthService } from "../service/auth.service";
import { LoginDTO, RegisterDTO } from "../types/auth.type";
import {
  clearAuthCookies,
  getRefreshTokenFromCookie,
  setAuthCookies,
} from "../utils/cookie.util";
import { AppStatus } from "../types/app.type";
import { AppError } from "../utils/app-error.util";
import { Validation } from "../validation/validation";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = Validation.validate(AuthValidation.REGISTER, req.body) as RegisterDTO;
      const result = await AuthService.register(data);
      return response_success(
        res,
        201,
        "SUCCESS",
        "User registered successfully",
        result,
      );
    } catch (e) {
      next(e);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = Validation.validate(AuthValidation.LOGIN, req.body) as LoginDTO;
      const { user, accessToken, refreshToken } = await AuthService.login(data);

      setAuthCookies(res, accessToken, refreshToken);

      return response_success(
        res,
        200,
        "SUCCESS",
        "User logged in successfully",
        user,
      );
    } catch (e) {
      next(e);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = getRefreshTokenFromCookie(req.cookies);

      if (!refreshToken) {
        throw new AppError(
          "Refresh token is missing",
          401,
          AppStatus.UNAUTHORIZED,
        );
      }

      const { accessToken, refreshToken: newRefreshToken } =
        await AuthService.refreshToken(refreshToken);

      setAuthCookies(res, accessToken, newRefreshToken);

      return response_success(
        res,
        200,
        "SUCCESS",
        "Tokens refreshed successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = getRefreshTokenFromCookie(req.cookies);
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }
      clearAuthCookies(res);
      return response_success(res, 200, "SUCCESS", "Logged out successfully");
    } catch (error) {
      next(error);
    }
  }
}
