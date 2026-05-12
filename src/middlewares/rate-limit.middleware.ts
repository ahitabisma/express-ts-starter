import rateLimit from "express-rate-limit";
import { AppStatus } from "../types/app.type";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req: Request, res: Response) => {
    const requestId = res.locals.requestId || uuidv4();
    res.locals.requestId = requestId;

    return res.status(429).json({
      status: AppStatus.TOO_MANY_REQUESTS,
      message: "Too many requests, please try again later.",
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        retryAfter:
          Math.ceil(
            (req.rateLimit?.resetTime?.getTime() || 0 - Date.now()) / 1000,
          ) || null,
        limit: req.rateLimit?.limit,
        remaining: req.rateLimit?.remaining,
      },
    });
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,

  handler: (req: Request, res: Response) => {
    const requestId = res.locals.requestId || uuidv4();
    res.locals.requestId = requestId;

    return res.status(429).json({
      status: AppStatus.TOO_MANY_REQUESTS,
      message: "Too many authentication attempts, please try again later.",
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        retryAfter:
          Math.ceil(
            (req.rateLimit?.resetTime?.getTime() || 0 - Date.now()) / 1000,
          ) || null,
        limit: req.rateLimit?.limit,
        remaining: req.rateLimit?.remaining,
      },
    });
  },
});
