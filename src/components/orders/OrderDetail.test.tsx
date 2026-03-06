/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import OrderDetail from './OrderDetail';
import type { Order } from '@/types/order.types';
import type { ApiResponse } from '@/types/api.types';

// Mock the useToast hook
vi.mock('@/lib/hooks/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    toast: vi.fn(),
    dismiss: vi.fn(),
    toasts: [],
  }),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_ADMIN_USERNAME = 'admin';
process.env.NEXT_PUBLIC_ADMIN_PASSWORD = 'password';

describe('OrderDetail Component', () => {
  const mockOrder: Order = {
    _id: '123',
    orderNumber: 'ORD-001',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+1234567890',
    items: [
      {
        productId: 'prod1',
        productName: 'Chocolate Cake',
        quantity: 2,
        priceAtTime: 25.99,
      },
      {
        productId: 'prod2',
        productName: 'Vanilla Cupcakes',
        quantity: 12,
        priceAtTime: 2.50,
      },
    ],
    status: 'new',
    shippingAddress: {
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62701',
      country: 'USA',
    },
    message: 'Please deliver before 5 PM',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Loading State', () => {
    it('should display loading skeleton while fetching order', () => {
      // Mock fetch to never resolve
      global.fetch = vi.fn(() => new Promise(() => {}));

      const { container } = render(<OrderDetail orderId="123" />);

      // Check for loading skeletons
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Order Display', () => {
    beforeEach(() => {
      const mockResponse: ApiResponse<Order> = {
        success: true,
        data: mockOrder,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });
    });

    it('should fetch and display order details', async () => {
      render(<OrderDetail orderId="123" />);

      await waitFor(() => {
        expect(screen.getByText('Order Information')).toBeTruthy();
      });

      // Check order information
      expect(screen.getByText('ORD-001')).toBeTruthy();
      expect(screen.getByText('Customer Information')).toBeTruthy();
      expect(screen.getByText('John Doe')).toBeTruthy();
      expect(screen.getByText('john@example.com')).toBeTruthy();
      expect(screen.getByText('+1234567890')).toBeTruthy();
    });

    it('should display order items with prices', async () => {
      render(<OrderDetail orderId="123" />);

      await waitFor(() => {
        expect(screen.getByText('Order Items')).toBeTruthy();
      });

      // Check items
      expect(screen.getByText('Chocolate Cake')).toBeTruthy();
      expect(screen.getByText('Quantity: 2')).toBeTruthy();
      expect(screen.getByText('Vanilla Cupcakes')).toBeTruthy();
      expect(screen.getByText('Quantity: 12')).toBeTruthy();

      // Check total calculation (2 * 25.99 + 12 * 2.50 = 81.98)
      expect(screen.getByText('$81.98')).toBeTruthy();
    });

    it('should display shipping address when provided', async () => {
      render(<OrderDetail orderId="123" />);

      await waitFor(() => {
        expect(screen.getByText('Shipping Address')).toBeTruthy();
      });

      expect(screen.getByText('123 Main St')).toBeTruthy();
      expect(screen.getByText(/Springfield, IL 62701/)).toBeTruthy();
      expect(screen.getByText('USA')).toBeTruthy();
    });

    it('should display customer message when provided', async () => {
      render(<OrderDetail orderId="123" />);

      await waitFor(() => {
        expect(screen.getByText('Customer Message')).toBeTruthy();
      });

      expect(screen.getByText('Please deliver before 5 PM')).toBeTruthy();
    });

    it('should not display shipping address section when not provided', async () => {
      const orderWithoutAddress = { ...mockOrder, shippingAddress: undefined };
      const mockResponse: ApiResponse<Order> = {
        success: true,
        data: orderWithoutAddress,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      render(<OrderDetail orderId="123" />);

      await waitFor(() => {
        expect(screen.getByText('Order Information')).toBeTruthy();
      });

      expect(screen.queryByText('Shipping Address')).toBeNull();
    });

    it('should not display message section when not provided', async () => {
      const orderWithoutMessage = { ...mockOrder, message: undefined };
      const mockResponse: ApiResponse<Order> = {
        success: true,
        data: orderWithoutMessage,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      render(<OrderDetail orderId="123" />);

      await waitFor(() => {
        expect(screen.getByText('Order Information')).toBeTruthy();
      });

      expect(screen.queryByText('Customer Message')).toBeNull();
    });
  });

  describe('Status Update', () => {
    beforeEach(() => {
      const mockResponse: ApiResponse<Order> = {
        success: true,
        data: mockOrder,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });
    });

    it('should show save button when status is changed', async () => {
      render(<OrderDetail orderId="123" />);

      await waitFor(() => {
        expect(screen.getByText('Order Information')).toBeTruthy();
      });

      // Find and click the status select
      const statusSelect = screen.getByRole('combobox');
      fireEvent.click(statusSelect);

      // Select a different status
      const contactedOption = screen.getByRole('option', { name: 'Contacted' });
      fireEvent.click(contactedOption);

      // Save button should appear
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeTruthy();
      });
    });

    it('should update order status when save is clicked', async () => {
      const updatedOrder = { ...mockOrder, status: 'contacted' as const };
      const updateResponse: ApiResponse<Order> = {
        success: true,
        data: updatedOrder,
        message: 'Order updated successfully',
      };

      // Mock initial fetch
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: mockOrder }),
        })
        // Mock update fetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => updateResponse,
        });

      render(<OrderDetail orderId="123" />);

      await waitFor(() => {
        expect(screen.getByText('Order Information')).toBeTruthy();
      });

      // Change status
      const statusSelect = screen.getByRole('combobox');
      fireEvent.click(statusSelect);
      const contactedOption = screen.getByRole('option', { name: 'Contacted' });
      fireEvent.click(contactedOption);

      // Click save
      const saveButton = await screen.findByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      // Verify PUT request was made
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/orders/123',
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
            body: JSON.stringify({ status: 'contacted' }),
          })
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when fetch fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      render(<OrderDetail orderId="123" />);

      await waitFor(() => {
        expect(screen.getByText('Error loading order')).toBeTruthy();
      });

      expect(screen.getByText('Failed to fetch order')).toBeTruthy();
      expect(screen.getByRole('button', { name: /try again/i })).toBeTruthy();
    });

    it('should display not found message when order does not exist', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      render(<OrderDetail orderId="123" />);

      await waitFor(() => {
        expect(screen.getByText('Error loading order')).toBeTruthy();
      });

      expect(screen.getByText('Order not found')).toBeTruthy();
    });

    it('should retry fetch when try again button is clicked', async () => {
      // First call fails, second succeeds
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: mockOrder }),
        });

      render(<OrderDetail orderId="123" />);

      await waitFor(() => {
        expect(screen.getByText('Error loading order')).toBeTruthy();
      });

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(tryAgainButton);

      await waitFor(() => {
        expect(screen.getByText('Order Information')).toBeTruthy();
      });
    });
  });

  describe('Authentication', () => {
    it('should include Basic Auth header in fetch request', async () => {
      const mockResponse: ApiResponse<Order> = {
        success: true,
        data: mockOrder,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      render(<OrderDetail orderId="123" />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/orders/123',
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': expect.stringContaining('Basic'),
            }),
          })
        );
      });
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      const mockResponse: ApiResponse<Order> = {
        success: true,
        data: mockOrder,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });
    });

    it('should apply custom className', async () => {
      const { container } = render(<OrderDetail orderId="123" className="custom-class" />);

      await waitFor(() => {
        expect(screen.getByText('Order Information')).toBeTruthy();
      });

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv.className).toContain('custom-class');
    });
  });
});
