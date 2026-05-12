import { ZodType, ZodError } from "zod";
import { ValidationError } from "../utils/app-error.util";

export class Validation {
  static validate<T>(schema: ZodType, data: T): T {
    try {
      return schema.parse(data) as T;
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZodError(error);
      }
      throw error;
    }
  }
}
