/**
 * Custom error classes and error response formatter for API routes
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
    
    // Set the prototype explicitly to ensure instanceof works correctly
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Validation error for invalid input data
 */
export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]> = {}) {
    super(message, 400);
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Not found error for missing resources
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Unauthorized error for authentication failures
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Forbidden error for authorization failures
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * Error response format for API routes
 */
export interface ErrorResponse {
  error: {
    message: string;
    statusCode: number;
    errors?: Record<string, string[]>;
  };
}

/**
 * Format error for API response
 * Converts various error types into a consistent JSON response format
 */
export function formatErrorResponse(error: unknown): ErrorResponse {
  // Handle custom AppError instances
  if (error instanceof ValidationError) {
    return {
      error: {
        message: error.message,
        statusCode: error.statusCode,
        errors: error.errors,
      },
    };
  }

  if (error instanceof AppError) {
    return {
      error: {
        message: error.message,
        statusCode: error.statusCode,
      },
    };
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return {
      error: {
        message: error.message,
        statusCode: 500,
      },
    };
  }

  // Handle unknown error types
  return {
    error: {
      message: 'An unexpected error occurred',
      statusCode: 500,
    },
  };
}

/**
 * Create a NextResponse with error formatting
 * Helper function for API routes to return consistent error responses
 */
export function createErrorResponse(error: unknown): Response {
  const errorResponse = formatErrorResponse(error);
  const statusCode = errorResponse.error.statusCode;

  return new Response(JSON.stringify(errorResponse), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
