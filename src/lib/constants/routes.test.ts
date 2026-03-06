import { describe, it, expect } from 'vitest';
import { PUBLIC_ROUTES, ADMIN_ROUTES, API_ROUTES, ROUTE_PATTERNS } from './routes';

describe('routes constants', () => {
  describe('PUBLIC_ROUTES', () => {
    it('should have correct static routes', () => {
      expect(PUBLIC_ROUTES.HOME).toBe('/');
      expect(PUBLIC_ROUTES.PRODUCTS).toBe('/products');
      expect(PUBLIC_ROUTES.ABOUT).toBe('/about');
      expect(PUBLIC_ROUTES.CONTACT).toBe('/contact');
    });

    it('should generate product detail route with id', () => {
      expect(PUBLIC_ROUTES.PRODUCT_DETAIL('123')).toBe('/products/123');
      expect(PUBLIC_ROUTES.PRODUCT_DETAIL('abc-def')).toBe('/products/abc-def');
    });
  });

  describe('ADMIN_ROUTES', () => {
    it('should have correct static admin routes', () => {
      expect(ADMIN_ROUTES.DASHBOARD).toBe('/admin');
      expect(ADMIN_ROUTES.PRODUCTS).toBe('/admin/products');
      expect(ADMIN_ROUTES.PRODUCT_NEW).toBe('/admin/products/new');
      expect(ADMIN_ROUTES.ORDERS).toBe('/admin/orders');
      expect(ADMIN_ROUTES.MEDIA).toBe('/admin/media');
      expect(ADMIN_ROUTES.CONTENT).toBe('/admin/content');
    });

    it('should generate product edit route with id', () => {
      expect(ADMIN_ROUTES.PRODUCT_EDIT('123')).toBe('/admin/products/123/edit');
      expect(ADMIN_ROUTES.PRODUCT_EDIT('abc-def')).toBe('/admin/products/abc-def/edit');
    });

    it('should generate order detail route with id', () => {
      expect(ADMIN_ROUTES.ORDER_DETAIL('123')).toBe('/admin/orders/123');
      expect(ADMIN_ROUTES.ORDER_DETAIL('abc-def')).toBe('/admin/orders/abc-def');
    });
  });

  describe('API_ROUTES', () => {
    it('should have correct product API routes', () => {
      expect(API_ROUTES.PRODUCTS).toBe('/api/products');
      expect(API_ROUTES.PRODUCTS_CATEGORIES).toBe('/api/products/categories');
      expect(API_ROUTES.PRODUCTS_FEATURED).toBe('/api/products/featured');
    });

    it('should generate product by id route', () => {
      expect(API_ROUTES.PRODUCT_BY_ID('123')).toBe('/api/products/123');
    });

    it('should have correct order API routes', () => {
      expect(API_ROUTES.ORDERS).toBe('/api/orders');
    });

    it('should generate order by id route', () => {
      expect(API_ROUTES.ORDER_BY_ID('123')).toBe('/api/orders/123');
    });

    it('should have correct media API routes', () => {
      expect(API_ROUTES.MEDIA_UPLOAD).toBe('/api/media/upload');
    });

    it('should generate media by type route', () => {
      expect(API_ROUTES.MEDIA_BY_TYPE('hero')).toBe('/api/media/hero');
      expect(API_ROUTES.MEDIA_BY_TYPE('carousel')).toBe('/api/media/carousel');
    });

    it('should generate media delete route with encoded cloudinary id', () => {
      expect(API_ROUTES.MEDIA_DELETE('test-id')).toBe('/api/media/delete/test-id');
      expect(API_ROUTES.MEDIA_DELETE('folder/test-id')).toBe('/api/media/delete/folder%2Ftest-id');
    });

    it('should have correct content API route', () => {
      expect(API_ROUTES.CONTENT).toBe('/api/content');
    });
  });

  describe('ROUTE_PATTERNS', () => {
    it('should have correct route patterns for middleware', () => {
      expect(ROUTE_PATTERNS.ADMIN).toBe('/admin/:path*');
      expect(ROUTE_PATTERNS.API).toBe('/api/:path*');
      expect(ROUTE_PATTERNS.PUBLIC).toBe('/:path*');
    });
  });
});
