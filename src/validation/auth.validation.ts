import { token } from "morgan";
import { z, ZodType } from "zod";

export class AuthValidation {
    static readonly REGISTER: ZodType = z.object({
        name: z.string().min(5),
        email: z.string().email(),
        password: z.string().min(6),
    });

    static readonly LOGIN: ZodType = z.object({
        email: z.string().email(),
        password: z.string().min(6),
    });

    static readonly UPDATE_PROFILE: ZodType = z.object({
        name: z.string().optional(),
        password: z.string().min(6).optional(),
        photo: z.string().optional(),
    });

    static readonly SEND_RESET_PASSWORD_EMAIL: ZodType = z.object({
        email: z.string().email(),
    });

    static readonly RESET_PASSWORD: ZodType = z.object({
        token: z.string(),
        password: z.string().min(6),
        confirmPassword: z.string().min(6),
    }).refine((data) => data.password === data.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Passwords do not match',
    });;
}