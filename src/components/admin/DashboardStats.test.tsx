/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardStats from './DashboardStats';

// Mock fetch globally
global.fetch = vi.fn();

describe('DashboardStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    (global.fetch as any).mockImplementation(() => new Promise(() => {}));

    render(<DashboardStats />);

    expect(screen.getAllByText('Loading...')).toHaveLength(4);
  });

  it('should fetch and display stats correctly', async () => {
    const mockOrdersResponse = {
      success: true,
      data: [
        { _id: '1', status: 'new' },
        { _id: '2', status: 'new' },
        { _id: '3', status: 'contacted' },
      ],
      pagination: { total: 3 },
    };

    const mockProductsResponse = {
      success: true,
      data: [
        { _id: '1', isActive: true },
        { _id: '2', isActive: true },
        { _id: '3', isActive: false },
        { _id: '4', isActive: true },
      ],
      pagination: { total: 4 },
    };

    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProductsResponse,
      });

    render(<DashboardStats />);

    await waitFor(() => {
      // Check stat labels
      expect(screen.getByText('Total Orders')).toBeTruthy();
      expect(screen.getByText('New Orders')).toBeTruthy();
      expect(screen.getByText('Total Products')).toBeTruthy();
      expect(screen.getByText('Active Products')).toBeTruthy();
    });

    // Check stat values by finding them within their respective cards
    expect(screen.getByText('2')).toBeTruthy(); // New Orders (unique value)
    expect(screen.getByText('4')).toBeTruthy(); // Total Products (unique value)
    expect(screen.getAllByText('3')).toHaveLength(2); // Total Orders and Active Products

    // Check descriptions
    expect(screen.getByText('All customer inquiries')).toBeTruthy();
    expect(screen.getByText('Pending follow-up')).toBeTruthy();
    expect(screen.getByText('All products in catalog')).toBeTruthy();
    expect(screen.getByText('Visible to customers')).toBeTruthy();
  });

  it('should display error message when fetch fails', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    render(<DashboardStats />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard statistics')).toBeTruthy();
    });
  });

  it('should display error message when response is not ok', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<DashboardStats />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard statistics')).toBeTruthy();
    });
  });

  it('should handle empty data gracefully', async () => {
    const mockOrdersResponse = {
      success: true,
      data: [],
      pagination: { total: 0 },
    };

    const mockProductsResponse = {
      success: true,
      data: [],
      pagination: { total: 0 },
    };

    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProductsResponse,
      });

    render(<DashboardStats />);

    await waitFor(() => {
      const zeroValues = screen.getAllByText('0');
      expect(zeroValues.length).toBeGreaterThanOrEqual(4);
    });
  });

  it('should render with custom className', () => {
    (global.fetch as any).mockImplementation(() => new Promise(() => {}));

    const { container } = render(<DashboardStats className="custom-class" />);

    expect(container.firstChild).toHaveProperty('className', expect.stringContaining('custom-class'));
  });

  it('should use responsive grid layout', async () => {
    const mockOrdersResponse = {
      success: true,
      data: [],
      pagination: { total: 0 },
    };

    const mockProductsResponse = {
      success: true,
      data: [],
      pagination: { total: 0 },
    };

    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProductsResponse,
      });

    const { container } = render(<DashboardStats />);

    await waitFor(() => {
      const grid = container.querySelector('.grid');
      expect(grid?.className).toContain('md:grid-cols-2');
      expect(grid?.className).toContain('lg:grid-cols-4');
    });
  });

  it('should fetch stats in parallel', async () => {
    const mockOrdersResponse = {
      success: true,
      data: [],
      pagination: { total: 0 },
    };

    const mockProductsResponse = {
      success: true,
      data: [],
      pagination: { total: 0 },
    };

    const fetchMock = global.fetch as any;
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrdersResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProductsResponse,
      });

    render(<DashboardStats />);

    await waitFor(() => {
      expect(screen.getByText('Total Orders')).toBeTruthy();
    });

    // Verify both endpoints were called
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/orders',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.stringContaining('Basic'),
        }),
      })
    );
    expect(fetchMock).toHaveBeenCalledWith('/api/products');
  });
});
