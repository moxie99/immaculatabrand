'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/utils/logger';

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
 * Displays the hero section on the homepage with:
 * - Hero image from Media collection (type=hero)
 * - Hero text from Content collection (key=homepage_hero)
 * - CTA button linking to products page
 * 
 * Requirements: Design - Home Components
 */
export default function HeroSection() {
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [heroImage, setHeroImage] = useState<HeroMedia | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHeroData() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch hero content and image in parallel
        const [contentResponse, mediaResponse] = await Promise.all([
          fetch('/api/content?key=homepage_hero'),
          fetch('/api/media/hero?limit=1'),
        ]);

        // Check for errors
        if (!contentResponse.ok || !mediaResponse.ok) {
          throw new Error('Failed to fetch hero data');
        }

        const contentData = await contentResponse.json();
        const mediaData = await mediaResponse.json();

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
      <Card className="w-full h-[500px] md:h-[600px] flex items-center justify-center bg-muted animate-pulse">
        <p className="text-muted-foreground">Loading...</p>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="w-full h-[500px] md:h-[600px] flex items-center justify-center bg-muted">
        <p className="text-destructive">{error}</p>
      </Card>
    );
  }

  // Default content if not loaded
  const content = heroContent || {
    heading: 'Authentic African Delicacies',
    subheading: 'Delivered to Your Doorstep',
    ctaText: 'Browse Products',
    ctaLink: '/products',
  };

  return (
    <Card className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      {/* Hero Image */}
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
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10" />
      )}

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Hero Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4 md:px-8 z-10">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
          {content.heading}
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl drop-shadow-md">
          {content.subheading}
        </p>
        <Button asChild size="lg" className="text-lg px-8 py-6">
          <Link href={content.ctaLink}>{content.ctaText}</Link>
        </Button>
      </div>
    </Card>
  );
}
