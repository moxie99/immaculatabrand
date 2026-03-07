'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Card } from '@/components/ui/card';
import { logger } from '@/lib/utils/logger';
import Autoplay from 'embla-carousel-autoplay';

interface CarouselMedia {
  _id: string;
  secureUrl: string;
  altText: string;
  width: number;
  height: number;
}

/**
 * ImageCarousel Component
 * 
 * Displays an image carousel on the homepage with:
 * - Carousel images from Media collection (type=carousel)
 * - Auto-play functionality
 * - Navigation controls (previous/next buttons)
 * - Dot indicators for current slide
 * - Responsive design
 * 
 * Requirements: Design - Home Components
 */
export default function ImageCarousel() {
  const [carouselImages, setCarouselImages] = useState<CarouselMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  // Auto-play plugin configuration
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  // Reset autoplay plugin on mount to ensure proper initialization
  React.useEffect(() => {
    return () => {
      // Cleanup on unmount - stop autoplay
      if (autoplayPlugin.current && typeof autoplayPlugin.current.stop === 'function') {
        autoplayPlugin.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    async function fetchCarouselImages() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/media/carousel');

        if (!response.ok) {
          throw new Error('Failed to fetch carousel images');
        }

        const data = await response.json();

        if (data.success && data.data) {
          setCarouselImages(data.data);
        }
      } catch (err) {
        logger.error('Failed to fetch carousel images', { error: err });
        setError('Failed to load carousel images');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCarouselImages();
  }, []);

  // Update current slide index when carousel changes
  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Handle dot indicator click
  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full h-[400px] md:h-[500px] flex items-center justify-center bg-muted animate-pulse">
        <p className="text-muted-foreground">Loading carousel...</p>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="w-full h-[400px] md:h-[500px] flex items-center justify-center bg-muted">
        <p className="text-destructive">{error}</p>
      </Card>
    );
  }

  // Empty state
  if (carouselImages.length === 0) {
    return (
      <Card className="w-full h-[400px] md:h-[500px] flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">No carousel images available</p>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <Carousel
        setApi={setApi}
        opts={{
          align: 'start',
          loop: true,
        }}
        plugins={[autoplayPlugin.current]}
        className="w-full"
        onMouseEnter={() => {
          if (autoplayPlugin.current && typeof autoplayPlugin.current.stop === 'function') {
            autoplayPlugin.current.stop();
          }
        }}
        onMouseLeave={() => {
          if (autoplayPlugin.current && typeof autoplayPlugin.current.play === 'function') {
            autoplayPlugin.current.play();
          }
        }}
      >
        <CarouselContent>
          {carouselImages.map((image) => (
            <CarouselItem key={image._id}>
              <Card className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
                <Image
                  src={image.secureUrl}
                  alt={image.altText}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority={carouselImages.indexOf(image) === 0}
                />
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation buttons - positioned inside the carousel */}
        <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
          <CarouselPrevious className="pointer-events-auto relative left-0 translate-x-0 translate-y-0" />
          <CarouselNext className="pointer-events-auto relative right-0 translate-x-0 translate-y-0" />
        </div>
      </Carousel>

      {/* Dot indicators */}
      {count > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`h-2 rounded-full transition-all ${
                index === current
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === current ? 'true' : 'false'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
