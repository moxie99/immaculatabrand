'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * About Page
 * 
 * Route: /about
 * 
 * Features:
 * - Hero section with large image and "ABOUT US" title
 * - Company history section with carousel and biography
 * - Social media section (placeholder for future integration)
 * - Newsletter subscription
 * - Dynamic content from Content API
 * 
 * Design inspired by Chinatown Bakery about page
 */

export default function AboutPage() {
  const [title, setTitle] = useState('ABOUT US');
  const [subtitle, setSubtitle] = useState('Bringing the Taste of Africa to Every Day');
  const [content, setContent] = useState('');
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [carouselImages, setCarouselImages] = useState<Array<{ url: string; alt: string }>>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Fetch content
        const [titleRes, subtitleRes, contentRes, heroRes, carouselRes] = await Promise.all([
          fetch('/api/content?key=about_section_title'),
          fetch('/api/content?key=about_section_subtitle'),
          fetch('/api/content?key=about_section_content'),
          fetch('/api/media/hero?limit=1'),
          fetch('/api/media/carousel?limit=10')
        ]);
        
        // Process title
        if (titleRes.ok) {
          const titleData = await titleRes.json();
          if (titleData.success && titleData.data?.data?.value) {
            setTitle(titleData.data.data.value);
          }
        }
        
        // Process subtitle
        if (subtitleRes.ok) {
          const subtitleData = await subtitleRes.json();
          if (subtitleData.success && subtitleData.data?.data?.value) {
            setSubtitle(subtitleData.data.data.value);
          }
        }
        
        // Process content
        if (contentRes.ok) {
          const contentData = await contentRes.json();
          if (contentData.success && contentData.data?.data?.value) {
            setContent(contentData.data.data.value);
          }
        }
        
        // Process hero image
        if (heroRes.ok) {
          const heroData = await heroRes.json();
          if (heroData.success && heroData.data && heroData.data.length > 0) {
            setHeroImage(heroData.data[0].url);
          }
        }
        
        // Process carousel images
        if (carouselRes.ok) {
          const carouselData = await carouselRes.json();
          if (carouselData.success && carouselData.data) {
            setCarouselImages(carouselData.data.map((img: any) => ({
              url: img.url,
              alt: img.alt || 'Company image'
            })));
          }
        }
      } catch (error) {
        console.error('Failed to fetch about page data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Auto-scroll carousel
  useEffect(() => {
    if (carouselImages.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  if (isLoading) {
    return (
      <main className="min-h-screen">
        <div className="w-full h-96 bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <div className="h-8 bg-slate-200 animate-pulse rounded w-1/3 mb-4" />
          <div className="h-4 bg-slate-200 animate-pulse rounded w-2/3" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[400px] md:h-[500px] bg-gradient-to-br from-slate-800 to-slate-700">
        {heroImage && (
          <Image
            src={heroImage}
            alt="About Us Hero"
            fill
            className="object-cover opacity-40"
            priority
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
              {title}
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto" />
          </div>
        </div>
      </section>

      {/* Company History Section */}
      <section className="w-full py-16 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Carousel */}
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-2xl">
              {carouselImages.length > 0 ? (
                <>
                  <Image
                    src={carouselImages[currentImageIndex].url}
                    alt={carouselImages[currentImageIndex].alt}
                    fill
                    className="object-cover transition-opacity duration-500"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  {/* Carousel Indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {carouselImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex
                            ? 'bg-white w-8'
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                  <p className="text-slate-500">No images available</p>
                </div>
              )}
            </div>

            {/* Biography Content */}
            <div className="space-y-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                  <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    {subtitle}
                  </span>
                </h2>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px bg-gradient-to-r from-amber-400 to-orange-400 flex-1" />
                  <span className="text-sm font-semibold text-amber-600 tracking-wider">
                    SINCE 2012
                  </span>
                  <div className="h-px bg-gradient-to-r from-orange-400 to-amber-400 flex-1" />
                </div>
              </div>

              <div className="prose prose-lg max-w-none">
                {content ? (
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {content}
                  </p>
                ) : (
                  <p className="text-slate-700 leading-relaxed">
                    Founded in 2011, our company has been serving delicious, high-quality products that bring 
                    comfort, convenience, and authenticity to everyday life. Rooted in tradition yet forward-thinking 
                    in approach, we blend classic techniques with modern innovation. Our team regularly explores new 
                    flavours and seasonal needs—allowing us to introduce fresh products which become new favourites, 
                    from our much-loved signature items and pineapple buns to new recipes and innovations. We're always 
                    evolving with the times.
                  </p>
                )}
              </div>

              <div className="pt-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg">
                  <Link href="/products">
                    Explore Our Products
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="w-full py-16 px-4 md:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              LET'S GET <span className="text-red-600">SOCIAL</span>
            </h2>
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
          </div>

          {/* Social Media Grid Placeholder */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer"
              >
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-slate-400"
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
              </div>
            ))}
          </div>

          <div className="text-center space-y-4">
            <Button
              variant="outline"
              size="lg"
              className="border-slate-300 hover:bg-slate-50"
            >
              Load More
            </Button>
            <div>
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
              >
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  Follow on Instagram
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="w-full py-16 px-4 md:px-8 bg-gradient-to-br from-slate-800 to-slate-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Subscribe to our newsletter
          </h2>
          <p className="text-slate-300 mb-8">
            Stay updated with our latest products and special offers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Email address"
              className="flex-1 px-4 py-3 rounded-md border border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <Button
              size="lg"
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
            >
              OK
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
