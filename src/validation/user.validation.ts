import { z, ZodType } from "zod";

export class UserValidation {
    static readonly CREATE: ZodType = z.object({
        name: z.string().min(5),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(["USER", "ADMIN"]).default("USER"),
    });

    static readonly UPDATE: ZodType = z.object({
        name: z.string().min(5).optional(),
        email: z.string().email().optional(),
        password: z.string().min(6).optional(),
    });
}