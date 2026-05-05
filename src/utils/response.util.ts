import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { AppStatus } from "../types/app.type";

export const response_handler = (
  res: Response,
  statusCode: number,
  status: string,
  message = "",
  data?: unknown,
  errors?: unknown,
  pagination?: unknown,
): Response => {
  const requestId = res.locals.requestId || uuidv4();
  res.locals.requestId = requestId;

  const response: any = {
    status,
    message,
    ...(data !== undefined && data !== null ? { data } : {}),
    ...(errors !== undefined && errors !== null ? { errors } : {}),
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
      ...(pagination ? { pagination } : {}),
    },
  };

  return res.status(statusCode).json(response);
};

export const response_success = (
  res: Response,
  statusCode: number,
  status: string = AppStatus.SUCCESS,
  message = "",
  data?: unknown,
): Response => {
  return response_handler(res, statusCode, status, message, data);
};

export const response_paginated = (
  res: Response,
  statusCode: number,
  status: string = AppStatus.SUCCESS,
  message = "",
  data?: unknown,
  pagination?: unknown,
) => {
  return response_handler(
    res,
    statusCode,
    status,
    message,
    data,
    undefined,
    pagination,
  );
};

export const response_error = (
  res: Response,
  statusCode: number,
  status: string = AppStatus.INTERNAL_ERROR,
  message = "",
  errors?: unknown,
): Response => {
  return response_handler(res, statusCode, status, message, undefined, errors);
};
