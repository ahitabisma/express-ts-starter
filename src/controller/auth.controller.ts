import { NextFunction, Request, Response } from "express";
import { appLogger } from "../lib/winston";
import { AuthValidation } from "../validation/auth.validation";
import { response_success } from "../utils/response.util";
import { AuthService } from "../service/auth.service";
import { RegisterDTO } from "../types/auth.type";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = AuthValidation.REGISTER.parse(req.body) as RegisterDTO;
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
}
