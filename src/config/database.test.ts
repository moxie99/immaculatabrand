import { describe, it, expect } from 'vitest';
import {
  MONGODB_OPTIONS,
  DB_RETRY_CONFIG,
  COLLECTIONS,
  INDEX_CONFIGS,
  CONNECTION_STATES,
  DB_TIMEOUTS,
  PAGINATION,
  getConnectionStateName,
  validatePagination,
  calculateSkip,
} from './database';

describe('database configuration', () => {
  describe('MONGODB_OPTIONS', () => {
    it('should have correct connection pool settings', () => {
      expect(MONGODB_OPTIONS.maxPoolSize).toBe(10);
      expect(MONGODB_OPTIONS.minPoolSize).toBe(2);
    });

    it('should have timeout settings', () => {
      expect(MONGODB_OPTIONS.socketTimeoutMS).toBe(45000);
      expect(MONGODB_OPTIONS.serverSelectionTimeoutMS).toBe(10000);
    });

    it('should use IPv4', () => {
      expect(MONGODB_OPTIONS.family).toBe(4);
    });
  });

  describe('DB_RETRY_CONFIG', () => {
    it('should have retry configuration', () => {
      expect(DB_RETRY_CONFIG.MAX_RETRIES).toBe(3);
      expect(DB_RETRY_CONFIG.INITIAL_DELAY).toBe(1000);
      expect(DB_RETRY_CONFIG.BACKOFF_MULTIPLIER).toBe(2);
    });
  });

  describe('COLLECTIONS', () => {
    it('should have all collection names', () => {
      expect(COLLECTIONS.PRODUCTS).toBe('products');
      expect(COLLECTIONS.ORDERS).toBe('orders');
      expect(COLLECTIONS.MEDIA).toBe('media');
      expect(COLLECTIONS.CONTENT).toBe('content');
    });
  });

  describe('INDEX_CONFIGS', () => {
    it('should have product indexes', () => {
      expect(INDEX_CONFIGS.PRODUCTS.slug.unique).toBe(true);
      expect(INDEX_CONFIGS.PRODUCTS.category.unique).toBe(false);
      expect(INDEX_CONFIGS.PRODUCTS.name.text).toBe(true);
    });

    it('should have order indexes', () => {
      expect(INDEX_CONFIGS.ORDERS.orderNumber.unique).toBe(true);
      expect(INDEX_CONFIGS.ORDERS.customerEmail.unique).toBe(false);
      expect(INDEX_CONFIGS.ORDERS.status.unique).toBe(false);
      expect(INDEX_CONFIGS.ORDERS.createdAt.descending).toBe(true);
    });

    it('should have media indexes', () => {
      expect(INDEX_CONFIGS.MEDIA.cloudinaryId.unique).toBe(true);
      expect(INDEX_CONFIGS.MEDIA.type.unique).toBe(false);
      expect(INDEX_CONFIGS.MEDIA.createdAt.descending).toBe(true);
    });

    it('should have content indexes', () => {
      expect(INDEX_CONFIGS.CONTENT.key.unique).toBe(true);
    });
  });

  describe('CONNECTION_STATES', () => {
    it('should map connection states correctly', () => {
      expect(CONNECTION_STATES[0]).toBe('disconnected');
      expect(CONNECTION_STATES[1]).toBe('connected');
      expect(CONNECTION_STATES[2]).toBe('connecting');
      expect(CONNECTION_STATES[3]).toBe('disconnecting');
    });
  });

  describe('DB_TIMEOUTS', () => {
    it('should have timeout values', () => {
      expect(DB_TIMEOUTS.QUERY).toBe(30000);
      expect(DB_TIMEOUTS.TRANSACTION).toBe(60000);
      expect(DB_TIMEOUTS.AGGREGATION).toBe(120000);
    });
  });

  describe('PAGINATION', () => {
    it('should have pagination defaults', () => {
      expect(PAGINATION.DEFAULT_PAGE).toBe(1);
      expect(PAGINATION.DEFAULT_LIMIT).toBe(12);
      expect(PAGINATION.MAX_LIMIT).toBe(100);
    });
  });

  describe('getConnectionStateName', () => {
    it('should return correct state names', () => {
      expect(getConnectionStateName(0)).toBe('disconnected');
      expect(getConnectionStateName(1)).toBe('connected');
      expect(getConnectionStateName(2)).toBe('connecting');
      expect(getConnectionStateName(3)).toBe('disconnecting');
    });

    it('should return unknown for invalid states', () => {
      expect(getConnectionStateName(99)).toBe('unknown');
      expect(getConnectionStateName(-1)).toBe('unknown');
    });
  });

  describe('validatePagination', () => {
    it('should return defaults when no parameters provided', () => {
      const result = validatePagination();
      expect(result.page).toBe(1);
      expect(result.limit).toBe(12);
    });

    it('should accept valid pagination parameters', () => {
      const result = validatePagination(2, 20);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
    });

    it('should enforce minimum page of 1', () => {
      expect(validatePagination(0, 10).page).toBe(1);
      expect(validatePagination(-5, 10).page).toBe(1);
    });

    it('should enforce maximum limit', () => {
      expect(validatePagination(1, 200).limit).toBe(100);
      expect(validatePagination(1, 150).limit).toBe(100);
    });

    it('should handle invalid limit values correctly', () => {
      // When 0 is passed (falsy), it uses DEFAULT_LIMIT (12)
      expect(validatePagination(1, 0).limit).toBe(12);
      // When negative is passed (truthy), Math.max enforces minimum of 1
      expect(validatePagination(1, -10).limit).toBe(1);
    });

    it('should handle undefined values', () => {
      const result = validatePagination(undefined, undefined);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(12);
    });
  });

  describe('calculateSkip', () => {
    it('should calculate skip correctly for page 1', () => {
      expect(calculateSkip(1, 12)).toBe(0);
    });

    it('should calculate skip correctly for page 2', () => {
      expect(calculateSkip(2, 12)).toBe(12);
    });

    it('should calculate skip correctly for page 3', () => {
      expect(calculateSkip(3, 12)).toBe(24);
    });

    it('should calculate skip with different limit', () => {
      expect(calculateSkip(1, 20)).toBe(0);
      expect(calculateSkip(2, 20)).toBe(20);
      expect(calculateSkip(3, 20)).toBe(40);
    });

    it('should handle large page numbers', () => {
      expect(calculateSkip(100, 10)).toBe(990);
    });
  });
});
