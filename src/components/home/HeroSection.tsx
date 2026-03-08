'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/utils/logger';
import { Product } from '@/types/product.types';

interface HeroContent {
  heading: string;
  subheading: string;
  ctaText: string;
  ctaLink: string;
}

interface HeroMedia {
  secureUrl: string;
  altText: string;
  width: number;
  height: number;
}

/**
 * HeroSection Component
 * 
 * Modern glassmorphism hero section inspired by European Youth Summit design.
 * Features:
 * - Hero image background with overlay
 * - Glassmorphism card with hero content
 * - Featured products showcase on the right
 * - "View Products" CTA button
 * 
 * Requirements: Design - Home Components
 */
export default function HeroSection() {
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [heroImage, setHeroImage] = useState<HeroMedia | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHeroData() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch hero content, image, and featured products in parallel
        const [contentResponse, mediaResponse, productsResponse] = await Promise.all([
          fetch('/api/content?key=homepage_hero'),
          fetch('/api/media/hero?limit=1'),
          fetch('/api/products?featured=true&limit=3&active=true'),
        ]);

        // Check for errors
        if (!contentResponse.ok || !mediaResponse.ok || !productsResponse.ok) {
          throw new Error('Failed to fetch hero data');
        }

        const contentData = await contentResponse.json();
        const mediaData = await mediaResponse.json();
        const productsData = await productsResponse.json();

        // Extract content
        if (contentData.success && contentData.data) {
          setHeroContent(contentData.data.data as HeroContent);
        }

        // Extract first hero image
        if (mediaData.success && mediaData.data && mediaData.data.length > 0) {
          const media = mediaData.data[0];
          setHeroImage({
            secureUrl: media.secureUrl,
            altText: media.altText,
            width: media.width,
            height: media.height,
          });
        }

        // Extract featured products
        if (productsData.success && productsData.data) {
          setFeaturedProducts(productsData.data);
        }
      } catch (err) {
        logger.error('Failed to fetch hero data', { error: err });
        setError('Failed to load hero section');
      } finally {
        setIsLoading(false);
      }
    }

    fetchHeroData();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="relative w-full h-[600px] md:h-[700px] bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative w-full h-[600px] md:h-[700px] bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // Default content if not loaded
  const content = heroContent || {
    heading: 'EMPOWERING TASTE, SHAPING GLOBAL CUISINE, BUILDING TOMORROW',
    subheading: 'Discover authentic African delicacies and premium ingredients from across the continent',
    ctaText: 'View Products',
    ctaLink: '/products',
  };

  return (
    <div className="relative w-full h-[600px] md:h-[700px] overflow-hidden">
      {/* Hero Background Image */}
      {heroImage ? (
        <Image
          src={heroImage.secureUrl}
          alt={heroImage.altText}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200" />
      )}

      {/* Overlay for glassmorphism effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/20 via-gray-800/10 to-slate-900/20 backdrop-blur-sm" />

      {/* Main Content Container */}
      <div className="relative h-full flex items-center justify-between px-4 md:px-8 lg:px-16 z-10">
        {/* Left Side - Glassmorphism Hero Card */}
        <div className="flex-1 max-w-2xl">
          <div className="backdrop-blur-xl bg-white/80 border border-white/40 rounded-3xl p-8 md:p-12 shadow-2xl shadow-slate-900/10">
            {/* Year Badge */}
            <div className="inline-block px-6 py-2 bg-slate-900/10 backdrop-blur-sm rounded-full text-slate-800 font-bold text-lg mb-6 border border-slate-200/50">
              2025
            </div>
            
            {/* Main Heading */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              {content.heading}
            </h1>
            
            {/* Subheading */}
            <p className="text-lg md:text-xl text-slate-700 mb-8 leading-relaxed">
              {content.subheading}
            </p>
            
            {/* CTA Button */}
            <Button 
              asChild 
              size="lg" 
              className="bg-slate-900 hover:bg-slate-800 text-white border-0 text-lg px-8 py-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Link href={content.ctaLink} className="flex items-center gap-2">
                {content.ctaText}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </Button>
          </div>
        </div>

        {/* Right Side - Featured Products */}
        <div className="hidden lg:flex flex-col gap-4 ml-8">
          {featuredProducts.slice(0, 3).map((product) => (
            <Link
              key={product._id}
              href={`/products/${product.slug}`}
              className="group"
            >
              <div className="backdrop-blur-xl bg-white/90 border border-white/50 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-80">
                <div className="flex items-center gap-4">
                  {/* Product Image */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="text-slate-900 font-semibold text-sm mb-1 group-hover:text-slate-700 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-slate-600 text-xs mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    <p className="text-slate-900 font-bold text-sm">
                      £{product.price.toFixed(2)}
                    </p>
                  </div>
                  
                  {/* Arrow Icon */}
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
          
          {/* View All Products Link */}
          <Link
            href="/products"
            className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl p-4 text-center hover:bg-white/80 transition-all duration-300 hover:scale-105 w-80 shadow-md hover:shadow-lg"
          >
            <p className="text-slate-700 text-sm font-medium">
              View All Products →
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
