'use client';

import React from 'react';
import OrderTable from '@/components/orders/OrderTable';

/**
 * Orders Management Page
 * 
 * Route: /admin/orders
 * 
 * Features:
 * - Render OrderTable component
 * - Add status filter (all, new, contacted, completed, cancelled)
 * - Add date range filter
 * 
 * Requirements: Design - Dashboard Pages (Task 24.5)
 */

export default function OrdersManagementPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground mt-2">
          Manage customer inquiries and orders
        </p>
      </div>

      {/* Orders Table */}
      <OrderTable />
    </div>
  );
}
