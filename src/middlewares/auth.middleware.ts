import { NextFunction, Response } from "express";
import { UserRequest } from "../types/user";
import { ResponseError } from "../types/response.error";
import { verifyAccessToken } from "../utils/jwt";
import { prisma } from "../config/database";
import jwt from "jsonwebtoken";

export const authMiddleware = async (req: UserRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ResponseError(401, "Unauthorized", {
            error: ["No authentication token provided"]
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyAccessToken(token);

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id
            }
        });

        if (!user) {
            throw new ResponseError(401, "Unauthorized", {
                error: ["User not found"]
            });
        }

        // Add user to request for use in routes
        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new ResponseError(401, "Token expired", {
                error: ["Your session has expired. Please login again."]
            });
        } else {
            throw new ResponseError(401, "Unauthorized", {
                error: ["Invalid authentication token"]
            });
        }
    }
}