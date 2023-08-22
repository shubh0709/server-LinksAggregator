import { Response } from "express";

export const throwError = (
  error: any,
  response: Response,
  statusCode: number,
  message: string
) => {
  return response.status(statusCode).json({
    msg: message,
    error,
  });
};

export class CustomError extends Error {
  statusCode: number;
  originalError: any;

  constructor(message: string, statusCode = 500, originalError: any = null) {
    super(message);
    this.statusCode = statusCode;
    this.originalError = originalError;

    // If an original error is provided, capture its stack trace
    if (originalError) {
      this.stack = originalError.stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = this.constructor.name;
  }
}

class NotFoundError extends CustomError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

class UnauthorizedError extends CustomError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

// Example usage

try {
  throw new NotFoundError("User");
} catch (error) {
  if (error instanceof CustomError) {
    console.error(`${error.name}: ${error.message}`);
    console.error(`Status Code: ${error.statusCode}`);
    console.error("Stack Trace:", error.stack);
  }
}
