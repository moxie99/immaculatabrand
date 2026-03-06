import React from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';

/**
 * Admin Layout
 * 
 * Layout for all admin dashboard pages.
 * Includes AdminSidebar for navigation.
 * 
 * All routes under /admin are protected by Basic Auth middleware.
 * 
 * Requirements: Design - Layouts (Task 25.3)
 */

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-muted/10">
        {children}
      </main>
    </div>
  );
}
