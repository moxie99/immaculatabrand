/**
 * Order Service Tests
 * Unit tests for order service layer
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as orderService from './order.service';
import Order from '../db/models/Order';
import Product from '../db/models/Product';
import { NotFoundError, ValidationError } from '../utils/errors';
import { OrderCreateInput } from '../../types/order.types';

// Mock dependencies
vi.mock('../db/mongodb', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../db/models/Order');
vi.mock('../db/models/Product');

describe('Order Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create order with valid product references', async () => {
      const input: OrderCreateInput = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        items: [
          { productId: '507f1f77bcf86cd799439011', quantity: 2 },
        ],
      };

      const mockProduct = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test Product',
        price: 10.99,
        isActive: true,
      };

      const mockOrder = {
        _id: '507f1f77bcf86cd799439012',
        orderNumber: 'ORD-20240115-001',
        ...input,
        items: [{
          productId: mockProduct._id,
          productName: mockProduct.name,
          quantity: 2,
          priceAtTime: mockProduct.price,
        }],
        status: 'new',
        save: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(Product.find).mockResolvedValue([mockProduct] as any);
      vi.mocked(Order).mockImplementation(function(this: any) {
        return mockOrder;
      } as any);

      const result = await orderService.createOrder(input);

      expect(result.orderNumber).toBe('ORD-20240115-001');
      expect(result.customerEmail).toBe('john@example.com');
      expect(mockOrder.save).toHaveBeenCalled();
    });

    it('should throw ValidationError for non-existent products', async () => {
      const input: OrderCreateInput = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        items: [
          { productId: '507f1f77bcf86cd799439011', quantity: 2 },
        ],
      };

      vi.mocked(Product.find).mockResolvedValue([] as any);

      await expect(orderService.createOrder(input)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for inactive products', async () => {
      const input: OrderCreateInput = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        items: [
          { productId: '507f1f77bcf86cd799439011', quantity: 2 },
        ],
      };

      // Product.find with isActive: true filter returns empty
      vi.mocked(Product.find).mockResolvedValue([] as any);

      await expect(orderService.createOrder(input)).rejects.toThrow(ValidationError);
    });
  });

  describe('getOrderById', () => {
    it('should return order when found', async () => {
      const mockOrder = {
        _id: '507f1f77bcf86cd799439011',
        orderNumber: 'ORD-20240115-001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
      };

      vi.mocked(Order.findById).mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockOrder),
      } as any);

      const result = await orderService.getOrderById('507f1f77bcf86cd799439011');

      expect(result.orderNumber).toBe('ORD-20240115-001');
      expect(result.customerEmail).toBe('john@example.com');
    });

    it('should throw NotFoundError when order not found', async () => {
      vi.mocked(Order.findById).mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      } as any);

      await expect(
        orderService.getOrderById('507f1f77bcf86cd799439011')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getAllOrders', () => {
    it('should return paginated orders', async () => {
      const mockOrders = [
        { _id: '1', orderNumber: 'ORD-20240115-001', status: 'new' },
        { _id: '2', orderNumber: 'ORD-20240115-002', status: 'contacted' },
      ];

      vi.mocked(Order.find).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockOrders),
      } as any);

      vi.mocked(Order.countDocuments).mockResolvedValue(2);

      const result = await orderService.getAllOrders({ page: 1, limit: 10 });

      expect(result.orders).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should filter orders by status', async () => {
      const mockOrders = [
        { _id: '1', orderNumber: 'ORD-20240115-001', status: 'new' },
      ];

      vi.mocked(Order.find).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockOrders),
      } as any);

      vi.mocked(Order.countDocuments).mockResolvedValue(1);

      const result = await orderService.getAllOrders({ status: 'new' });

      expect(result.orders).toHaveLength(1);
      expect(result.orders[0].status).toBe('new');
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status with valid transition', async () => {
      const mockOrder = {
        _id: '507f1f77bcf86cd799439011',
        orderNumber: 'ORD-20240115-001',
        status: 'new',
        canTransitionTo: vi.fn().mockReturnValue(true),
        save: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(Order.findById).mockResolvedValue(mockOrder as any);

      const result = await orderService.updateOrderStatus('507f1f77bcf86cd799439011', {
        status: 'contacted',
      });

      expect(mockOrder.status).toBe('contacted');
      expect(mockOrder.save).toHaveBeenCalled();
    });

    it('should throw ValidationError for invalid status transition', async () => {
      const mockOrder = {
        _id: '507f1f77bcf86cd799439011',
        orderNumber: 'ORD-20240115-001',
        status: 'completed',
        canTransitionTo: vi.fn().mockReturnValue(false),
      };

      vi.mocked(Order.findById).mockResolvedValue(mockOrder as any);

      await expect(
        orderService.updateOrderStatus('507f1f77bcf86cd799439011', {
          status: 'new',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError when order not found', async () => {
      vi.mocked(Order.findById).mockResolvedValue(null);

      await expect(
        orderService.updateOrderStatus('507f1f77bcf86cd799439011', {
          status: 'contacted',
        })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getOrderByNumber', () => {
    it('should return order when found by order number', async () => {
      const mockOrder = {
        _id: '507f1f77bcf86cd799439011',
        orderNumber: 'ORD-20240115-001',
        customerName: 'John Doe',
      };

      vi.mocked(Order.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockOrder),
      } as any);

      const result = await orderService.getOrderByNumber('ORD-20240115-001');

      expect(result.orderNumber).toBe('ORD-20240115-001');
    });

    it('should throw NotFoundError when order not found', async () => {
      vi.mocked(Order.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      } as any);

      await expect(
        orderService.getOrderByNumber('ORD-20240115-999')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getRecentOrders', () => {
    it('should return recent orders sorted by creation date', async () => {
      const mockOrders = [
        { _id: '1', orderNumber: 'ORD-20240115-002', createdAt: new Date('2024-01-15') },
        { _id: '2', orderNumber: 'ORD-20240114-001', createdAt: new Date('2024-01-14') },
      ];

      vi.mocked(Order.find).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockOrders),
      } as any);

      const result = await orderService.getRecentOrders(10);

      expect(result).toHaveLength(2);
      expect(result[0].orderNumber).toBe('ORD-20240115-002');
    });
  });

  describe('getOrderCount', () => {
    it('should return total order count when no status provided', async () => {
      vi.mocked(Order.countDocuments).mockResolvedValue(42);

      const result = await orderService.getOrderCount();

      expect(result).toBe(42);
    });

    it('should return order count filtered by status', async () => {
      vi.mocked(Order.countDocuments).mockResolvedValue(5);

      const result = await orderService.getOrderCount('new');

      expect(result).toBe(5);
    });
  });
});
