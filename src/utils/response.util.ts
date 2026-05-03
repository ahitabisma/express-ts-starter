import { Response } from "express";
import { v4 as uuidv4 } from "uuid";

export const response_handler = (
  res: Response,
  statusCode: number,
  status: string,
  message = "",
  data: unknown = null,
  errors: any = null,
): Response => {
  // Gunakan ID yang sudah menempel di res.locals agar sinkron dengan log
  const requestId = res.locals.requestId || uuidv4();
  res.locals.requestId = requestId;

  return res.status(statusCode).json({
    status,
    message,
    data: data ?? null,
    errors: errors ?? null,
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
    },
  });
};

export const response_success = (
  res: Response,
  statusCode: number,
  status: string = "SUCCESS",
  message = "",
  data: unknown = null,
): Response => {
  return response_handler(res, statusCode, status, message, data);
};

export const response_error = (
  res: Response,
  statusCode: number,
  status: string = "INTERNAL_ERROR",
  message = "",
  errors: any = null,
): Response => {
  return response_handler(res, statusCode, status, message, null, errors);
};
