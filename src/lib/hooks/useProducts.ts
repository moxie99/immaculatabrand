/**
 * useProducts Hook
 * 
 * Custom React hook for fetching products from the API with caching,
 * pagination, and filtering support using SWR.
 */

import useSWR from 'swr';
import { useState, useMemo } from 'react';
import { Product, Category } from '@/types/product.types';
import { PaginatedResponse } from '@/types/api.types';

/**
 * Filter options for products
 */
export interface ProductFilters {
  category?: Category;
  featured?: boolean;
  search?: string;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Hook options
 */
export interface UseProductsOptions {
  filters?: ProductFilters;
  pagination?: PaginationOptions;
  // SWR revalidation options
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  refreshInterval?: number;
}

/**
 * Hook return type
 */
export interface UseProductsReturn {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  // Pagination controls
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  // Filter controls
  setCategory: (category: Category | undefined) => void;
  setFeatured: (featured: boolean | undefined) => void;
  setSearch: (search: string | undefined) => void;
  // Utility
  mutate: () => void;
}

/**
 * Fetcher function for SWR
 * Exported for testing purposes
 */
export const fetcher = async (url: string): Promise<PaginatedResponse<Product>> => {
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch products');
  }
  
  return response.json();
};

/**
 * Build query string from filters and pagination
 * Exported for testing purposes
 */
export function buildQueryString(
  filters: ProductFilters,
  pagination: PaginationOptions
): string {
  const params = new URLSearchParams();
  
  // Add pagination params
  if (pagination.page) {
    params.append('page', pagination.page.toString());
  }
  if (pagination.limit) {
    params.append('limit', pagination.limit.toString());
  }
  
  // Add filter params
  if (filters.category) {
    params.append('category', filters.category);
  }
  if (filters.featured !== undefined) {
    params.append('featured', filters.featured.toString());
  }
  if (filters.search) {
    params.append('search', filters.search);
  }
  
  return params.toString();
}

/**
 * useProducts Hook
 * 
 * Fetches products from the API with caching, pagination, and filtering.
 * 
 * @example
 * ```tsx
 * const { products, isLoading, nextPage, setCategory } = useProducts({
 *   filters: { category: 'confectionary' },
 *   pagination: { page: 1, limit: 12 }
 * });
 * ```
 */
export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const {
    filters: initialFilters = {},
    pagination: initialPagination = { page: 1, limit: 12 },
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    refreshInterval,
  } = options;
  
  // State for filters and pagination
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [pagination, setPagination] = useState<PaginationOptions>(initialPagination);
  
  // Build API URL with query parameters
  const queryString = useMemo(
    () => buildQueryString(filters, pagination),
    [filters, pagination]
  );
  
  const url = `/api/products${queryString ? `?${queryString}` : ''}`;
  
  // Fetch data with SWR
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Product>>(
    url,
    fetcher,
    {
      revalidateOnFocus,
      revalidateOnReconnect,
      refreshInterval,
      // Keep previous data while fetching new data
      keepPreviousData: true,
    }
  );
  
  // Extract data from response
  const products = data?.data || [];
  const paginationData = data?.pagination || {
    total: 0,
    page: pagination.page || 1,
    limit: pagination.limit || 12,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };
  
  // Pagination controls
  const nextPage = () => {
    if (paginationData.hasNextPage) {
      setPagination((prev) => ({
        ...prev,
        page: (prev.page || 1) + 1,
      }));
    }
  };
  
  const prevPage = () => {
    if (paginationData.hasPrevPage) {
      setPagination((prev) => ({
        ...prev,
        page: Math.max((prev.page || 1) - 1, 1),
      }));
    }
  };
  
  const goToPage = (page: number) => {
    if (page >= 1 && page <= paginationData.totalPages) {
      setPagination((prev) => ({
        ...prev,
        page,
      }));
    }
  };
  
  // Filter controls
  const setCategory = (category: Category | undefined) => {
    setFilters((prev) => ({ ...prev, category }));
    // Reset to first page when filter changes
    setPagination((prev) => ({ ...prev, page: 1 }));
  };
  
  const setFeatured = (featured: boolean | undefined) => {
    setFilters((prev) => ({ ...prev, featured }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };
  
  const setSearch = (search: string | undefined) => {
    setFilters((prev) => ({ ...prev, search }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };
  
  return {
    products,
    total: paginationData.total,
    page: paginationData.page,
    limit: paginationData.limit,
    totalPages: paginationData.totalPages,
    hasNextPage: paginationData.hasNextPage,
    hasPrevPage: paginationData.hasPrevPage,
    isLoading,
    isError: !!error,
    error,
    nextPage,
    prevPage,
    goToPage,
    setCategory,
    setFeatured,
    setSearch,
    mutate,
  };
}
