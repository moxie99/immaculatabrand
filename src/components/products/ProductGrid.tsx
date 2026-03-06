'use client';

import React from 'react';
import ProductCard from './ProductCard';
import { Card, CardContent } from '@/components/ui/card';
import type { Product } from '@/types/product.types';

/**
 * ProductGrid Component Props
 */
export interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

/**
 * ProductGrid Component
 * 
 * Displays products in a responsive grid layout.
 * 
 * Features:
 * - Responsive grid: 1 column mobile, 2 columns tablet, 3-4 columns desktop
 * - Uses ProductCard component for each product
 * - Loading skeleton with animated cards
 * - Empty state when no products available
 * - Can be used as server or client component
 * 
 * Requirements: Design - Product Components
 */
export default function ProductGrid({ products, isLoading = false }: ProductGridProps) {
  // Loading state - show skeleton cards
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Image skeleton */}
              <div className="w-full h-48 bg-muted animate-pulse" />
              
              {/* Content skeleton */}
              <div className="p-6 space-y-3">
                {/* Title skeleton */}
                <div className="h-6 bg-muted animate-pulse rounded" />
                <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
                
                {/* Category skeleton */}
                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                
                {/* Price skeleton */}
                <div className="h-8 bg-muted animate-pulse rounded w-1/3 mt-4" />
                
                {/* Button skeleton */}
                <div className="h-10 bg-muted animate-pulse rounded mt-4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Empty state - no products
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center max-w-md">
          <svg
            className="mx-auto h-24 w-24 text-muted-foreground/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <h3 className="mt-6 text-xl font-semibold text-foreground">
            No products found
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            There are currently no products available in this category. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  // Display products in grid
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
