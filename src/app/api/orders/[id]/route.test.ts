/**
 * Single Order API Route Tests
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { GET, PUT } from './route';
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Order from '@/lib/db/models/Order';
import Product from '@/lib/db/models/Product';
import mongoose from 'mongoose';

// Mock admin credentials
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';
const adminAuth = Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64');

describe('Single Order API Routes', () => {
  let testProduct: any;
  let testOrder: any;

  beforeAll(async () => {
    await connectDB();
    
    // Create a test product
    testProduct = await Product.create({
      name: 'Test Product for Single Order',
      slug: 'test-product-single-order',
      category: 'fish',
      description: 'Test product description',
      price: 2000,
      currency: 'GBP',
      images: ['https://res.cloudinary.com/test/image.jpg'],
      isActive: true,
      isFeatured: false,
    });
  });

  afterAll(async () => {
    // Clean up test data
    await Order.deleteMany({ customerEmail: 'singleorder@example.com' });
    await Product.deleteOne({ _id: testProduct._id });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up and create test order before each test
    await Order.deleteMany({ customerEmail: 'singleorder@example.com' });
    
    testOrder = await Order.create({
      customerName: 'Test User',
      customerEmail: 'singleorder@example.com',
      customerPhone: '+1234567890',
      items: [
        {
          productId: testProduct._id,
          productName: testProduct.name,
          quantity: 1,
          priceAtTime: testProduct.price,
        },
      ],
      status: 'new',
    });
  });

  describe('GET /api/orders/[id]', () => {
    it('should return order by ID with admin auth', async () => {
      const request = new NextRequest(`http://localhost:3000/api/orders/${testOrder._id}`, {
        method: 'GET',
        headers: {
          authorization: `Basic ${adminAuth}`,
        },
      });

      const response = await GET(request, { params: { id: testOrder._id.toString() } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data._id).toBe(testOrder._id.toString());
      expect(data.data.customerName).toBe('Test User');
    });

    it('should reject request without auth', async () => {
      const request = new NextRequest(`http://localhost:3000/api/orders/${testOrder._id}`, {
        method: 'GET',
      });

      const response = await GET(request, { params: { id: testOrder._id.toString() } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 404 for non-existent order', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const request = new NextRequest(`http://localhost:3000/api/orders/${fakeId}`, {
        method: 'GET',
        headers: {
          authorization: `Basic ${adminAuth}`,
        },
      });

      const response = await GET(request, { params: { id: fakeId } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PUT /api/orders/[id]', () => {
    it('should update order status with admin auth', async () => {
      const updateData = {
        status: 'contacted',
      };

      const request = new NextRequest(`http://localhost:3000/api/orders/${testOrder._id}`, {
        method: 'PUT',
        headers: {
          authorization: `Basic ${adminAuth}`,
        },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, { params: { id: testOrder._id.toString() } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('contacted');
    });

    it('should reject invalid status transition', async () => {
      // First update to completed
      await Order.findByIdAndUpdate(testOrder._id, { status: 'completed' });

      const updateData = {
        status: 'new',
      };

      const request = new NextRequest(`http://localhost:3000/api/orders/${testOrder._id}`, {
        method: 'PUT',
        headers: {
          authorization: `Basic ${adminAuth}`,
        },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, { params: { id: testOrder._id.toString() } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject request without auth', async () => {
      const updateData = {
        status: 'contacted',
      };

      const request = new NextRequest(`http://localhost:3000/api/orders/${testOrder._id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, { params: { id: testOrder._id.toString() } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });
});
