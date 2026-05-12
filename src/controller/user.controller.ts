import { NextFunction, Response, Request } from "express";
import { UserService } from "../service/user.service";
import {
  response_error,
  response_paginated,
  response_success,
} from "../utils/response.util";
import { checkFilteringQuery } from "../utils/filter.util";
import { UserValidation } from "../validation/user.validation";
import { UpdateProfileDTO } from "../types/user.type";
import { AppStatus } from "../types/app.type";
import { Validation } from "../validation/validation";

export class UserController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getProfile(req.user!.id);
      return response_success(
        res,
        200,
        "SUCCESS",
        "User profile retrieved successfully",
        user,
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const data = Validation.validate(UserValidation.UPDATE_PROFILE, req.body) as UpdateProfileDTO;

      const result = await UserService.updateProfile(userId, data);
      return response_success(
        res,
        200,
        "SUCCESS",
        "User profile updated successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  }

  static async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const r = req as any;

      if (!r.file) {
        return response_error(
          res,
          400,
          AppStatus.VALIDATION_ERROR,
          "No file uploaded",
        );
      }

      const result = await UserService.uploadAvatar(userId, r.file.buffer);

      return response_success(
        res,
        200,
        "SUCCESS",
        "Avatar uploaded successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const result = await UserService.deleteAvatar(userId);

      return response_success(
        res,
        200,
        "SUCCESS",
        "Avatar deleted successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filter = checkFilteringQuery(req);
      const { data, pagination } = await UserService.getAll(filter);
      return response_paginated(
        res,
        200,
        "SUCCESS",
        "Users retrieved successfully",
        data,
        pagination,
      );
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id as string;
      const user = await UserService.getById(userId);
      return response_success(
        res,
        200,
        "SUCCESS",
        "User retrieved successfully",
        user,
      );
    } catch (error) {
      next(error);
    }
  }
}
