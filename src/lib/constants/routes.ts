/**
 * Route constants for the Confectionary Platform
 * Centralized route paths to avoid magic strings throughout the codebase
 */

/**
 * Public routes accessible without authentication
 */
export const PUBLIC_ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  ABOUT: '/about',
  CONTACT: '/contact',
} as const;

/**
 * Admin routes (protected by authentication middleware)
 */
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin',
  PRODUCTS: '/admin/products',
  PRODUCT_NEW: '/admin/products/new',
  PRODUCT_EDIT: (id: string) => `/admin/products/${id}/edit`,
  ORDERS: '/admin/orders',
  ORDER_DETAIL: (id: string) => `/admin/orders/${id}`,
  MEDIA: '/admin/media',
  CONTENT: '/admin/content',
} as const;

/**
 * API routes for data operations
 */
export const API_ROUTES = {
  // Product endpoints
  PRODUCTS: '/api/products',
  PRODUCT_BY_ID: (id: string) => `/api/products/${id}`,
  PRODUCTS_CATEGORIES: '/api/products/categories',
  PRODUCTS_FEATURED: '/api/products/featured',
  
  // Order endpoints
  ORDERS: '/api/orders',
  ORDER_BY_ID: (id: string) => `/api/orders/${id}`,
  
  // Media endpoints
  MEDIA_UPLOAD: '/api/media/upload',
  MEDIA_BY_TYPE: (type: string) => `/api/media/${type}`,
  MEDIA_DELETE: (cloudinaryId: string) => `/api/media/delete/${encodeURIComponent(cloudinaryId)}`,
  
  // Content endpoints
  CONTENT: '/api/content',
} as const;

/**
 * Route matcher patterns for middleware
 */
export const ROUTE_PATTERNS = {
  ADMIN: '/admin/:path*',
  API: '/api/:path*',
  PUBLIC: '/:path*',
} as const;
