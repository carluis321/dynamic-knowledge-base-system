import { 
  AppError, 
  ValidationError, 
  NotFoundError, 
  UnauthorizedError, 
  ForbiddenError, 
  ConflictError, 
  BadRequestError,
  ErrorDetails 
} from '../types/errors';

export const createValidationError = (message: string, details?: ErrorDetails[]): ValidationError => {
  return new ValidationError(message, details);
};

export const createNotFoundError = (resource?: string): NotFoundError => {
  const message = resource ? `${resource} not found` : 'Resource not found';
  return new NotFoundError(message);
};

export const createUnauthorizedError = (message?: string): UnauthorizedError => {
  return new UnauthorizedError(message);
};

export const createForbiddenError = (message?: string): ForbiddenError => {
  return new ForbiddenError(message);
};

export const createConflictError = (resource?: string): ConflictError => {
  const message = resource ? `${resource} already exists` : 'Resource conflict';
  return new ConflictError(message);
};

export const createBadRequestError = (message?: string): BadRequestError => {
  return new BadRequestError(message);
};

export const isOperationalError = (error: any): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

export const getErrorInfo = (error: any) => {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      details: error.details,
      isOperational: error.isOperational,
      timestamp: error.timestamp
    };
  }

  return {
    statusCode: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: error.message || 'An unexpected error occurred',
    isOperational: false,
    timestamp: new Date().toISOString()
  };
};
