import { Response, Request, NextFunction } from "express";
import { ZodError } from "zod";
import { ResponseError } from "../types/response.error";
import multer from "multer";
import jwt from "jsonwebtoken";

export const errorMiddleware = async (error: Error, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof ZodError) {
        // Format ZodError menjadi struktur yang lebih mudah dibaca
        const formattedErrors: Record<string, string[]> = {};

        error.errors.forEach((err) => {
            const field = err.path.join("."); // Mengambil path field dari error

            if (!formattedErrors[field]) {
                formattedErrors[field] = [];
            }

            formattedErrors[field].push(err.message);
        });

        res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: formattedErrors
        });
    } else if (error instanceof multer.MulterError) {
        res.status(400).json({
            success: false,
            message: error.message,
            errors: {
                file: [error.message]
            }
        });
    } else if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
            success: false,
            message: "Token expired",
            errors: {
                token: ["Token expired"]
            }
        })
    } else if (error instanceof ResponseError) {
        res.status(error.status).json({
            success: false,
            message: error.message,
            errors: error.errors || {}
        });
    } else {
        res.status(500).json({
            errors: error.message
        });
    }
}