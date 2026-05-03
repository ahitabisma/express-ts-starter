import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { v4 as uuidv4 } from "uuid";
import { appLogger } from "../lib/winston";
import { AppStatus } from "../types/app.type";
import path from "node:path";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestId = res.locals.requestId || uuidv4();
  const timestamp = new Date().toISOString();

  let statusCode = err.statusCode || 500;
  let status = err.status || AppStatus.INTERNAL_ERROR;
  let message = err.message || "An unexpected error occurred";
  let errors = null;

  if (err instanceof ZodError) {
    statusCode = 400;
    status = AppStatus.VALIDATION_ERROR;
    message = "Validation failed";
    errors = err.issues.map((issue) => ({
      field: issue.path.length > 0 ? issue.path.join(".") : "body",
      message: issue.message,
    }));
  }

  const errorResponse = {
    status,
    message,
    data: null,
    errors,
    meta: {
      requestId,
      timestamp,
    },
  };

  const loggerResponse = {
    ...errorResponse,
    path: req.originalUrl,
    method: req.method,
  };

  appLogger.error(JSON.stringify(loggerResponse));

  return res.status(statusCode).json(errorResponse);
};
