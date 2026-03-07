'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { Order, OrderStatus } from '@/types/order.types';
import type { PaginatedResponse } from '@/types/api.types';

/**
 * OrderTable Component Props
 */
export interface OrderTableProps {
  className?: string;
}

/**
 * Sort direction type
 */
type SortDirection = 'asc' | 'desc';

/**
 * OrderTable Component
 * 
 * Admin component for displaying and managing orders in a table format.
 * 
 * Features:
 * - Displays orders with columns: order number, date, customer name, email, status
 * - Sortable by date (ascending/descending)
 * - Status filter dropdown (all, new, contacted, completed, cancelled)
 * - Pagination controls (page size: 10, 20, 50)
 * - Row click to navigate to order detail page
 * - Loading state while fetching data
 * - Empty state when no orders
 * - Error handling and display
 * - Responsive design
 * 
 * Requirements: Design - Order Management Components
 */
export default function OrderTable({ className = '' }: OrderTableProps) {
  const router = useRouter();
  
  // State management
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  /**
   * Fetch orders from API
   */
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      // Fetch with Basic Auth
      const response = await fetch(`/api/orders?${params.toString()}`, {
        headers: {
          'Authorization': `Basic ${btoa(`${process.env.NEXT_PUBLIC_ADMIN_USERNAME}:${process.env.NEXT_PUBLIC_ADMIN_PASSWORD}`)}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data: PaginatedResponse<Order> = await response.json();

      if (data.success) {
        setOrders(data.data || []);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      } else {
        throw new Error(data.error?.message || 'Failed to fetch orders');
      }
    } catch (err) {
      // Only set error for actual failures, not empty results
      setError(err instanceof Error ? err.message : 'An error occurred');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch orders when filters or pagination change
  useEffect(() => {
    fetchOrders();
  }, [currentPage, pageSize, statusFilter]);

  /**
   * Toggle sort direction
   */
  const toggleSort = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  /**
   * Sort orders by date
   */
  const sortedOrders = React.useMemo(() => {
    return [...orders].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [orders, sortDirection]);

  /**
   * Handle row click - navigate to order detail
   */
  const handleRowClick = (orderId: string) => {
    router.push(`/admin/orders/${orderId}`);
  };

  /**
   * Format date for display
   */
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Get status badge color
   */
  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Loading state
  if (isLoading && orders.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Filters skeleton */}
        <div className="flex gap-4 items-center">
          <div className="h-10 w-48 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>

        {/* Table skeleton */}
        <div className="border rounded-lg">
          <div className="h-12 bg-muted animate-pulse" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 border-t animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
        <div className="text-center max-w-md">
          <svg
            className="mx-auto h-24 w-24 text-red-500/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="mt-6 text-xl font-semibold text-foreground">
            Error loading orders
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Button onClick={fetchOrders} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!isLoading && sortedOrders.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
        <div className="text-center max-w-md">
          <svg
            className="mx-auto h-24 w-24 text-muted-foreground/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-6 text-xl font-semibold text-foreground">
            No orders found
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {statusFilter !== 'all'
              ? `No orders with status "${statusFilter}". Try changing the filter.`
              : 'There are currently no orders. Orders will appear here when customers submit inquiries.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filters and controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-4 items-center flex-wrap">
          {/* Status filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="status-filter" className="text-sm font-medium">
              Status:
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter" className="w-[180px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Page size selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="page-size" className="text-sm font-medium">
              Show:
            </label>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger id="page-size" className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Showing {sortedOrders.length} of {total} orders
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Number</TableHead>
              <TableHead>
                <button
                  onClick={toggleSort}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  Date
                  {sortDirection === 'asc' ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </TableHead>
              <TableHead>Customer Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrders.map((order) => (
              <TableRow
                key={order._id}
                onClick={() => handleRowClick(order._id)}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell className="hidden md:table-cell">{order.customerEmail}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
