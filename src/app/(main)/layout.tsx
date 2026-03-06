import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

/**
 * Main Layout
 * 
 * Layout for all public-facing pages (home, products, about, contact).
 * Includes Header and Footer components with main content wrapper.
 * 
 * Requirements: Design - Layouts (Task 25.2)
 */

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
