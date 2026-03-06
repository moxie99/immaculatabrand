/**
 * API response type definitions
 * Standard response formats for all API endpoints
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  error?: ApiError;
}

/**
 * API error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  fields?: FieldError[];
}

/**
 * Field-specific validation error
 */
export interface FieldError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Query parameters for pagination
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  skip?: number;
}

/**
 * Query parameters for filtering products
 */
export interface ProductFilterParams extends PaginationParams {
  category?: string;
  featured?: boolean;
  active?: boolean;
  search?: string;
}

/**
 * Query parameters for filtering orders
 */
export interface OrderFilterParams extends PaginationParams {
  status?: string;
  customerEmail?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Query parameters for filtering media
 */
export interface MediaFilterParams extends PaginationParams {
  type?: string;
}
