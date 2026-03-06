import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Order, { IOrder, OrderStatus } from './Order';
import Product from './Product';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Start in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Cleanup
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear collections before each test
  await Order.deleteMany({});
  await Product.deleteMany({});
});

describe('Order Model - Unit Tests', () => {
  describe('Schema Validation', () => {
    it('should create a valid order with all required fields', async () => {
      const orderData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        items: [
          {
            productId: new mongoose.Types.ObjectId(),
            productName: 'Test Product',
            quantity: 2,
            priceAtTime: 1500,
          },
        ],
        status: 'new' as OrderStatus,
      };

      const order = await Order.create(orderData);

      expect(order).toBeDefined();
      expect(order.customerName).toBe('John Doe');
      expect(order.customerEmail).toBe('john@example.com');
      expect(order.customerPhone).toBe('+1234567890');
      expect(order.items).toHaveLength(1);
      expect(order.status).toBe('new');
      expect(order.orderNumber).toBeDefined();
      expect(order.createdAt).toBeDefined();
      expect(order.updatedAt).toBeDefined();
    });

    it('should fail validation when customer name is missing', async () => {
      const orderData = {
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        items: [],
      };

      await expect(Order.create(orderData)).rejects.toThrow();
    });

    it('should fail validation when customer email is missing', async () => {
      const orderData = {
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        items: [],
      };

      await expect(Order.create(orderData)).rejects.toThrow();
    });

    it('should fail validation when customer phone is missing', async () => {
      const orderData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        items: [],
      };

      await expect(Order.create(orderData)).rejects.toThrow();
    });

    it('should fail validation with invalid email format', async () => {
      const orderData = {
        customerName: 'John Doe',
        customerEmail: 'invalid-email',
        customerPhone: '+1234567890',
        items: [],
      };

      await expect(Order.create(orderData)).rejects.toThrow(/Invalid email format/);
    });

    it('should normalize email to lowercase', async () => {
      const orderData = {
        customerName: 'John Doe',
        customerEmail: 'JOHN@EXAMPLE.COM',
        customerPhone: '+1234567890',
        items: [],
      };

      const order = await Order.create(orderData);
      expect(order.customerEmail).toBe('john@example.com');
    });

    it('should fail validation with invalid status', async () => {
      const orderData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        items: [],
        status: 'invalid-status' as OrderStatus,
      };

      await expect(Order.create(orderData)).rejects.toThrow();
    });

    it('should accept optional message field', async () => {
      const orderData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        items: [],
        message: 'Please deliver before 5pm',
      };

      const order = await Order.create(orderData);
      expect(order.message).toBe('Please deliver before 5pm');
    });

    it('should accept optional shipping address', async () => {
      const orderData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        items: [],
        shippingAddress: {
          street: '123 Main St',
          city: 'London',
          state: 'Greater London',
          postalCode: 'SW1A 1AA',
          country: 'UK',
        },
      };

      const order = await Order.create(orderData);
      expect(order.shippingAddress).toBeDefined();
      expect(order.shippingAddress?.street).toBe('123 Main St');
      expect(order.shippingAddress?.city).toBe('London');
    });
  });

  describe('Order Number Generation', () => {
    it('should auto-generate order number on creation', async () => {
      const orderData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        items: [],
      };

      const order = await Order.create(orderData);
      expect(order.orderNumber).toBeDefined();
      expect(order.orderNumber).toMatch(/^ORD-\d{8}-\d{3}$/);
    });

    it('should generate order number in format ORD-YYYYMMDD-NNN', async () => {
      const orderData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        items: [],
      };

      const order = await Order.create(orderData);
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const expectedPrefix = `ORD-${year}${month}${day}-`;

      expect(order.orderNumber).toContain(expectedPrefix);
    });

    it('should generate unique order numbers for multiple orders', async () => {
      const orderData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        items: [],
      };

      const order1 = await Order.create(orderData);
      const order2 = await Order.create({
        ...orderData,
        customerEmail: 'jane@example.com',
      });
      const order3 = await Order.create({
        ...orderData,
        customerEmail: 'bob@example.com',
      });

      expect(order1.orderNumber).not.toBe(order2.orderNumber);
      expect(order2.orderNumber).not.toBe(order3.orderNumber);
      expect(order1.orderNumber).not.toBe(order3.orderNumber);
    });

    it('should increment sequence number for orders on same day', async () => {
      const orderData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        items: [],
      };

      const order1 = await Order.create(orderData);
      const order2 = await Order.create({
        ...orderData,
        customerEmail: 'jane@example.com',
      });

      const seq1 = parseInt(order1.orderNumber.split('-')[2], 10);
      const seq2 = parseInt(order2.orderNumber.split('-')[2], 10);

      expect(seq2).toBe(seq1 + 1);
    });

    it('should enforce unique constraint on order number', async () => {
      const orderData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        items: [],
      };

      const order1 = await Order.create(orderData);

      // Try to create order with same order number
      const duplicateOrder = new Order({
        ...orderData,
        customerEmail: 'different@example.com',
        orderNumber: order1.orderNumber,
      });

      await expect(duplicateOrder.save()).rejects.toThrow();
    });
  });

  describe('Status Transitions', () => {
    it('should allow transition from new to contacted', async () => {
      const order = await Order.create({
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        items: [],
        status: 'new',
      });

      order.status = 'contacted';
      await expect(order.save()).resolves.toBeDefined();
    });

    it('should allow transition from new to cancelled', async () => {
      const order = await Order.create({
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        items: [],
        status: 'new',
      });

      order.status = 'cancelled';
      await expect(order.save()).resolves.toBeDefined();
    });

    it('should allow transition from contacted to completed', async () => {
      const order = await Order.create({
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        items: [],
        status: 'contacted',
      });

      order.status = 'completed';
      await expect(order.save()).resolves.toBeDefined();
    });

    it('should allow transition from contacted to cancelled', async () => {
      const order = await Order.create({
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        items: [],
        status: 'contacted',
      });

      order.status = 'cancelled';
      await expect(order.save()).resolves.toBeDefined();
    });

    it('should prevent transition from new to completed', async () => {
      const order = await Order.create({
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        items: [],
        status: 'new',
      });

      order.status = 'completed';
      await expect(order.save()).rejects.toThrow(/Invalid status transition/);
    });

    it('should prevent transition from completed to any status', async () => {
      const order = await Order.create({
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        items: [],
        status: 'completed',
      });

      order.status = 'new';
      await expect(order.save()).rejects.toThrow(/Invalid status transition/);
    });

    it('should prevent transition from cancelled to any status', async () => {
      const order = await Order.create({
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        items: [],
        status: 'cancelled',
      });

      order.status = 'new';
      await expect(order.save()).rejects.toThrow(/Invalid status transition/);
    });

    it('should use canTransitionTo method correctly', async () => {
      const order = await Order.create({
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        items: [],
        status: 'new',
      });

      expect(order.canTransitionTo('contacted')).toBe(true);
      expect(order.canTransitionTo('cancelled')).toBe(true);
      expect(order.canTransitionTo('completed')).toBe(false);
    });
  });

  describe('Order Items Validation', () => {
    it('should validate item quantity is at least 1', async () => {
      const orderData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        items: [
          {
            productId: new mongoose.Types.ObjectId(),
            productName: 'Test Product',
            quantity: 0,
            priceAtTime: 1500,
          },
        ],
      };

      await expect(Order.create(orderData)).rejects.toThrow();
    });

    it('should validate item price is positive', async () => {
      const orderData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        items: [
          {
            productId: new mongoose.Types.ObjectId(),
            productName: 'Test Product',
            quantity: 1,
            priceAtTime: -100,
          },
        ],
      };

      await expect(Order.create(orderData)).rejects.toThrow();
    });

    it('should store multiple items correctly', async () => {
      const orderData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        items: [
          {
            productId: new mongoose.Types.ObjectId(),
            productName: 'Product 1',
            quantity: 2,
            priceAtTime: 1500,
          },
          {
            productId: new mongoose.Types.ObjectId(),
            productName: 'Product 2',
            quantity: 1,
            priceAtTime: 2500,
          },
        ],
      };

      const order = await Order.create(orderData);
      expect(order.items).toHaveLength(2);
      expect(order.items[0].productName).toBe('Product 1');
      expect(order.items[1].productName).toBe('Product 2');
    });
  });

  describe('Indexes', () => {
    it('should have index on orderNumber', async () => {
      const indexes = await Order.collection.getIndexes();
      expect(indexes).toHaveProperty('orderNumber_1');
    });

    it('should have index on customerEmail', async () => {
      const indexes = await Order.collection.getIndexes();
      expect(indexes).toHaveProperty('customerEmail_1');
    });

    it('should have index on status', async () => {
      const indexes = await Order.collection.getIndexes();
      expect(indexes).toHaveProperty('status_1');
    });

    it('should have index on createdAt', async () => {
      const indexes = await Order.collection.getIndexes();
      const hasCreatedAtIndex = Object.keys(indexes).some(
        (key) => key.includes('createdAt')
      );
      expect(hasCreatedAtIndex).toBe(true);
    });
  });

  describe('Timestamps', () => {
    it('should automatically set createdAt and updatedAt', async () => {
      const orderData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        items: [],
      };

      const order = await Order.create(orderData);
      expect(order.createdAt).toBeInstanceOf(Date);
      expect(order.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt when order is modified', async () => {
      const order = await Order.create({
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        items: [],
      });

      const originalUpdatedAt = order.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      order.customerName = 'Jane Doe';
      await order.save();

      expect(order.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });
  });
});
