'use client';

import React from 'react';
import OrderDetail from '@/components/orders/OrderDetail';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * Order Detail Page
 * 
 * Route: /admin/orders/[id]
 * 
 * Features:
 * - Fetch order data by ID
 * - Render OrderDetail component
 * - Add back button to orders list
 * 
 * Requirements: Design - Dashboard Pages (Task 24.6)
 */

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Order Details
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage order details
          </p>
        </div>
      </div>

      {/* Order Detail */}
      <OrderDetail orderId={params.id} />
    </div>
  );
}
