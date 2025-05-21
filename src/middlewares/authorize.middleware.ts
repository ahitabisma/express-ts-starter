import { NextFunction, Response } from "express";
import { UserRequest } from "../types/user";
import { ResponseError } from "../types/response.error";

export const authorize = (allowedRoles: string[]) => {
    return (req: UserRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new ResponseError(401, "Unauthorized", {
                    error: ["Authentication required"]
                });
            }

            if (!allowedRoles.includes(req.user.role)) {
                throw new ResponseError(403, "Forbidden", {
                    error: ["You don't have permission to access this resource"]
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

export const authorizeAdmin = authorize(['ADMIN']);
export const authorizeUser = authorize(['USER']);
export const authorizeAll = authorize(['USER', 'ADMIN']);