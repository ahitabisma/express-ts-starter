// Contoh implementasi ResponseError yang diperbarui
export class ResponseError extends Error {
    status: number;
    success: boolean;
    errors?: Record<string, string[]>;

    constructor(status: number, message: string, errors?: Record<string, string[]>) {
        super(message);
        this.status = status;
        this.success = false;
        this.errors = errors;
    }
}