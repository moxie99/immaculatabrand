/**
 * Integration tests for Inquiry/Order Flow
 * Task 30.2: Connect inquiry/order flow
 * 
 * Tests:
 * - Inquiry form submission from product detail page
 * - Order creation with unique order number
 * - Order display in admin dashboard
 * - Order status updates
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Product from '@/lib/db/models/Product';
import Order from '@/lib/db/models/Order';
import mongoose from 'mongoose';
import { GET as getOrders, POST as createOrder } from '@/app/api/orders/route';
import { 
  GET as getOrderById, 
  PUT as updateOrderStatus 
} from '@/app/api/orders/[id]/route';

// Admin credentials for authenticated requests
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';
const adminAuth = Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64');

describe('Inquiry/Order Flow Integration Tests', () => {
  let mongoServer: MongoMemoryServer;
  let testProduct: any;

  beforeAll(async () => {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri);
  }, 60000); // Increase timeout for MongoDB Memory Server startup

  afterAll(async () => {
    // Cleanup
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clean up before each test
    await Product.deleteMany({});
    await Order.deleteMany({});
    
    // Create a test product for order submissions
    testProduct = await Product.create({
      name: 'Test Product',
      slug: 'test-product',
      category: 'confectionary',
      description: 'Test product for order flow',
      price: 1500,
      currency: 'GBP',
      images: ['https://res.cloudinary.com/test/test-product.jpg'],
      isActive: true,
      isFeatured: false,
    });
  });

  describe('Inquiry Form Submission', () => {
    it('should create an order from inquiry form with all required fields', async () => {
      const inquiryData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+44 20 1234 5678',
        items: [
          {
            productId: testProduct._id.toString(),
            quantity: 2,
          },
        ],
        message: 'Please deliver before Friday',
      };

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inquiryData),
      });

      const response = await createOrder(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.order.customerName).toBe('John Doe');
      expect(data.data.order.customerEmail).toBe('john@example.com');
      expect(data.data.order.customerPhone).toBe('+44 20 1234 5678');
      expect(data.data.order.items).toHaveLength(1);
      expect(data.data.order.items[0].productId.toString()).toBe(testProduct._id.toString());
      expect(data.data.order.items[0].quantity).toBe(2);
      expect(data.data.order.message).toBe('Please deliver before Friday');
      expect(data.data.order.status).toBe('new');
    });

    it('should create an order with shipping address', async () => {
      const inquiryData = {
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        customerPhone: '+44 20 9876 5432',
        items: [
          {
            productId: testProduct._id.toString(),
            quantity: 1,
          },
        ],
        shippingAddress: {
          street: '123 Main Street',
          city: 'London',
          state: 'Greater London',
          postalCode: 'SW1A 1AA',
          country: 'United Kingdom',
        },
      };

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inquiryData),
      });

      const response = await createOrder(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.order.shippingAddress).toBeDefined();
      expect(data.data.order.shippingAddress.street).toBe('123 Main Street');
      expect(data.data.order.shippingAddress.city).toBe('London');
      expect(data.data.order.shippingAddress.postalCode).toBe('SW1A 1AA');
    });

    it('should reject order with missing required fields', async () => {
      const invalidData = {
        customerName: 'John Doe',
        // Missing customerEmail and customerPhone
        items: [
          {
            productId: testProduct._id.toString(),
            quantity: 1,
          },
        ],
      };

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidData),
      });

      const response = await createOrder(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.fields).toBeDefined();
    });

    it('should reject order with invalid email format', async () => {
      const invalidData = {
        customerName: 'John Doe',
        customerEmail: 'invalid-email',
        customerPhone: '+44 20 1234 5678',
        items: [
          {
            productId: testProduct._id.toString(),
            quantity: 1,
          },
        ],
      };

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidData),
      });

      const response = await createOrder(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject order with non-existent product', async () => {
      const fakeProductId = new mongoose.Types.ObjectId();
      const invalidData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+44 20 1234 5678',
        items: [
          {
            productId: fakeProductId.toString(),
            quantity: 1,
          },
        ],
      };

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidData),
      });

      const response = await createOrder(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Order Number Generation', () => {
    it('should generate unique order number on creation', async () => {
      const inquiryData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+44 20 1234 5678',
        items: [
          {
            productId: testProduct._id.toString(),
            quantity: 1,
          },
        ],
      };

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inquiryData),
      });

      const response = await createOrder(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.orderNumber).toBeDefined();
      expect(data.data.orderNumber).toMatch(/^ORD-\d{8}-\d{3}$/);
    });

    it('should generate unique order numbers for multiple orders', async () => {
      const orderNumbers: string[] = [];

      // Create 3 orders
      for (let i = 0; i < 3; i++) {
        const inquiryData = {
          customerName: `Customer ${i + 1}`,
          customerEmail: `customer${i + 1}@example.com`,
          customerPhone: `+44 20 1234 ${5678 + i}`,
          items: [
            {
              productId: testProduct._id.toString(),
              quantity: 1,
            },
          ],
        };

        const request = new NextRequest('http://localhost:3000/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(inquiryData),
        });

        const response = await createOrder(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        orderNumbers.push(data.data.orderNumber);
      }

      // Verify all order numbers are unique
      const uniqueOrderNumbers = new Set(orderNumbers);
      expect(uniqueOrderNumbers.size).toBe(3);
    });

    it('should include order number in confirmation response', async () => {
      const inquiryData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+44 20 1234 5678',
        items: [
          {
            productId: testProduct._id.toString(),
            quantity: 1,
          },
        ],
      };

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inquiryData),
      });

      const response = await createOrder(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.orderNumber).toBeDefined();
      expect(data.data.order.orderNumber).toBe(data.data.orderNumber);
    });
  });

  describe('Order Display in Admin Dashboard', () => {
    beforeEach(async () => {
      // Create multiple test orders
      await Order.create([
        {
          orderNumber: 'ORD-20240115-001',
          customerName: 'Alice Johnson',
          customerEmail: 'alice@example.com',
          customerPhone: '+44 20 1111 1111',
          items: [
            {
              productId: testProduct._id,
              productName: testProduct.name,
              quantity: 1,
              priceAtTime: testProduct.price,
            },
          ],
          status: 'new',
          createdAt: new Date('2024-01-15T10:00:00Z'),
        },
        {
          orderNumber: 'ORD-20240115-002',
          customerName: 'Bob Smith',
          customerEmail: 'bob@example.com',
          customerPhone: '+44 20 2222 2222',
          items: [
            {
              productId: testProduct._id,
              productName: testProduct.name,
              quantity: 2,
              priceAtTime: testProduct.price,
            },
          ],
          status: 'contacted',
          createdAt: new Date('2024-01-15T11:00:00Z'),
        },
        {
          orderNumber: 'ORD-20240115-003',
          customerName: 'Charlie Brown',
          customerEmail: 'charlie@example.com',
          customerPhone: '+44 20 3333 3333',
          items: [
            {
              productId: testProduct._id,
              productName: testProduct.name,
              quantity: 1,
              priceAtTime: testProduct.price,
            },
          ],
          status: 'completed',
          createdAt: new Date('2024-01-15T12:00:00Z'),
        },
      ]);
    });

    it('should list all orders in admin dashboard', async () => {
      const request = new NextRequest('http://localhost:3000/api/orders', {
        headers: {
          'Authorization': `Basic ${adminAuth}`,
        },
      });

      const response = await getOrders(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(3);
      expect(data.pagination.total).toBe(3);
    });

    it('should sort orders by creation date descending (newest first)', async () => {
      const request = new NextRequest('http://localhost:3000/api/orders', {
        headers: {
          'Authorization': `Basic ${adminAuth}`,
        },
      });

      const response = await getOrders(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data[0].orderNumber).toBe('ORD-20240115-003'); // Most recent
      expect(data.data[1].orderNumber).toBe('ORD-20240115-002');
      expect(data.data[2].orderNumber).toBe('ORD-20240115-001'); // Oldest
    });

    it('should filter orders by status', async () => {
      const request = new NextRequest('http://localhost:3000/api/orders?status=new', {
        headers: {
          'Authorization': `Basic ${adminAuth}`,
        },
      });

      const response = await getOrders(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].status).toBe('new');
    });

    it('should paginate order results', async () => {
      const request = new NextRequest('http://localhost:3000/api/orders?page=1&limit=2', {
        headers: {
          'Authorization': `Basic ${adminAuth}`,
        },
      });

      const response = await getOrders(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(2);
      expect(data.pagination.totalPages).toBe(2);
    });

    it('should require authentication for order listing', async () => {
      const request = new NextRequest('http://localhost:3000/api/orders');

      const response = await getOrders(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should get single order details by ID', async () => {
      const order = await Order.findOne({ orderNumber: 'ORD-20240115-001' });

      const request = new NextRequest(`http://localhost:3000/api/orders/${order!._id}`, {
        headers: {
          'Authorization': `Basic ${adminAuth}`,
        },
      });

      const response = await getOrderById(request, { params: { id: order!._id.toString() } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.orderNumber).toBe('ORD-20240115-001');
      expect(data.data.customerName).toBe('Alice Johnson');
      expect(data.data.items).toHaveLength(1);
    });

    it('should return 404 for non-existent order', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const request = new NextRequest(`http://localhost:3000/api/orders/${fakeId}`, {
        headers: {
          'Authorization': `Basic ${adminAuth}`,
        },
      });

      const response = await getOrderById(request, { params: { id: fakeId.toString() } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('Order Status Updates', () => {
    let testOrder: any;

    beforeEach(async () => {
      testOrder = await Order.create({
        orderNumber: 'ORD-20240115-001',
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        customerPhone: '+44 20 1234 5678',
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

    it('should update order status from new to contacted', async () => {
      const updateData = {
        status: 'contacted',
      };

      const request = new NextRequest(`http://localhost:3000/api/orders/${testOrder._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const response = await updateOrderStatus(request, { params: { id: testOrder._id.toString() } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('contacted');
    });

    it('should update order status from new to cancelled', async () => {
      const updateData = {
        status: 'cancelled',
      };

      const request = new NextRequest(`http://localhost:3000/api/orders/${testOrder._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const response = await updateOrderStatus(request, { params: { id: testOrder._id.toString() } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('cancelled');
    });

    it('should update order status from contacted to completed', async () => {
      // First update to contacted
      testOrder.status = 'contacted';
      await testOrder.save();

      const updateData = {
        status: 'completed',
      };

      const request = new NextRequest(`http://localhost:3000/api/orders/${testOrder._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const response = await updateOrderStatus(request, { params: { id: testOrder._id.toString() } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('completed');
    });

    it('should reject invalid status transition from completed', async () => {
      // Set order to completed
      testOrder.status = 'completed';
      await testOrder.save();

      const updateData = {
        status: 'new',
      };

      const request = new NextRequest(`http://localhost:3000/api/orders/${testOrder._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const response = await updateOrderStatus(request, { params: { id: testOrder._id.toString() } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid status transition from cancelled', async () => {
      // Set order to cancelled
      testOrder.status = 'cancelled';
      await testOrder.save();

      const updateData = {
        status: 'contacted',
      };

      const request = new NextRequest(`http://localhost:3000/api/orders/${testOrder._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const response = await updateOrderStatus(request, { params: { id: testOrder._id.toString() } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should require authentication for status updates', async () => {
      const updateData = {
        status: 'contacted',
      };

      const request = new NextRequest(`http://localhost:3000/api/orders/${testOrder._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const response = await updateOrderStatus(request, { params: { id: testOrder._id.toString() } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Complete Inquiry/Order Flow', () => {
    it('should complete full order lifecycle', async () => {
      // 1. SUBMIT INQUIRY: Customer submits inquiry form
      const inquiryData = {
        customerName: 'Full Flow Customer',
        customerEmail: 'fullflow@example.com',
        customerPhone: '+44 20 9999 9999',
        items: [
          {
            productId: testProduct._id.toString(),
            quantity: 3,
          },
        ],
        message: 'Testing complete flow',
        shippingAddress: {
          street: '456 Test Street',
          city: 'London',
          state: 'Greater London',
          postalCode: 'SW1A 2AA',
          country: 'United Kingdom',
        },
      };

      const createRequest = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inquiryData),
      });

      const createResponse = await createOrder(createRequest);
      const createResult = await createResponse.json();

      expect(createResponse.status).toBe(201);
      expect(createResult.data.orderNumber).toBeDefined();
      const orderId = createResult.data.order._id;
      const orderNumber = createResult.data.orderNumber;

      // 2. VIEW IN DASHBOARD: Admin views order in dashboard
      const listRequest = new NextRequest('http://localhost:3000/api/orders', {
        headers: {
          'Authorization': `Basic ${adminAuth}`,
        },
      });

      const listResponse = await getOrders(listRequest);
      const listResult = await listResponse.json();

      expect(listResponse.status).toBe(200);
      expect(listResult.data).toHaveLength(1);
      expect(listResult.data[0].orderNumber).toBe(orderNumber);
      expect(listResult.data[0].status).toBe('new');

      // 3. VIEW DETAILS: Admin views order details
      const detailRequest = new NextRequest(`http://localhost:3000/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Basic ${adminAuth}`,
        },
      });

      const detailResponse = await getOrderById(detailRequest, { params: { id: orderId } });
      const detailResult = await detailResponse.json();

      expect(detailResponse.status).toBe(200);
      expect(detailResult.data.customerName).toBe('Full Flow Customer');
      expect(detailResult.data.items[0].quantity).toBe(3);
      expect(detailResult.data.shippingAddress.street).toBe('456 Test Street');

      // 4. UPDATE STATUS: Admin contacts customer
      const contactedRequest = new NextRequest(`http://localhost:3000/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'contacted' }),
      });

      const contactedResponse = await updateOrderStatus(contactedRequest, { params: { id: orderId } });
      const contactedResult = await contactedResponse.json();

      expect(contactedResponse.status).toBe(200);
      expect(contactedResult.data.status).toBe('contacted');

      // 5. COMPLETE ORDER: Admin marks order as completed
      const completedRequest = new NextRequest(`http://localhost:3000/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' }),
      });

      const completedResponse = await updateOrderStatus(completedRequest, { params: { id: orderId } });
      const completedResult = await completedResponse.json();

      expect(completedResponse.status).toBe(200);
      expect(completedResult.data.status).toBe('completed');

      // 6. VERIFY FINAL STATE: Check order is in completed state
      const finalRequest = new NextRequest(`http://localhost:3000/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Basic ${adminAuth}`,
        },
      });

      const finalResponse = await getOrderById(finalRequest, { params: { id: orderId } });
      const finalResult = await finalResponse.json();

      expect(finalResponse.status).toBe(200);
      expect(finalResult.data.status).toBe('completed');
    });
  });
});
