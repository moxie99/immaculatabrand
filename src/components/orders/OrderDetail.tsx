'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/hooks/useToast';
import type { Order, OrderStatus } from '@/types/order.types';
import type { ApiResponse } from '@/types/api.types';

/**
 * OrderDetail Component Props
 */
export interface OrderDetailProps {
  orderId: string;
  className?: string;
}

/**
 * OrderDetail Component
 * 
 * Admin component for displaying and managing a single order's details.
 * 
 * Features:
 * - Displays full order details: customer info, items, message, shipping address
 * - Status update dropdown (new, contacted, completed, cancelled)
 * - Shows order creation and update dates
 * - Loading state while fetching data
 * - Error handling and display
 * - Success message after status update
 * - Responsive design
 * 
 * Requirements: Design - Order Management Components
 */
export default function OrderDetail({ orderId, className = '' }: OrderDetailProps) {
  const { success, error: showError } = useToast();
  
  // State management
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('new');
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Fetch order details from API
   */
  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch with Basic Auth
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Basic ${btoa(`${process.env.NEXT_PUBLIC_ADMIN_USERNAME}:${process.env.NEXT_PUBLIC_ADMIN_PASSWORD}`)}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Order not found');
        }
        throw new Error('Failed to fetch order');
      }

      const data: ApiResponse<Order> = await response.json();

      if (data.success && data.data) {
        setOrder(data.data);
        setSelectedStatus(data.data.status);
      } else {
        throw new Error(data.error?.message || 'Failed to fetch order');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch order on mount
  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  /**
   * Handle status update
   */
  const handleStatusUpdate = async () => {
    if (!order || selectedStatus === order.status) {
      return;
    }

    try {
      setIsSaving(true);

      // Update with Basic Auth
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${process.env.NEXT_PUBLIC_ADMIN_USERNAME}:${process.env.NEXT_PUBLIC_ADMIN_PASSWORD}`)}`,
        },
        body: JSON.stringify({ status: selectedStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const data: ApiResponse<Order> = await response.json();

      if (data.success && data.data) {
        setOrder(data.data);
        success('Status Updated', 'Order status has been updated successfully');
      } else {
        throw new Error(data.error?.message || 'Failed to update order status');
      }
    } catch (err) {
      showError('Update Failed', err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  /**
   * Calculate order total
   */
  const calculateTotal = () => {
    if (!order) return 0;
    return order.items.reduce((sum, item) => sum + (item.priceAtTime * item.quantity), 0);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Order Information skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>

        {/* Customer Information skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !order) {
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
            Error loading order
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">{error || 'Order not found'}</p>
          <Button onClick={fetchOrder} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Order Information */}
      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
          <CardDescription>Order #{order.orderNumber}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Order Number
              </label>
              <p className="text-base font-medium">{order.orderNumber}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Status
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {selectedStatus !== order.status && (
                  <Button
                    onClick={handleStatusUpdate}
                    disabled={isSaving}
                    size="sm"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Created At
              </label>
              <p className="text-base">{formatDate(order.createdAt)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Last Updated
              </label>
              <p className="text-base">{formatDate(order.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Name
              </label>
              <p className="text-base">{order.customerName}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Email
              </label>
              <p className="text-base">
                <a
                  href={`mailto:${order.customerEmail}`}
                  className="text-primary hover:underline"
                >
                  {order.customerEmail}
                </a>
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Phone
              </label>
              <p className="text-base">
                <a
                  href={`tel:${order.customerPhone}`}
                  className="text-primary hover:underline"
                >
                  {order.customerPhone}
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-3 border-b last:border-b-0"
              >
                <div className="flex-1">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(item.priceAtTime)}</p>
                  <p className="text-sm text-muted-foreground">per item</p>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-4 border-t-2">
              <p className="text-lg font-semibold">Total</p>
              <p className="text-lg font-semibold">{formatCurrency(calculateTotal())}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address (if provided) */}
      {order.shippingAddress && (
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message (if provided) */}
      {order.message && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Message</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base whitespace-pre-wrap">{order.message}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
