'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PreparationGuide from './PreparationGuide';
import { InquiryForm } from '@/components/orders/InquiryForm';
import type { Product } from '@/types/product.types';

/**
 * ProductDetail Component Props
 */
export interface ProductDetailProps {
  product: Product;
}

/**
 * ProductDetail Component
 * 
 * Displays full product information with image gallery, preparation steps,
 * nutrition information, and inquiry form.
 * 
 * Features:
 * - Image gallery with main image and thumbnails
 * - Product name, category, price, and description
 * - PreparationGuide component for preparation steps
 * - Nutrition information display (if available)
 * - Inquiry form dialog (placeholder until Task 20.1)
 * - Responsive design for mobile and desktop
 * - Uses Shadcn Card and Dialog components
 * 
 * Requirements: Design - Product Components
 */
export default function ProductDetail({ product }: ProductDetailProps) {
  const {
    name,
    category,
    description,
    price,
    currency,
    images,
    preparationSteps,
    nutritionInfo,
  } = product;

  // Track selected image for gallery
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Format price with currency
  const formattedPrice = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency || 'GBP',
  }).format(price);

  // Capitalize category for display
  const displayCategory = category.charAt(0).toUpperCase() + category.slice(1);

  // Use images or fallback to placeholder
  const productImages = images && images.length > 0 
    ? images 
    : ['/images/placeholders/product.jpg'];

  const selectedImage = productImages[selectedImageIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Product Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative w-full h-96 lg:h-[500px] rounded-lg overflow-hidden bg-muted">
            <Image
              src={selectedImage}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Thumbnail Gallery */}
          {productImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative h-20 rounded-md overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-transparent hover:border-muted-foreground/30'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${name} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="150px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          {/* Category Badge */}
          <div className="inline-block">
            <span className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full">
              {displayCategory}
            </span>
          </div>

          {/* Product Name */}
          <h1 className="text-4xl font-bold text-foreground">
            {name}
          </h1>

          {/* Price */}
          <div className="text-3xl font-bold text-primary">
            {formattedPrice}
          </div>

          {/* Description */}
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground text-base leading-relaxed whitespace-pre-wrap">
              {description}
            </p>
          </div>

          {/* Inquiry Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full sm:w-auto">
                Make an Inquiry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Product Inquiry</DialogTitle>
              </DialogHeader>
              <InquiryForm productId={product._id} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Preparation Guide Section */}
      {preparationSteps && preparationSteps.length > 0 && (
        <div className="mb-12">
          <PreparationGuide steps={preparationSteps} />
        </div>
      )}

      {/* Nutrition Information Section */}
      {nutritionInfo && (
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Nutrition Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* Serving Size */}
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Serving Size</p>
                <p className="text-lg font-bold">{nutritionInfo.servingSize}</p>
              </div>

              {/* Calories */}
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Calories</p>
                <p className="text-lg font-bold">{nutritionInfo.calories}</p>
              </div>

              {/* Protein */}
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Protein</p>
                <p className="text-lg font-bold">{nutritionInfo.protein}</p>
              </div>

              {/* Carbs */}
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Carbs</p>
                <p className="text-lg font-bold">{nutritionInfo.carbs}</p>
              </div>

              {/* Fat */}
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Fat</p>
                <p className="text-lg font-bold">{nutritionInfo.fat}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
