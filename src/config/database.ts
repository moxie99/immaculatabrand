/**
 * Database configuration for MongoDB
 * Provides connection options and database-related constants
 */

import mongoose from 'mongoose';

/**
 * MongoDB connection options
 * Configures connection pooling, timeouts, and other connection parameters
 */
export const MONGODB_OPTIONS: mongoose.ConnectOptions = {
  maxPoolSize: 10, // Maximum number of connections in the pool
  minPoolSize: 2, // Minimum number of connections in the pool
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  serverSelectionTimeoutMS: 10000, // Timeout for server selection (10 seconds)
  family: 4, // Use IPv4, skip trying IPv6
};

/**
 * Database retry configuration
 * Used for connection retry logic
 */
export const DB_RETRY_CONFIG = {
  MAX_RETRIES: 3, // Maximum number of connection retry attempts
  INITIAL_DELAY: 1000, // Initial delay in milliseconds before first retry
  BACKOFF_MULTIPLIER: 2, // Exponential backoff multiplier
} as const;

/**
 * Database collection names
 * Centralized collection name constants
 */
export const COLLECTIONS = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  MEDIA: 'media',
  CONTENT: 'content',
} as const;

/**
 * Database index configurations
 * Defines which fields should be indexed for performance
 */
export const INDEX_CONFIGS = {
  PRODUCTS: {
    slug: { unique: true },
    category: { unique: false },
    isFeatured_isActive: { compound: ['isFeatured', 'isActive'] },
    name: { text: true },
  },
  ORDERS: {
    orderNumber: { unique: true },
    customerEmail: { unique: false },
    status: { unique: false },
    createdAt: { descending: true },
  },
  MEDIA: {
    cloudinaryId: { unique: true },
    type: { unique: false },
    createdAt: { descending: true },
  },
  CONTENT: {
    key: { unique: true },
  },
} as const;

/**
 * Database connection states
 * Maps Mongoose connection states to readable strings
 */
export const CONNECTION_STATES: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
} as const;

/**
 * Database operation timeouts (in milliseconds)
 */
export const DB_TIMEOUTS = {
  QUERY: 30000, // 30 seconds for queries
  TRANSACTION: 60000, // 60 seconds for transactions
  AGGREGATION: 120000, // 2 minutes for aggregations
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
} as const;

/**
 * Helper function to get connection state name
 */
export function getConnectionStateName(state: number): string {
  return CONNECTION_STATES[state] || 'unknown';
}

/**
 * Helper function to validate pagination parameters
 */
export function validatePagination(page?: number, limit?: number): {
  page: number;
  limit: number;
} {
  const validPage = Math.max(1, page || PAGINATION.DEFAULT_PAGE);
  const validLimit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, limit || PAGINATION.DEFAULT_LIMIT)
  );
  
  return { page: validPage, limit: validLimit };
}

/**
 * Helper function to calculate skip value for pagination
 */
export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}
