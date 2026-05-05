import { NextFunction, Response, Request } from "express";
import { UserService } from "../service/user.service";
import { response_paginated, response_success } from "../utils/response.util";
import { checkFilteringQuery } from "../utils/filter.util";

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
