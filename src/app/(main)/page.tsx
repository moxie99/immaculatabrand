import React from 'react';
import { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import ImageCarousel from '@/components/home/ImageCarousel';
import FeaturedProducts from '@/components/home/FeaturedProducts';

/**
 * Landing Page
 * 
 * Main homepage at root route (/) featuring:
 * - HeroSection: Hero image and text from Content collection
 * - ImageCarousel: Carousel images from Media collection
 * - FeaturedProducts: Featured products display
 * 
 * Server-side rendered for optimal SEO and performance.
 * 
 * Requirements: Design - Landing Page (Task 23.1)
 */

export const metadata: Metadata = {
  title: 'Authentic African Delicacies | Confectionary Platform',
  description: 'Discover authentic African confectioneries and delicacies delivered to your doorstep. Browse our curated selection of traditional treats and sweets.',
  keywords: ['African confectionery', 'African sweets', 'traditional delicacies', 'African treats', 'authentic African food'],
  openGraph: {
    title: 'Authentic African Delicacies | Confectionary Platform',
    description: 'Discover authentic African confectioneries and delicacies delivered to your doorstep.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Authentic African Delicacies | Confectionary Platform',
    description: 'Discover authentic African confectioneries and delicacies delivered to your doorstep.',
  },
};

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="w-full">
        <HeroSection />
      </section>

      {/* Image Carousel */}
      <section className="w-full py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <ImageCarousel />
        </div>
      </section>

      {/* Featured Products */}
      <section className="w-full">
        <FeaturedProducts />
      </section>
    </main>
  );
}
