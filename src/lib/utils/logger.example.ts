// @ts-nocheck
/**
 * Logger Usage Examples
 * 
 * This file demonstrates how to use the logger utility throughout the application.
 */

import { logger } from './logger';

// ============================================================================
// Basic Usage
// ============================================================================

// Log different severity levels
logger.error('Database connection failed');
logger.warn('API rate limit approaching');
logger.info('User logged in successfully');
logger.debug('Processing request payload');

// ============================================================================
// With Additional Context
// ============================================================================

// Add context data for better debugging
logger.error('Failed to create product', {
  productId: 'prod-123',
  error: 'Validation failed',
  userId: 'user-456',
});

logger.info('Product updated', {
  productId: 'prod-789',
  changes: ['price', 'description'],
  updatedBy: 'admin',
});

// ============================================================================
// Request ID Tracking (for API routes)
// ============================================================================

// In API routes, create a child logger with request ID
export function exampleApiRoute(requestId: string) {
  const requestLogger = logger.withRequestId(requestId);
  
  requestLogger.info('Processing order creation');
  
  try {
    // ... business logic
    requestLogger.info('Order created successfully', {
      orderId: 'ord-001',
      customerId: 'cust-123',
    });
  } catch (error) {
    requestLogger.error('Order creation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      customerId: 'cust-123',
    });
  }
}

// ============================================================================
// Service Layer Usage
// ============================================================================

export class ProductService {
  async createProduct(data: any) {
    logger.info('Creating new product', {
      name: data.name,
      category: data.category,
    });
    
    try {
      // ... database operation
      logger.info('Product created successfully', {
        productId: 'prod-new',
      });
    } catch (error) {
      logger.error('Failed to create product', {
        error: error instanceof Error ? error.message : 'Unknown error',
        data,
      });
      throw error;
    }
  }
}

// ============================================================================
// Middleware Usage (with request ID)
// ============================================================================

export function loggingMiddleware(req: any, res: any, next: any) {
  const requestId = req.headers['x-request-id'] || `req-${Date.now()}`;
  const requestLogger = logger.withRequestId(requestId);
  
  requestLogger.info('Incoming request', {
    method: req.method,
    path: req.path,
    userAgent: req.headers['user-agent'],
  });
  
  // Attach logger to request for use in handlers
  req.logger = requestLogger;
  
  next();
}

// ============================================================================
// Environment Configuration
// ============================================================================

// Set log level via environment variable:
// LOG_LEVEL=error   - Only errors
// LOG_LEVEL=warn    - Errors and warnings
// LOG_LEVEL=info    - Errors, warnings, and info (default in production)
// LOG_LEVEL=debug   - All logs (default in development)

// Example .env.local:
// LOG_LEVEL=debug
// NODE_ENV=development

// Example .env.production:
// LOG_LEVEL=info
// NODE_ENV=production
