import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ValidationError, ErrorCode, ErrorDetails } from '../core/types/errors';

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ErrorDetails[];
    timestamp: string;
    path: string;
    method: string;
    stack?: string;
  };
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const handleZodError = (error: ZodError): ValidationError => {
  const details: ErrorDetails[] = error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
    code: issue.code
  }));

  return new ValidationError('Validation failed', details);
};

const handleUnknownError = (error: any): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    return handleZodError(error);
  }
  if (error instanceof Error) {
    return new AppError(
      error.message || 'Internal server error',
      500,
      ErrorCode.INTERNAL_SERVER_ERROR,
      false
    );
  }

  return new AppError(
    'An unexpected error occurred',
    500,
    ErrorCode.INTERNAL_SERVER_ERROR,
    false
  );
};

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const appError = handleUnknownError(error);
  
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      details: appError.details,
      timestamp: appError.timestamp,
      path: req.path,
      method: req.method
    }
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = appError.stack;
  }
  if (!appError.isOperational) {
    console.error('💥 UNEXPECTED ERROR:', {
      message: appError.message,
      stack: appError.stack,
      timestamp: appError.timestamp,
      path: req.path,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query
    });
  } else {
    console.warn('⚠️ OPERATIONAL ERROR:', {
      code: appError.code,
      message: appError.message,
      path: req.path,
      method: req.method
    });
  }

  res.status(appError.statusCode).json(errorResponse);
};


export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(
    `Route ${req.method} ${req.path} not found`,
    404,
    ErrorCode.NOT_FOUND
  );
  
  next(error);
};

// // Middleware para manejar errores de proceso no capturados
// export const setupGlobalErrorHandlers = (): void => {
//   process.on('uncaughtException', (error: Error) => {
//     console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
//     console.error('Error:', error.name, error.message);
//     console.error('Stack:', error.stack);
//     process.exit(1);
//   });

//   process.on('unhandledRejection', (reason: any) => {
//     console.error('💥 UNHANDLED REJECTION! Shutting down...');
//     console.error('Reason:', reason);
//     process.exit(1);
//   });
// };
