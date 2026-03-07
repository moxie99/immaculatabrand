'use client';

import React from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminAuthProvider } from '@/components/admin/AdminAuthProvider';

/**
 * Admin Layout
 * 
 * Layout for all admin dashboard pages.
 * Includes AdminSidebar for navigation and AdminAuthProvider for authentication.
 * 
 * Features:
 * - Modern, centered login modal with blur backdrop
 * - Session management with 2-minute inactivity timeout
 * - Automatic logout on session expiration
 * - Activity tracking to maintain session
 * 
 * Requirements: Design - Layouts (Task 25.3)
 */

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 bg-muted/10">
          {children}
        </main>
      </div>
    </AdminAuthProvider>
  );
}
