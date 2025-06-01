import rateLimit from 'express-rate-limit';
import { Response } from 'express';
import logger from '../config/logger';
import { UserRequest } from '../types/user';

// Default rate limit configuration
const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const DEFAULT_MAX_REQUESTS = 100; // 100 requests per windowMs

export const createRateLimiter = (
    windowMs: number = DEFAULT_WINDOW_MS,
    max: number = DEFAULT_MAX_REQUESTS
) => {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers

        // Custom handler for when rate limit is exceeded
        handler: (req: UserRequest, res: Response) => {
            logger.warn(`Rate limit exceeded for IP: ${req.ip}`);

            res.status(429).json({
                success: false,
                message: 'Too many requests, please try again later.',
                errors: {
                    rateLimit: ['Rate limit exceeded. Please try again later.']
                }
            });
        },

        // Store client ID to track rate limiting
        keyGenerator: (req: any) => {
            const userReq = req as UserRequest;
            // Use user ID if authenticated, otherwise use IP
            return req.user?.id?.toString() || req.ip;
        },
    });
};

// Different rate limiters for different routes
export const apiLimiter = createRateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes
export const authLimiter = createRateLimiter(15 * 60 * 1000, 10); // 10 requests per 15 minutes for auth routes
export const sensitiveActionsLimiter = createRateLimiter(60 * 60 * 1000, 5); // 5 requests per hour for password reset