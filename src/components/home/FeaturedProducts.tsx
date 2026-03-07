'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useProducts } from '@/lib/hooks/useProducts';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/utils/logger';
import ProductCard from '@/components/products/ProductCard';

/**
 * FeaturedProducts Component
 * 
 * Displays featured products on the homepage with:
 * - Fetches featured products using useProducts hook
 * - Displays products in a responsive grid layout
 * - Uses SimpleProductCard for each product (temporary until task 19.1)
 * - Includes "View All Products" button
 * - Handles loading and empty states
 * - Dynamic title and subtitle from content API
 * 
 * Requirements: Design - Home Components
 */
export default function FeaturedProducts() {
  const [title, setTitle] = useState('Featured Products');
  const [subtitle, setSubtitle] = useState('Discover our handpicked selection of authentic African delicacies');

  const { products, isLoading, isError, error } = useProducts({
    filters: { featured: true },
    pagination: { limit: 12 },
    revalidateOnFocus: false,
  });

  // Fetch dynamic content for title and subtitle
  useEffect(() => {
    async function fetchContent() {
      try {
        const [titleResponse, subtitleResponse] = await Promise.all([
          fetch('/api/content?key=featured_section_title'),
          fetch('/api/content?key=featured_section_subtitle')
        ]);

        if (titleResponse.ok) {
          const titleData = await titleResponse.json();
          if (titleData.success && titleData.data?.data?.value) {
            setTitle(titleData.data.data.value);
          }
        }

        if (subtitleResponse.ok) {
          const subtitleData = await subtitleResponse.json();
          if (subtitleData.success && subtitleData.data?.data?.value) {
            setSubtitle(subtitleData.data.data.value);
          }
        }
      } catch (err) {
        console.error('Failed to fetch featured section content:', err);
      }
    }

    fetchContent();
  }, []);

  // Log errors for debugging
  if (isError && error) {
    logger.error('Failed to fetch featured products', { error });
  }

  return (
    <section className="w-full py-12 px-4 md:px-8">
      {/* Section Title */}
      <div className="max-w-7xl mx-auto mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">
          {title}
        </h2>
        <p className="text-center text-muted-foreground">
          {subtitle}
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <Card key={index} className="overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-muted" />
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-1/3" />
                </CardContent>
                <CardFooter>
                  <div className="h-10 bg-muted rounded w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="max-w-7xl mx-auto">
          <Card className="p-8 text-center">
            <p className="text-destructive mb-4">
              Failed to load featured products. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && products.length === 0 && (
        <div className="max-w-7xl mx-auto">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              No featured products available at the moment.
            </p>
            <Button asChild>
              <Link href="/products">Browse All Products</Link>
            </Button>
          </Card>
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && !isError && products.length > 0 && (
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* View All Products Button */}
          <div className="mt-12 text-center">
            <Button asChild size="lg" variant="outline">
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
