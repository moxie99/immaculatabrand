import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from './middleware';

describe('Admin Authentication Middleware', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    vi.resetModules();
    process.env = { 
      ...originalEnv,
      ADMIN_USERNAME: 'testadmin',
      ADMIN_PASSWORD: 'testpassword123'
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Admin route protection', () => {
    it('should return 401 when no authorization header is provided for /admin routes', () => {
      const request = new NextRequest(new URL('http://localhost:3000/admin'));
      const response = middleware(request);

      expect(response.status).toBe(401);
      expect(response.headers.get('WWW-Authenticate')).toBe('Basic realm="Admin Area"');
    });

    it('should return 401 when invalid credentials are provided', () => {
      const invalidCredentials = Buffer.from('wronguser:wrongpass').toString('base64');
      const request = new NextRequest(new URL('http://localhost:3000/admin'), {
        headers: {
          authorization: `Basic ${invalidCredentials}`
        }
      });
      
      const response = middleware(request);

      expect(response.status).toBe(401);
      expect(response.headers.get('WWW-Authenticate')).toBe('Basic realm="Admin Area"');
    });

    it('should return 401 when username is correct but password is wrong', () => {
      const invalidCredentials = Buffer.from('testadmin:wrongpassword').toString('base64');
      const request = new NextRequest(new URL('http://localhost:3000/admin'), {
        headers: {
          authorization: `Basic ${invalidCredentials}`
        }
      });
      
      const response = middleware(request);

      expect(response.status).toBe(401);
    });

    it('should return 401 when password is correct but username is wrong', () => {
      const invalidCredentials = Buffer.from('wronguser:testpassword123').toString('base64');
      const request = new NextRequest(new URL('http://localhost:3000/admin'), {
        headers: {
          authorization: `Basic ${invalidCredentials}`
        }
      });
      
      const response = middleware(request);

      expect(response.status).toBe(401);
    });

    it('should allow access when valid credentials are provided', () => {
      const validCredentials = Buffer.from('testadmin:testpassword123').toString('base64');
      const request = new NextRequest(new URL('http://localhost:3000/admin'), {
        headers: {
          authorization: `Basic ${validCredentials}`
        }
      });
      
      const response = middleware(request);

      // NextResponse.next() returns a response that allows the request to continue
      expect(response.status).not.toBe(401);
    });

    it('should protect nested admin routes', () => {
      const request = new NextRequest(new URL('http://localhost:3000/admin/products'));
      const response = middleware(request);

      expect(response.status).toBe(401);
    });

    it('should protect deeply nested admin routes', () => {
      const request = new NextRequest(new URL('http://localhost:3000/admin/products/123/edit'));
      const response = middleware(request);

      expect(response.status).toBe(401);
    });

    it('should return 401 when authorization header has invalid format', () => {
      const request = new NextRequest(new URL('http://localhost:3000/admin'), {
        headers: {
          authorization: 'InvalidFormat'
        }
      });
      
      const response = middleware(request);

      expect(response.status).toBe(401);
    });

    it('should return 401 when base64 credentials are malformed', () => {
      const request = new NextRequest(new URL('http://localhost:3000/admin'), {
        headers: {
          authorization: 'Basic not-valid-base64!!!'
        }
      });
      
      const response = middleware(request);

      expect(response.status).toBe(401);
    });
  });

  describe('Public route accessibility', () => {
    it('should allow access to homepage without authentication', () => {
      const request = new NextRequest(new URL('http://localhost:3000/'));
      const response = middleware(request);

      expect(response.status).not.toBe(401);
    });

    it('should allow access to products page without authentication', () => {
      const request = new NextRequest(new URL('http://localhost:3000/products'));
      const response = middleware(request);

      expect(response.status).not.toBe(401);
    });

    it('should allow access to product detail page without authentication', () => {
      const request = new NextRequest(new URL('http://localhost:3000/products/123'));
      const response = middleware(request);

      expect(response.status).not.toBe(401);
    });

    it('should allow access to contact page without authentication', () => {
      const request = new NextRequest(new URL('http://localhost:3000/contact'));
      const response = middleware(request);

      expect(response.status).not.toBe(401);
    });

    it('should allow access to about page without authentication', () => {
      const request = new NextRequest(new URL('http://localhost:3000/about'));
      const response = middleware(request);

      expect(response.status).not.toBe(401);
    });

    it('should allow access to API routes without authentication', () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/products'));
      const response = middleware(request);

      expect(response.status).not.toBe(401);
    });
  });

  describe('Environment variable validation', () => {
    it('should reject access when ADMIN_USERNAME is not set', () => {
      delete process.env.ADMIN_USERNAME;
      
      const validCredentials = Buffer.from('testadmin:testpassword123').toString('base64');
      const request = new NextRequest(new URL('http://localhost:3000/admin'), {
        headers: {
          authorization: `Basic ${validCredentials}`
        }
      });
      
      const response = middleware(request);

      expect(response.status).toBe(401);
    });

    it('should reject access when ADMIN_PASSWORD is not set', () => {
      delete process.env.ADMIN_PASSWORD;
      
      const validCredentials = Buffer.from('testadmin:testpassword123').toString('base64');
      const request = new NextRequest(new URL('http://localhost:3000/admin'), {
        headers: {
          authorization: `Basic ${validCredentials}`
        }
      });
      
      const response = middleware(request);

      expect(response.status).toBe(401);
    });
  });
});
