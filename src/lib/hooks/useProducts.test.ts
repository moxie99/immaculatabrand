/**
 * Tests for useProducts hook
 * 
 * Note: These are unit tests for the hook's utility functions and logic.
 * For full integration tests with React rendering, use a separate test suite
 * with jsdom environment.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Product } from '@/types/product.types';
import { PaginatedResponse } from '@/types/api.types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Sample product data
const mockProducts: Product[] = [
  {
    _id: '1',
    name: 'Nigerian Chin Chin',
    slug: 'nigerian-chin-chin',
    category: 'confectionary',
    description: 'Crunchy fried snack',
    price: 599,
    currency: 'GBP',
    images: ['https://res.cloudinary.com/test/image1.jpg'],
    preparationSteps: [],
    isFeatured: true,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    _id: '2',
    name: 'Smoked Catfish',
    slug: 'smoked-catfish',
    category: 'fish',
    description: 'Premium smoked catfish',
    price: 1299,
    currency: 'GBP',
    images: ['https://res.cloudinary.com/test/image2.jpg'],
    preparationSteps: [],
    isFeatured: false,
    isActive: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
];

const mockPaginatedResponse: PaginatedResponse<Product> = {
  success: true,
  data: mockProducts,
  pagination: {
    total: 2,
    page: 1,
    limit: 12,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

// Import the internal functions we want to test
// We'll export them from the hook file for testing purposes
import { buildQueryString, fetcher } from './useProducts';

describe('useProducts - Query String Building', () => {
  it('should build query string with pagination only', () => {
    const queryString = buildQueryString({}, { page: 1, limit: 12 });
    expect(queryString).toBe('page=1&limit=12');
  });

  it('should build query string with category filter', () => {
    const queryString = buildQueryString(
      { category: 'confectionary' },
      { page: 1, limit: 12 }
    );
    expect(queryString).toContain('category=confectionary');
    expect(queryString).toContain('page=1');
    expect(queryString).toContain('limit=12');
  });

  it('should build query string with featured filter', () => {
    const queryString = buildQueryString(
      { featured: true },
      { page: 1, limit: 12 }
    );
    expect(queryString).toContain('featured=true');
  });

  it('should build query string with search term', () => {
    const queryString = buildQueryString(
      { search: 'chin chin' },
      { page: 1, limit: 12 }
    );
    expect(queryString).toContain('search=chin+chin');
  });

  it('should build query string with all filters', () => {
    const queryString = buildQueryString(
      {
        category: 'fish',
        featured: true,
        search: 'smoked',
      },
      { page: 2, limit: 10 }
    );
    expect(queryString).toContain('page=2');
    expect(queryString).toContain('limit=10');
    expect(queryString).toContain('category=fish');
    expect(queryString).toContain('featured=true');
    expect(queryString).toContain('search=smoked');
  });

  it('should omit undefined filter values', () => {
    const queryString = buildQueryString(
      {
        category: undefined,
        featured: undefined,
        search: undefined,
      },
      { page: 1, limit: 12 }
    );
    expect(queryString).not.toContain('category=');
    expect(queryString).not.toContain('featured=');
    expect(queryString).not.toContain('search=');
  });
});

describe('useProducts - Fetcher Function', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should fetch and return data successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPaginatedResponse,
    });

    const result = await fetcher('/api/products');

    expect(mockFetch).toHaveBeenCalledWith('/api/products');
    expect(result).toEqual(mockPaginatedResponse);
  });

  it('should throw error when response is not ok', async () => {
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch products',
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => errorResponse,
    });

    await expect(fetcher('/api/products')).rejects.toThrow(
      'Failed to fetch products'
    );
  });

  it('should throw generic error when error message is not provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false }),
    });

    await expect(fetcher('/api/products')).rejects.toThrow(
      'Failed to fetch products'
    );
  });
});

describe('useProducts - Integration', () => {
  it('should export useProducts hook', async () => {
    // This test just verifies the hook is exported
    const { useProducts } = await import('./useProducts');
    expect(useProducts).toBeDefined();
    expect(typeof useProducts).toBe('function');
  });
});
