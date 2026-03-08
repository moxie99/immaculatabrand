'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/types/product.types';

/**
 * FoodstuffsSection Component
 *
 * Displays a curated selection of foodstuffs products
 * on the homepage with a grid layout.
 *
 * Features:
 * - Fetches foodstuffs category products
 * - Displays up to 6 products in a grid
 * - Product cards with image, name, price, and "Discover More" button
 * - "View All Products" button to navigate to products page
 * - Responsive design (1 column mobile, 2 columns tablet, 3 columns desktop)
 * - Dynamic title and subtitle from Content API
 */
export default function FoodstuffsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('Premium Foodstuffs');
  const [subtitle, setSubtitle] = useState(
    'Explore our selection of authentic African foodstuffs and ingredients'
  );

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);

        // Fetch content for section title and subtitle
        const [titleResponse, subtitleResponse, productsResponse] =
          await Promise.all([
            fetch('/api/content?key=foodstuffs_section_title'),
            fetch('/api/content?key=foodstuffs_section_subtitle'),
            fetch('/api/products?category=foodstuffs&limit=6&active=true'),
          ]);

        // Process title
        if (titleResponse.ok) {
          const titleData = await titleResponse.json();
          if (titleData.success && titleData.data?.data?.value) {
            setTitle(titleData.data.data.value);
          }
        }

        // Process subtitle
        if (subtitleResponse.ok) {
          const subtitleData = await subtitleResponse.json();
          if (subtitleData.success && subtitleData.data?.data?.value) {
            setSubtitle(subtitleData.data.data.value);
          }
        }

        // Process products
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          if (productsData.success && productsData.data) {
            setProducts(productsData.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch foodstuffs data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <section className="w-full py-16 px-4 md:px-8 bg-gradient-to-b from-green-50/60 to-emerald-50/40">
        <div className="max-w-7xl mx-auto backdrop-blur-xl bg-white/60 border border-white/40 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              {title}
            </h2>
            <p className="text-lg text-slate-600">
              Loading premium foodstuffs...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                className="overflow-hidden bg-white/80 backdrop-blur-sm"
              >
                <div className="aspect-square bg-gradient-to-br from-green-100 to-emerald-100 animate-pulse" />
                <CardContent className="p-4">
                  <div className="h-6 bg-green-100 animate-pulse rounded mb-2" />
                  <div className="h-4 bg-green-100 animate-pulse rounded w-1/2" />
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
      <section className="w-full py-16 px-4 md:px-8 bg-gradient-to-b from-green-50/60 to-emerald-50/40">
        <div className="max-w-7xl mx-auto backdrop-blur-xl bg-white/60 border border-white/40 rounded-3xl p-6 md:p-8 shadow-xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            {title}
          </h2>
          <p className="text-lg text-slate-600 mb-8">{subtitle}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-16 px-4 md:px-8 bg-gradient-to-b from-green-50/60 to-emerald-50/40">
      <div className="max-w-7xl mx-auto backdrop-blur-xl bg-white/60 border border-white/40 rounded-3xl p-6 md:p-8 shadow-xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            {title}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">{subtitle}</p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {products.map((product) => (
            <Card
              key={product._id}
              className="group overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 bg-white/80 backdrop-blur-sm border-green-100/50 hover:border-green-200/60"
            >
              {/* Product Image */}
              <div className="relative aspect-square bg-muted overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-green-50 to-emerald-50">
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
                {/* Glass overlay on hover */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
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
                  <Button
                    asChild
                    variant="default"
                    size="sm"
                    className="shadow-md hover:shadow-lg transition-all duration-300 bg-green-600 hover:bg-green-700"
                  >
                    <Link href={`/products/${product.slug}`}>
                      Discover More
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="backdrop-blur-sm bg-white hover:bg-gray-50 text-green-800 border-2 border-green-200/50 shadow-md hover:shadow-lg transition-all"
          >
            <Link href="/products?category=foodstuffs">
              View All Foodstuffs
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
