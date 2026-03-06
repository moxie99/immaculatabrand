/**
 * Integration tests for Admin Authentication Flow
 * Task 30.4: Connect admin authentication
 * 
 * Tests:
 * - Basic Auth on /admin routes
 * - Unauthorized access is blocked
 * - Admin functionality after authentication
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import Product from '@/lib/db/models/Product';
import Order from '@/lib/db/models/Order';
import { GET as getProducts, POST as createProduct } from '@/app/api/products/route';
import { GET as getOrders } from '@/app/api/orders/route';
import { POST as uploadMedia } from '@/app/api/media/upload/route';

// Admin credentials for authenticated requests
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';
const validAuth = Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64');
const invalidAuth = Buffer.from('wrong:credentials').toString('base64');

describe('Admin Authentication Flow Integration Tests', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri);
  }, 60000);

  afterAll(async () => {
    // Cleanup
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await Product.deleteMany({});
    await Order.deleteMany({});
  });

  describe('Admin Route Protection', () => {
    it('should block access to product creation without authentication', async () => {
      const productData = {
        name: 'Test Product',
        category: 'confectionary',
        description: 'Test description',
        price: 1000,
        currency: 'GBP',
        images: ['https://res.cloudinary.com/test/image.jpg'],
      };

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const response = await createProduct(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should block access to product creation with invalid credentials', async () => {
      const productData = {
        name: 'Test Product',
        category: 'confectionary',
        description: 'Test description',
        price: 1000,
        currency: 'GBP',
        images: ['https://res.cloudinary.com/test/image.jpg'],
      };

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${invalidAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const response = await createProduct(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should block access to orders list without authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'GET',
      });

      const response = await getOrders(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should block access to orders list with invalid credentials', async () => {
      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${invalidAuth}`,
        },
      });

      const response = await getOrders(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Authenticated Admin Access', () => {
    it('should allow product creation with valid credentials', async () => {
      const productData = {
        name: 'Authenticated Product',
        category: 'confectionary',
        description: 'Created with valid auth',
        price: 1500,
        currency: 'GBP',
        images: ['https://res.cloudinary.com/test/auth-product.jpg'],
        isActive: true,
        isFeatured: false,
      };

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${validAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const response = await createProduct(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Authenticated Product');
      expect(data.data.slug).toBe('authenticated-product');
    });

    it('should allow orders list access with valid credentials', async () => {
      // Create a test order first
      await Order.create({
        orderNumber: 'ORD-20240101-001',
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        customerPhone: '+1234567890',
        items: [],
        status: 'new',
      });

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${validAuth}`,
        },
      });

      const response = await getOrders(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].orderNumber).toBe('ORD-20240101-001');
    });

    it('should allow multiple authenticated operations in sequence', async () => {
      // 1. Create first product
      const product1Data = {
        name: 'Product One',
        category: 'confectionary',
        description: 'First product',
        price: 1000,
        currency: 'GBP',
        images: ['https://res.cloudinary.com/test/product1.jpg'],
      };

      const createRequest1 = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${validAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product1Data),
      });

      const createResponse1 = await createProduct(createRequest1);
      expect(createResponse1.status).toBe(201);

      // 2. Create second product
      const product2Data = {
        name: 'Product Two',
        category: 'fish',
        description: 'Second product',
        price: 2000,
        currency: 'GBP',
        images: ['https://res.cloudinary.com/test/product2.jpg'],
      };

      const createRequest2 = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${validAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product2Data),
      });

      const createResponse2 = await createProduct(createRequest2);
      expect(createResponse2.status).toBe(201);

      // 3. List all products (public endpoint, no auth needed)
      const listRequest = new NextRequest('http://localhost:3000/api/products');
      const listResponse = await getProducts(listRequest);
      const listData = await listResponse.json();

      expect(listResponse.status).toBe(200);
      expect(listData.data).toHaveLength(2);
    });
  });

  describe('Public Route Accessibility', () => {
    beforeEach(async () => {
      // Create test products for public access
      await Product.create([
        {
          name: 'Public Product 1',
          slug: 'public-product-1',
          category: 'confectionary',
          description: 'Available to public',
          price: 1000,
          currency: 'GBP',
          images: ['https://res.cloudinary.com/test/public1.jpg'],
          isActive: true,
          isFeatured: true,
        },
        {
          name: 'Public Product 2',
          slug: 'public-product-2',
          category: 'fish',
          description: 'Also available to public',
          price: 1500,
          currency: 'GBP',
          images: ['https://res.cloudinary.com/test/public2.jpg'],
          isActive: true,
          isFeatured: false,
        },
      ]);
    });

    it('should allow public access to product listings without authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/products');
      const response = await getProducts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
    });

    it('should allow public access to filtered product listings', async () => {
      const request = new NextRequest('http://localhost:3000/api/products?category=confectionary');
      const response = await getProducts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].category).toBe('confectionary');
    });

    it('should allow public access to featured products', async () => {
      const request = new NextRequest('http://localhost:3000/api/products?featured=true');
      const response = await getProducts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].isFeatured).toBe(true);
    });
  });

  describe('Mixed Authentication Scenarios', () => {
    it('should handle alternating authenticated and public requests', async () => {
      // 1. Public request - should succeed
      const publicRequest1 = new NextRequest('http://localhost:3000/api/products');
      const publicResponse1 = await getProducts(publicRequest1);
      expect(publicResponse1.status).toBe(200);

      // 2. Authenticated request - should succeed
      const authRequest = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${validAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Mixed Auth Product',
          category: 'foodstuffs',
          description: 'Testing mixed auth',
          price: 1200,
          currency: 'GBP',
          images: ['https://res.cloudinary.com/test/mixed.jpg'],
        }),
      });
      const authResponse = await createProduct(authRequest);
      expect(authResponse.status).toBe(201);

      // 3. Public request again - should succeed and show new product
      const publicRequest2 = new NextRequest('http://localhost:3000/api/products');
      const publicResponse2 = await getProducts(publicRequest2);
      const publicData2 = await publicResponse2.json();
      expect(publicResponse2.status).toBe(200);
      expect(publicData2.data).toHaveLength(1);

      // 4. Unauthenticated admin request - should fail
      const unauthRequest = new NextRequest('http://localhost:3000/api/orders', {
        method: 'GET',
      });
      const unauthResponse = await getOrders(unauthRequest);
      expect(unauthResponse.status).toBe(401);
    });

    it('should reject requests with malformed authorization headers', async () => {
      const productData = {
        name: 'Test Product',
        category: 'confectionary',
        description: 'Test',
        price: 1000,
        currency: 'GBP',
        images: ['https://res.cloudinary.com/test/test.jpg'],
      };

      // Test with malformed header (missing "Basic" prefix)
      const request1 = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': validAuth, // Missing "Basic" prefix
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const response1 = await createProduct(request1);
      expect(response1.status).toBe(401);

      // Test with invalid base64
      const request2 = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic not-valid-base64!!!',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const response2 = await createProduct(request2);
      expect(response2.status).toBe(401);
    });
  });

  describe('Admin Functionality After Authentication', () => {
    it('should allow complete product management workflow with authentication', async () => {
      // Create product
      const createData = {
        name: 'Admin Managed Product',
        category: 'confectionary',
        description: 'Managed by admin',
        price: 1800,
        currency: 'GBP',
        images: ['https://res.cloudinary.com/test/admin-product.jpg'],
        isActive: true,
        isFeatured: false,
      };

      const createRequest = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${validAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createData),
      });

      const createResponse = await createProduct(createRequest);
      const createResult = await createResponse.json();

      expect(createResponse.status).toBe(201);
      expect(createResult.success).toBe(true);
      expect(createResult.data.name).toBe('Admin Managed Product');

      // Verify product is visible in public listings
      const publicRequest = new NextRequest('http://localhost:3000/api/products');
      const publicResponse = await getProducts(publicRequest);
      const publicData = await publicResponse.json();

      expect(publicResponse.status).toBe(200);
      expect(publicData.data).toHaveLength(1);
      expect(publicData.data[0].name).toBe('Admin Managed Product');
    });

    it('should maintain authentication across multiple admin operations', async () => {
      const authHeader = { 'Authorization': `Basic ${validAuth}` };

      // Create multiple products
      for (let i = 1; i <= 3; i++) {
        const productData = {
          name: `Batch Product ${i}`,
          category: 'foodstuffs',
          description: `Product number ${i}`,
          price: 1000 * i,
          currency: 'GBP',
          images: [`https://res.cloudinary.com/test/batch-${i}.jpg`],
        };

        const request = new NextRequest('http://localhost:3000/api/products', {
          method: 'POST',
          headers: {
            ...authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });

        const response = await createProduct(request);
        expect(response.status).toBe(201);
      }

      // Verify all products were created
      const listRequest = new NextRequest('http://localhost:3000/api/products');
      const listResponse = await getProducts(listRequest);
      const listData = await listResponse.json();

      expect(listResponse.status).toBe(200);
      expect(listData.data).toHaveLength(3);
    });

    it('should allow admin to view orders after authentication', async () => {
      // Create test orders
      await Order.create([
        {
          orderNumber: 'ORD-20240101-001',
          customerName: 'Customer One',
          customerEmail: 'customer1@example.com',
          customerPhone: '+1234567890',
          items: [],
          status: 'new',
        },
        {
          orderNumber: 'ORD-20240101-002',
          customerName: 'Customer Two',
          customerEmail: 'customer2@example.com',
          customerPhone: '+0987654321',
          items: [],
          status: 'contacted',
        },
      ]);

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${validAuth}`,
        },
      });

      const response = await getOrders(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.data[0].orderNumber).toBe('ORD-20240101-002'); // Sorted by date desc
      expect(data.data[1].orderNumber).toBe('ORD-20240101-001');
    });
  });

  describe('Security Edge Cases', () => {
    it('should reject empty authorization header', async () => {
      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test',
          category: 'confectionary',
          description: 'Test',
          price: 1000,
          currency: 'GBP',
          images: ['https://res.cloudinary.com/test/test.jpg'],
        }),
      });

      const response = await createProduct(request);
      expect(response.status).toBe(401);
    });

    it('should reject authorization with only username (no password)', async () => {
      const incompleteAuth = Buffer.from(`${ADMIN_USERNAME}:`).toString('base64');
      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${incompleteAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test',
          category: 'confectionary',
          description: 'Test',
          price: 1000,
          currency: 'GBP',
          images: ['https://res.cloudinary.com/test/test.jpg'],
        }),
      });

      const response = await createProduct(request);
      expect(response.status).toBe(401);
    });

    it('should reject authorization with only password (no username)', async () => {
      const incompleteAuth = Buffer.from(`:${ADMIN_PASSWORD}`).toString('base64');
      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${incompleteAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test',
          category: 'confectionary',
          description: 'Test',
          price: 1000,
          currency: 'GBP',
          images: ['https://res.cloudinary.com/test/test.jpg'],
        }),
      });

      const response = await createProduct(request);
      expect(response.status).toBe(401);
    });

    it('should be case-sensitive for credentials', async () => {
      const wrongCaseAuth = Buffer.from(`${ADMIN_USERNAME.toUpperCase()}:${ADMIN_PASSWORD}`).toString('base64');
      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${wrongCaseAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test',
          category: 'confectionary',
          description: 'Test',
          price: 1000,
          currency: 'GBP',
          images: ['https://res.cloudinary.com/test/test.jpg'],
        }),
      });

      const response = await createProduct(request);
      expect(response.status).toBe(401);
    });
  });
});
