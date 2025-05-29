import dotenv from 'dotenv';
import { ResetPasswordResponse, UserResponse } from '../models/auth.model';
import jwt, { SignOptions } from 'jsonwebtoken';
import { ResponseError } from '../types/response.error';
dotenv.config();

// JWT configuration
export const jwtConfig = {
    accessToken: {
        secret: process.env.ACCESS_TOKEN_SECRET! || 'access-token-secret',
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN! || '15m',
    },
    refreshToken: {
        secret: process.env.REFRESH_TOKEN_SECRET || 'refresh-token-secret',
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    },
    resetToken: {
        secret: process.env.RESET_TOKEN_SECRET || 'RESET-token-secret',
        expiresIn: process.env.RESET_TOKEN_EXPIRES_IN || '10m',
    }
}

export const generateAccessToken = (user: UserResponse): string => {
    const options: SignOptions = { expiresIn: jwtConfig.accessToken.expiresIn as jwt.SignOptions['expiresIn'] }; // Short-lived access token
    return jwt.sign(user, jwtConfig.accessToken.secret, options);
}

export const generateRefreshToken = (user: UserResponse): string => {
    const options: SignOptions = { expiresIn: jwtConfig.refreshToken.expiresIn as jwt.SignOptions['expiresIn'] }; // Short-lived access token
    return jwt.sign(user, jwtConfig.refreshToken.secret, options);
};

export const generateResetToken = (user: ResetPasswordResponse): string => {
    const options: SignOptions = { expiresIn: jwtConfig.resetToken.expiresIn as jwt.SignOptions['expiresIn'] }; // Short-lived access token
    return jwt.sign(user, jwtConfig.resetToken.secret, options);
};

export const verifyAccessToken = (token: string): UserResponse => {
    try {
        return jwt.verify(token, jwtConfig.accessToken.secret) as UserResponse;
    } catch (error) {
        throw new ResponseError(403, 'Unauthorized', {
            error: ['Unauthorized']
        });
    }
}

export function verifyResetToken(token: string): ResetPasswordResponse {
    try {
        return jwt.verify(token, jwtConfig.resetToken.secret) as ResetPasswordResponse;
    } catch (error) {
        throw new ResponseError(400, 'Invalid or expired reset token', {
            error: ['Invalid or expired reset token']
        });
    }
}