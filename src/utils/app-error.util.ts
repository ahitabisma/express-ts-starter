import { ZodError } from "zod";

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    status: string = "INTERNAL_ERROR",
  ) {
    super(message);

    this.statusCode = statusCode;
    this.status = status;
    this.isOperational = true;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly errors: ValidationErrorDetail[];

  constructor(
    errors: ValidationErrorDetail[],
    message: string = "Validation failed",
  ) {
    super(message, 400, "VALIDATION_ERROR");
    this.errors = errors;

    Object.setPrototypeOf(this, ValidationError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static fromZodError(error: ZodError): ValidationError {
    const errors: ValidationErrorDetail[] = error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return new ValidationError(errors, "Validation failed");
  }
}
