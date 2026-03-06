/**
 * Unit tests for error handling utilities
 */

import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  formatErrorResponse,
  createErrorResponse,
} from './errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an AppError with default values', () => {
      const error = new AppError('Test error');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });

    it('should create an AppError with custom status code', () => {
      const error = new AppError('Custom error', 418);
      
      expect(error.statusCode).toBe(418);
      expect(error.message).toBe('Custom error');
    });

    it('should create an AppError with custom operational flag', () => {
      const error = new AppError('Non-operational error', 500, false);
      
      expect(error.isOperational).toBe(false);
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError with 400 status code', () => {
      const error = new ValidationError('Validation failed');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Validation failed');
      expect(error.errors).toEqual({});
    });

    it('should create a ValidationError with field errors', () => {
      const fieldErrors = {
        email: ['Invalid email format'],
        name: ['Name is required', 'Name must be at least 2 characters'],
      };
      const error = new ValidationError('Validation failed', fieldErrors);
      
      expect(error.errors).toEqual(fieldErrors);
    });
  });

  describe('NotFoundError', () => {
    it('should create a NotFoundError with default message', () => {
      const error = new NotFoundError();
      
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
    });

    it('should create a NotFoundError with custom message', () => {
      const error = new NotFoundError('Product not found');
      
      expect(error.message).toBe('Product not found');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('UnauthorizedError', () => {
    it('should create an UnauthorizedError with default message', () => {
      const error = new UnauthorizedError();
      
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(UnauthorizedError);
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Unauthorized');
    });

    it('should create an UnauthorizedError with custom message', () => {
      const error = new UnauthorizedError('Invalid credentials');
      
      expect(error.message).toBe('Invalid credentials');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('ForbiddenError', () => {
    it('should create a ForbiddenError with default message', () => {
      const error = new ForbiddenError();
      
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ForbiddenError);
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Forbidden');
    });

    it('should create a ForbiddenError with custom message', () => {
      const error = new ForbiddenError('Access denied');
      
      expect(error.message).toBe('Access denied');
      expect(error.statusCode).toBe(403);
    });
  });
});

describe('formatErrorResponse', () => {
  it('should format ValidationError correctly', () => {
    const fieldErrors = {
      email: ['Invalid email format'],
      name: ['Name is required'],
    };
    const error = new ValidationError('Validation failed', fieldErrors);
    const response = formatErrorResponse(error);
    
    expect(response).toEqual({
      error: {
        message: 'Validation failed',
        statusCode: 400,
        errors: fieldErrors,
      },
    });
  });

  it('should format AppError correctly', () => {
    const error = new AppError('Something went wrong', 500);
    const response = formatErrorResponse(error);
    
    expect(response).toEqual({
      error: {
        message: 'Something went wrong',
        statusCode: 500,
      },
    });
  });

  it('should format NotFoundError correctly', () => {
    const error = new NotFoundError('Product not found');
    const response = formatErrorResponse(error);
    
    expect(response).toEqual({
      error: {
        message: 'Product not found',
        statusCode: 404,
      },
    });
  });

  it('should format standard Error correctly', () => {
    const error = new Error('Standard error');
    const response = formatErrorResponse(error);
    
    expect(response).toEqual({
      error: {
        message: 'Standard error',
        statusCode: 500,
      },
    });
  });

  it('should format unknown error types correctly', () => {
    const error = 'String error';
    const response = formatErrorResponse(error);
    
    expect(response).toEqual({
      error: {
        message: 'An unexpected error occurred',
        statusCode: 500,
      },
    });
  });

  it('should format null error correctly', () => {
    const response = formatErrorResponse(null);
    
    expect(response).toEqual({
      error: {
        message: 'An unexpected error occurred',
        statusCode: 500,
      },
    });
  });
});

describe('createErrorResponse', () => {
  it('should create a Response with correct status and body for ValidationError', async () => {
    const fieldErrors = {
      email: ['Invalid email format'],
    };
    const error = new ValidationError('Validation failed', fieldErrors);
    const response = createErrorResponse(error);
    
    expect(response.status).toBe(400);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    
    const body = await response.json();
    expect(body).toEqual({
      error: {
        message: 'Validation failed',
        statusCode: 400,
        errors: fieldErrors,
      },
    });
  });

  it('should create a Response with correct status and body for NotFoundError', async () => {
    const error = new NotFoundError('Product not found');
    const response = createErrorResponse(error);
    
    expect(response.status).toBe(404);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    
    const body = await response.json();
    expect(body).toEqual({
      error: {
        message: 'Product not found',
        statusCode: 404,
      },
    });
  });

  it('should create a Response with 500 status for unknown errors', async () => {
    const error = 'Unknown error';
    const response = createErrorResponse(error);
    
    expect(response.status).toBe(500);
    
    const body = await response.json();
    expect(body).toEqual({
      error: {
        message: 'An unexpected error occurred',
        statusCode: 500,
      },
    });
  });
});
