'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
  const { _id, name, price, currency, images, category } = product;

  // Use first image or fallback to placeholder
  const imageUrl = images && images.length > 0 
    ? images[0] 
    : '/images/placeholders/product.jpg';

  // Format price with currency
  const formattedPrice = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency || 'GBP',
  }).format(price / 100);

  // Capitalize category for display
  const displayCategory = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      {/* Product Image */}
      <div className="relative w-full h-48 overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={false}
        />
      </div>

      {/* Product Info */}
      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-2 min-h-[3.5rem]">
          {name}
        </CardTitle>
        <p className="text-sm text-muted-foreground capitalize mt-1">
          {displayCategory}
        </p>
      </CardHeader>

      {/* Price */}
      <CardContent className="pb-3">
        <p className="text-2xl font-bold text-primary">
          {formattedPrice}
        </p>
      </CardContent>

      {/* Action Button */}
      <CardFooter className="pt-0">
        <Button asChild className="w-full group-hover:bg-primary/90 transition-colors">
          <Link href={`/products/${_id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
