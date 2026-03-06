/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRouter } from 'next/navigation';
import OrderTable from './OrderTable';
import type { Order } from '@/types/order.types';
import type { PaginatedResponse } from '@/types/api.types';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

describe('OrderTable', () => {
  const mockRouter = {
    push: vi.fn(),
  };

  const mockOrders: Order[] = [
    {
      _id: '1',
      orderNumber: 'ORD-001',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerPhone: '1234567890',
      items: [],
      status: 'new',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      _id: '2',
      orderNumber: 'ORD-002',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      customerPhone: '0987654321',
      items: [],
      status: 'contacted',
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16'),
    },
  ];

  const mockResponse: PaginatedResponse<Order> = {
    success: true,
    data: mockOrders,
    pagination: {
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });
  });

  it('renders loading state initially', () => {
    render(<OrderTable />);
    const { container } = render(<OrderTable />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('fetches and displays orders', async () => {
    render(<OrderTable />);

    await waitFor(() => {
      expect(screen.getByText('ORD-001')).toBeTruthy();
      expect(screen.getByText('ORD-002')).toBeTruthy();
      expect(screen.getByText('John Doe')).toBeTruthy();
      expect(screen.getByText('Jane Smith')).toBeTruthy();
    });
  });

  it('displays status badges with correct colors', async () => {
    render(<OrderTable />);

    await waitFor(() => {
      const newBadge = screen.getByText('new');
      const contactedBadge = screen.getByText('contacted');
      
      expect(newBadge.className).toContain('bg-blue-100');
      expect(newBadge.className).toContain('text-blue-800');
      expect(contactedBadge.className).toContain('bg-yellow-100');
      expect(contactedBadge.className).toContain('text-yellow-800');
    });
  });

  it('navigates to order detail on row click', async () => {
    render(<OrderTable />);

    await waitFor(() => {
      expect(screen.getByText('ORD-001')).toBeTruthy();
    });

    const row = screen.getByText('ORD-001').closest('tr');
    fireEvent.click(row!);

    expect(mockRouter.push).toHaveBeenCalledWith('/admin/orders/1');
  });

  it('filters orders by status', async () => {
    render(<OrderTable />);

    await waitFor(() => {
      expect(screen.getByText('ORD-001')).toBeTruthy();
    });

    // Open status filter
    const statusFilter = screen.getByRole('combobox', { name: /status/i });
    fireEvent.click(statusFilter);

    // Select "new" status
    const newOption = screen.getByRole('option', { name: 'New' });
    fireEvent.click(newOption);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=new'),
        expect.any(Object)
      );
    });
  });

  it('sorts orders by date', async () => {
    render(<OrderTable />);

    await waitFor(() => {
      expect(screen.getByText('ORD-001')).toBeTruthy();
    });

    const sortButton = screen.getByRole('button', { name: /date/i });
    fireEvent.click(sortButton);

    // Check that orders are now in ascending order
    const rows = screen.getAllByRole('row');
    expect(rows[1].textContent).toContain('ORD-001');
    expect(rows[2].textContent).toContain('ORD-002');
  });

  it('changes page size', async () => {
    render(<OrderTable />);

    await waitFor(() => {
      expect(screen.getByText('ORD-001')).toBeTruthy();
    });

    // Open page size selector
    const pageSizeSelect = screen.getByRole('combobox', { name: /show/i });
    fireEvent.click(pageSizeSelect);

    // Select 20 items per page
    const option20 = screen.getByRole('option', { name: '20' });
    fireEvent.click(option20);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=20'),
        expect.any(Object)
      );
    });
  });

  it('handles pagination', async () => {
    const multiPageResponse: PaginatedResponse<Order> = {
      ...mockResponse,
      pagination: {
        ...mockResponse.pagination,
        totalPages: 3,
        hasNextPage: true,
      },
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => multiPageResponse,
    });

    render(<OrderTable />);

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeTruthy();
    });

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.any(Object)
      );
    });
  });

  it('displays empty state when no orders', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      }),
    });

    render(<OrderTable />);

    await waitFor(() => {
      expect(screen.getByText('No orders found')).toBeTruthy();
    });
  });

  it('displays error state on fetch failure', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch orders',
        },
      }),
    });

    render(<OrderTable />);

    await waitFor(() => {
      expect(screen.getByText('Error loading orders')).toBeTruthy();
    });
  });

  it('retries fetch on error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: { message: 'Error' },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

    render(<OrderTable />);

    await waitFor(() => {
      expect(screen.getByText('Error loading orders')).toBeTruthy();
    });

    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('ORD-001')).toBeTruthy();
    });
  });

  it('formats dates correctly', async () => {
    render(<OrderTable />);

    await waitFor(() => {
      expect(screen.getByText(/Jan 15, 2024/)).toBeTruthy();
      expect(screen.getByText(/Jan 16, 2024/)).toBeTruthy();
    });
  });

  it('displays results count', async () => {
    render(<OrderTable />);

    await waitFor(() => {
      expect(screen.getByText('Showing 2 of 2 orders')).toBeTruthy();
    });
  });

  it('applies responsive classes for mobile', async () => {
    render(<OrderTable />);

    await waitFor(() => {
      expect(screen.getByText('ORD-001')).toBeTruthy();
    });

    // Email column should be hidden on mobile
    const emailHeaders = screen.getAllByRole('columnheader');
    const emailHeader = emailHeaders.find(header => header.textContent === 'Email');
    expect(emailHeader).toBeTruthy();
    expect(emailHeader?.className).toContain('hidden');
    expect(emailHeader?.className).toContain('md:table-cell');
  });
});
