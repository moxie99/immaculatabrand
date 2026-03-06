/**
 * Integration tests for Products API routes
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Product from '@/lib/db/models/Product';
import mongoose from 'mongoose';

describe('Products API Routes', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up products before each test
    await Product.deleteMany({});
  });

  describe('GET /api/products', () => {
    it('should return empty list when no products exist', async () => {
      const request = new NextRequest('http://localhost:3000/api/products');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
      expect(data.pagination.total).toBe(0);
    });

    it('should return paginated products', async () => {
      // Create test products
      await Product.create([
        {
          name: 'Test Product 1',
          slug: 'test-product-1',
          category: 'confectionary',
          description: 'Test description 1',
          price: 1000,
          currency: 'GBP',
          isActive: true,
        },
        {
          name: 'Test Product 2',
          slug: 'test-product-2',
          category: 'fish',
          description: 'Test description 2',
          price: 2000,
          currency: 'GBP',
          isActive: true,
        },
      ]);

      const request = new NextRequest('http://localhost:3000/api/products');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.pagination.total).toBe(2);
      expect(data.pagination.page).toBe(1);
    });

    it('should filter products by category', async () => {
      // Create test products
      await Product.create([
        {
          name: 'Confectionary Product',
          slug: 'confectionary-product',
          category: 'confectionary',
          description: 'Test description',
          price: 1000,
          currency: 'GBP',
          isActive: true,
        },
        {
          name: 'Fish Product',
          slug: 'fish-product',
          category: 'fish',
          description: 'Test description',
          price: 2000,
          currency: 'GBP',
          isActive: true,
        },
      ]);

      const request = new NextRequest('http://localhost:3000/api/products?category=fish');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].category).toBe('fish');
    });

    it('should filter featured products', async () => {
      // Create test products
      await Product.create([
        {
          name: 'Featured Product',
          slug: 'featured-product',
          category: 'confectionary',
          description: 'Test description',
          price: 1000,
          currency: 'GBP',
          isFeatured: true,
          isActive: true,
        },
        {
          name: 'Regular Product',
          slug: 'regular-product',
          category: 'fish',
          description: 'Test description',
          price: 2000,
          currency: 'GBP',
          isFeatured: false,
          isActive: true,
        },
      ]);

      const request = new NextRequest('http://localhost:3000/api/products?featured=true');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].isFeatured).toBe(true);
    });

    it('should return validation error for invalid query parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/products?category=invalid');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/products', () => {
    it('should return 401 without authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Product',
          category: 'confectionary',
          description: 'Test description',
          price: 1000,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should create product with valid authentication', async () => {
      const credentials = Buffer.from(
        `${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD}`
      ).toString('base64');

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test Product',
          category: 'confectionary',
          description: 'Test description',
          price: 1000,
          currency: 'GBP',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Test Product');
      expect(data.data.slug).toBe('test-product');
      expect(data.message).toBe('Product created successfully');
    });

    it('should return validation error for invalid product data', async () => {
      const credentials = Buffer.from(
        `${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD}`
      ).toString('base64');

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test Product',
          category: 'invalid-category',
          description: 'Test description',
          price: -100, // Invalid negative price
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.fields).toBeDefined();
    });

    it('should return 401 with invalid credentials', async () => {
      const credentials = Buffer.from('invalid:credentials').toString('base64');

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test Product',
          category: 'confectionary',
          description: 'Test description',
          price: 1000,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });
});
