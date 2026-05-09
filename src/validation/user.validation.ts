import z, { ZodType } from "zod";

export class UserValidation {
  static readonly UPDATE_PROFILE: ZodType = z.object({
    fullName: z.string().min(3, "Full name must be at least 3 characters long").optional(),
    email: z.string().email("Invalid email address").optional(),
  });
}
