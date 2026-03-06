import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/products/ProductDetail';
import { getProductById } from '@/lib/services/product.service';

/**
 * Product Detail Page
 * 
 * Route: /products/[id]
 * 
 * Features:
 * - Fetch product by ID
 * - Render ProductDetail component
 * - Server-side rendering for SEO
 * - Structured data (JSON-LD) for rich snippets
 * - Dynamic metadata with product name
 * 
 * Requirements: Design - Main Application Pages (Task 23.4)
 */

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

/**
 * Generate metadata for product detail page
 */
export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  try {
    const product = await getProductById(params.id);

    const formattedPrice = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: product.currency || 'GBP',
    }).format(product.price / 100);

    return {
      title: `${product.name} | Confectionary Platform`,
      description: product.description.substring(0, 160),
      keywords: [product.name, product.category, 'African food', 'authentic', formattedPrice],
      openGraph: {
        title: `${product.name} | Confectionary Platform`,
        description: product.description.substring(0, 160),
        type: 'website',
        images: product.images.length > 0 ? [product.images[0]] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} | Confectionary Platform`,
        description: product.description.substring(0, 160),
        images: product.images.length > 0 ? [product.images[0]] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Product Not Found',
    };
  }
}

/**
 * Product Detail Page Component
 */
export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  let product;

  try {
    product = await getProductById(params.id);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    notFound();
  }

  // Check if product is active
  if (!product.isActive) {
    notFound();
  }

  // Convert product to plain object for client component
  const plainProduct = {
    _id: product._id.toString(),
    name: product.name,
    slug: product.slug,
    category: product.category,
    description: product.description,
    price: product.price,
    currency: product.currency as 'GBP' | 'USD' | 'EUR',
    images: product.images,
    preparationSteps: product.preparationSteps,
    nutritionInfo: product.nutritionInfo,
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    createdAt: new Date(product.createdAt),
    updatedAt: new Date(product.updatedAt),
  };

  // Generate structured data (JSON-LD) for rich snippets
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.length > 0 ? product.images : undefined,
    category: product.category,
    offers: {
      '@type': 'Offer',
      price: (product.price / 100).toFixed(2),
      priceCurrency: product.currency || 'GBP',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Product Detail Component */}
      <ProductDetail product={plainProduct} />
    </>
  );
}
