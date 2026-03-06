/**
 * Orders API Route Tests
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Order from '@/lib/db/models/Order';
import Product from '@/lib/db/models/Product';
import mongoose from 'mongoose';

// Mock admin credentials
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';
const adminAuth = Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64');

describe('Orders API Routes', () => {
  let testProduct: any;

  beforeAll(async () => {
    await connectDB();
    
    // Create a test product
    testProduct = await Product.create({
      name: 'Test Product for Orders',
      slug: 'test-product-orders',
      category: 'confectionary',
      description: 'Test product description',
      price: 1000,
      currency: 'GBP',
      images: ['https://res.cloudinary.com/test/image.jpg'],
      isActive: true,
      isFeatured: false,
    });
  });

  afterAll(async () => {
    // Clean up test data
    await Order.deleteMany({ customerEmail: 'test@example.com' });
    await Product.deleteOne({ _id: testProduct._id });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up orders before each test
    await Order.deleteMany({ customerEmail: 'test@example.com' });
  });

  describe('POST /api/orders', () => {
    it('should create a new order with valid data', async () => {
      const orderData = {
        customerName: 'John Doe',
        customerEmail: 'test@example.com',
        customerPhone: '+1234567890',
        items: [
          {
            productId: testProduct._id.toString(),
            quantity: 2,
          },
        ],
        message: 'Please deliver ASAP',
      };

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.order).toBeDefined();
      expect(data.data.orderNumber).toBeDefined();
      expect(data.data.order.customerName).toBe('John Doe');
      expect(data.data.order.customerEmail).toBe('test@example.com');
      expect(data.data.order.status).toBe('new');
    });

    it('should reject order with missing required fields', async () => {
      const orderData = {
        customerName: 'John Doe',
        // Missing customerEmail and customerPhone
        items: [
          {
            productId: testProduct._id.toString(),
            quantity: 2,
          },
        ],
      };

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject order with invalid email', async () => {
      const orderData = {
        customerName: 'John Doe',
        customerEmail: 'invalid-email',
        customerPhone: '+1234567890',
        items: [
          {
            productId: testProduct._id.toString(),
            quantity: 2,
          },
        ],
      };

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject order with non-existent product', async () => {
      const orderData = {
        customerName: 'John Doe',
        customerEmail: 'test@example.com',
        customerPhone: '+1234567890',
        items: [
          {
            productId: new mongoose.Types.ObjectId().toString(),
            quantity: 2,
          },
        ],
      };

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/orders', () => {
    beforeEach(async () => {
      // Create test orders
      await Order.create({
        customerName: 'John Doe',
        customerEmail: 'test@example.com',
        customerPhone: '+1234567890',
        items: [
          {
            productId: testProduct._id,
            productName: testProduct.name,
            quantity: 2,
            priceAtTime: testProduct.price,
          },
        ],
        status: 'new',
      });

      await Order.create({
        customerName: 'Jane Smith',
        customerEmail: 'test@example.com',
        customerPhone: '+0987654321',
        items: [
          {
            productId: testProduct._id,
            productName: testProduct.name,
            quantity: 1,
            priceAtTime: testProduct.price,
          },
        ],
        status: 'contacted',
      });
    });

    it('should return orders with admin auth', async () => {
      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'GET',
        headers: {
          authorization: `Basic ${adminAuth}`,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.pagination).toBeDefined();
    });

    it('should reject request without auth', async () => {
      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should filter orders by status', async () => {
      const request = new NextRequest('http://localhost:3000/api/orders?status=new', {
        method: 'GET',
        headers: {
          authorization: `Basic ${adminAuth}`,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.every((order: any) => order.status === 'new')).toBe(true);
    });
  });
});
