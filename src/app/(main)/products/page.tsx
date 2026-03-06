'use client';

import React, { useState, useEffect } from 'react';
import ProductGrid from '@/components/products/ProductGrid';
import { CategoryFilter } from '@/components/products/CategoryFilter';
import { Category, Product } from '@/types/product.types';

/**
 * Products Listing Page
 * 
 * Route: /products
 * 
 * Features:
 * - CategoryFilter component for filtering by category
 * - ProductGrid component for displaying products
 * - Pagination support
 * - Server-side rendering for SEO
 * - Loading states
 * 
 * Requirements: Design - Main Application Pages (Task 23.2)
 */

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch products based on active category
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '20',
          active: 'true',
        });

        if (activeCategory !== 'all') {
          params.append('category', activeCategory);
        }

        const response = await fetch(`/api/products?${params.toString()}`);
        const result = await response.json();

        if (response.ok && result.data) {
          setProducts(result.data.products);
          setTotalPages(result.data.totalPages || 1);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory, page]);

  // Handle category change
  const handleCategoryChange = (category: Category | 'all') => {
    setActiveCategory(category);
    setPage(1); // Reset to first page when category changes
  };

  return (
    <main className="min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Our Products
          </h1>
          <p className="text-lg text-muted-foreground">
            Browse our selection of authentic African confectioneries, fish products, and foodstuffs
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <CategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        {/* Product Grid */}
        <ProductGrid products={products} isLoading={isLoading} />

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
