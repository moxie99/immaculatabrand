'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardStats from '@/components/admin/DashboardStats';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Eye } from 'lucide-react';
import { Order } from '@/types/order.types';

/**
 * Admin Dashboard Home Page
 * 
 * Route: /admin
 * 
 * Features:
 * - DashboardStats component showing key metrics
 * - Recent orders (last 10)
 * - Quick action buttons (Add Product, View Orders)
 * 
 * Requirements: Design - Dashboard Pages (Task 24.1)
 */

export default function AdminDashboardPage() {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const response = await fetch('/api/orders?limit=10&sort=createdAt:desc');
        const result = await response.json();
        
        if (response.ok && result.data) {
          setRecentOrders(result.data.orders);
        }
      } catch (error) {
        console.error('Failed to fetch recent orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentOrders();
  }, []);

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your admin dashboard
        </p>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Link href="/admin/products/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button variant="outline" className="gap-2">
              <Eye className="h-4 w-4" />
              View Orders
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading orders...
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders yet
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <Link
                  key={order._id}
                  href={`/admin/orders/${order._id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium">{order.orderNumber}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.customerName} • {order.customerEmail}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'new'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'contacted'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
