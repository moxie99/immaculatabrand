'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Package, CheckCircle, AlertCircle } from 'lucide-react';

interface Stats {
  totalOrders: number;
  newOrders: number;
  totalProducts: number;
  activeProducts: number;
}

interface DashboardStatsProps {
  className?: string;
}

export default function DashboardStats({ className }: DashboardStatsProps) {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    newOrders: 0,
    totalProducts: 0,
    activeProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        // Fetch orders and products in parallel
        const [ordersResponse, productsResponse] = await Promise.all([
          fetch('/api/orders', {
            headers: {
              Authorization: `Basic ${btoa(
                `${process.env.NEXT_PUBLIC_ADMIN_USERNAME || ''}:${process.env.NEXT_PUBLIC_ADMIN_PASSWORD || ''}`
              )}`,
            },
          }),
          fetch('/api/products'),
        ]);

        if (!ordersResponse.ok || !productsResponse.ok) {
          throw new Error('Failed to fetch stats');
        }

        const ordersData = await ordersResponse.json();
        const productsData = await productsResponse.json();

        // Calculate stats
        const totalOrders = ordersData.pagination?.total || 0;
        const newOrders = ordersData.data?.filter(
          (order: any) => order.status === 'new'
        ).length || 0;
        const totalProducts = productsData.pagination?.total || 0;
        const activeProducts = productsData.data?.filter(
          (product: any) => product.isActive === true
        ).length || 0;

        setStats({
          totalOrders,
          newOrders,
          totalProducts,
          activeProducts,
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className={className}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      description: 'All customer inquiries',
    },
    {
      title: 'New Orders',
      value: stats.newOrders,
      icon: AlertCircle,
      description: 'Pending follow-up',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      description: 'All products in catalog',
    },
    {
      title: 'Active Products',
      value: stats.activeProducts,
      icon: CheckCircle,
      description: 'Visible to customers',
    },
  ];

  return (
    <div className={className}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
