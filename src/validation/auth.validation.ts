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
}