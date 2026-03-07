'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/types/product.types';

/**
 * CakesAndPastries Component
 * 
 * Displays a curated selection of confectionary products (cakes, pastries, bread)
 * on the homepage with a grid layout.
 * 
 * Features:
 * - Fetches confectionary category products
 * - Displays up to 6 products in a grid
 * - Product cards with image, name, price, and "Learn More" button
 * - "View All Products" button to navigate to products page
 * - Responsive design (1 column mobile, 2 columns tablet, 3 columns desktop)
 */
export default function CakesAndPastries() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchConfectionaryProducts() {
      try {
        setIsLoading(true);
        
        // Fetch confectionary products
        const response = await fetch('/api/products?category=confectionary&limit=6&active=true');
        const data = await response.json();

        if (data.success && data.data) {
          setProducts(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch confectionary products:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchConfectionaryProducts();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <section className="w-full py-16 px-4 md:px-8 bg-gradient-to-b from-amber-50/80 to-orange-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Cakes and Pastries
            </h2>
            <p className="text-lg text-muted-foreground">
              Loading delicious treats...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden bg-white">
                <div className="aspect-square bg-gradient-to-br from-amber-100 to-orange-100 animate-pulse" />
                <CardContent className="p-4">
                  <div className="h-6 bg-amber-100 animate-pulse rounded mb-2" />
                  <div className="h-4 bg-amber-100 animate-pulse rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <section className="w-full py-16 px-4 md:px-8 bg-gradient-to-b from-amber-50/80 to-orange-50/50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Cakes and Pastries
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Coming soon! Check back later for our delicious selection.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-16 px-4 md:px-8 bg-gradient-to-b from-amber-50/80 to-orange-50/50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Cakes and Pastries
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our authentic African confectioneries, from traditional cakes to freshly baked pastries and bread
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {products.map((product) => (
            <Card key={product._id} className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-white border-amber-100">
              {/* Product Image */}
              <div className="relative aspect-square bg-muted">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-amber-50 to-orange-50">
                    <svg
                      className="w-16 h-16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {product.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    £{product.price.toFixed(2)}
                  </span>
                  <Button asChild variant="default" size="sm" className="shadow-md hover:shadow-lg transition-shadow">
                    <Link href={`/products/${product.slug}`}>
                      Learn More
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button asChild size="lg" className="bg-white hover:bg-gray-50 text-primary border-2 border-primary/20 shadow-md hover:shadow-lg transition-all">
            <Link href="/products?category=confectionary">
              View All Products
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
