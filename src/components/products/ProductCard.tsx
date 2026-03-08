'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types/product.types';

/**
 * ProductCard Component Props
 */
export interface ProductCardProps {
  product: Product;
}

/**
 * ProductCard Component
 *
 * A reusable product card component for displaying products in grids.
 *
 * Features:
 * - Displays product image from Cloudinary using Next.js Image component
 * - Shows product name, category, and formatted price
 * - Includes "View Details" button linking to /products/[id]
 * - Uses Shadcn Card component for consistent styling
 * - Hover effects (shadow, scale)
 * - Responsive and works in grid layouts
 * - Handles missing images gracefully with placeholder
 *
 * Requirements: Design - Product Components
 */
export default function ProductCard({ product }: ProductCardProps) {
  const { name, price, currency, images, category, slug } = product;

  // Use first image or fallback to placeholder
  const imageUrl =
    images && images.length > 0
      ? images[0]
      : '/images/placeholders/product.jpg';

  // Format price with currency
  const formattedPrice = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency || 'GBP',
  }).format(price);

  // Capitalize category for display
  const displayCategory = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-white/80 backdrop-blur-sm border-white/40 hover:border-white/60">
      {/* Product Image */}
      <div className="relative w-full h-48 overflow-hidden bg-muted rounded-t-xl">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={false}
        />
        {/* Glass overlay on hover */}
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300 rounded-t-xl" />
      </div>

      {/* Product Info */}
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="text-base line-clamp-1 font-semibold text-slate-800">
          {name}
        </CardTitle>
        <p className="text-xs text-slate-500 capitalize mt-0.5">
          {displayCategory}
        </p>
      </CardHeader>

      {/* Price */}
      <CardContent className="pb-2">
        <p className="text-xl font-bold text-slate-800">{formattedPrice}</p>
      </CardContent>

      {/* Action Button */}
      <CardFooter className="pt-1 pb-3">
        <Button
          asChild
          className="w-full transition-all duration-300 bg-slate-800 hover:bg-slate-700 text-sm py-1.5 h-9"
        >
          <Link href={`/products/${slug}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
