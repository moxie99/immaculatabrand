'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';

interface CarouselImage {
  _id: string;
  url: string;
  altText?: string;
}

/**
 * AboutUsSection Component
 * 
 * Displays company history with an auto-scrolling carousel on the left
 * and biography/story content on the right.
 * 
 * Features:
 * - Auto-scrolling carousel with company images
 * - Dynamic content from Content API
 * - Responsive two-column layout (stacks on mobile)
 * - Modern, enterprise-level design
 */
export default function AboutUsSection() {
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [title, setTitle] = useState('A Taste of Tradition');
  const [subtitle, setSubtitle] = useState('Our Story');
  const [content, setContent] = useState(
    'Founded in 2025, we reflect the vibrant spirit of authentic bakeries. Rooted in tradition yet driven by innovation, we craft every bun, tart, and cake to honour authentic recipes while reimagining new products for today\'s tastes.'
  );
  const [isLoading, setIsLoading] = useState(true);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  // Ensure autoplay starts
  useEffect(() => {
    if (emblaApi && carouselImages.length > 0) {
      emblaApi.reInit();
    }
  }, [emblaApi, carouselImages]);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);

        // Fetch carousel images
        const imagesResponse = await fetch('/api/media/carousel');
        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json();
          if (imagesData.success && imagesData.data) {
            setCarouselImages(imagesData.data);
          }
        }

        // Fetch content
        const [titleRes, subtitleRes, contentRes] = await Promise.all([
          fetch('/api/content?key=about_section_title'),
          fetch('/api/content?key=about_section_subtitle'),
          fetch('/api/content?key=about_section_content')
        ]);

        if (titleRes.ok) {
          const data = await titleRes.json();
          if (data.success && data.data?.data?.value) {
            setTitle(data.data.data.value);
          }
        }

        if (subtitleRes.ok) {
          const data = await subtitleRes.json();
          if (data.success && data.data?.data?.value) {
            setSubtitle(data.data.data.value);
          }
        }

        if (contentRes.ok) {
          const data = await contentRes.json();
          if (data.success && data.data?.data?.value) {
            setContent(data.data.data.value);
          }
        }
      } catch (error) {
        console.error('Failed to fetch about section data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <section className="w-full py-16 md:py-24 px-4 md:px-8 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Carousel */}
          <div className="relative">
            {isLoading || carouselImages.length === 0 ? (
              <div className="aspect-[4/3] bg-slate-600 animate-pulse rounded-lg" />
            ) : (
              <Carousel
                className="w-full"
                opts={{
                  align: 'start',
                  loop: true,
                }}
              >
                <div ref={emblaRef} className="overflow-hidden">
                  <CarouselContent>
                    {carouselImages.map((image) => (
                      <CarouselItem key={image._id}>
                        <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-2xl">
                          <Image
                            src={image.url}
                            alt={image.altText || 'Company image'}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            priority
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </div>
              </Carousel>
            )}
          </div>

          {/* Right: Biography/Content */}
          <div className="space-y-6 text-white">
            {/* Title with accent */}
            <div className="space-y-2">
              <div className="inline-block">
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-500 to-red-600 text-transparent bg-clip-text">
                  {title}
                </h2>
                <div className="h-1 w-24 bg-gradient-to-r from-red-500 to-red-600 mt-2 rounded-full" />
              </div>
            </div>

            {/* Subtitle */}
            <h3 className="text-2xl md:text-3xl font-semibold text-amber-100">
              {subtitle}
            </h3>

            {/* Content */}
            <div className="space-y-4 text-lg text-slate-200 leading-relaxed">
              {content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-base md:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Decorative element */}
            <div className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-500 to-transparent" />
                <div className="text-amber-400 text-sm font-medium tracking-wider">
                  SINCE 2025
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-500 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
