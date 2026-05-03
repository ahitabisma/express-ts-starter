import rateLimit from "express-rate-limit";
import { AppStatus } from "../types/app.type";

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: AppStatus.TOO_MANY_REQUESTS,
    message: "Too many requests, please try again later.",
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: AppStatus.TOO_MANY_REQUESTS,
    message: "Too many authentication attempts, please try again later.",
  },
  skipSuccessfulRequests: true,
});
