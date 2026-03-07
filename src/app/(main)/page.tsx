import React from 'react';
import { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import AboutUsSection from '@/components/home/AboutUsSection';
import CakesAndPastries from '@/components/home/CakesAndPastries';
import FoodstuffsSection from '@/components/home/FoodstuffsSection';
import FishSection from '@/components/home/FishSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import { BRAND_NAME, SITE_DESCRIPTION, SITE_KEYWORDS } from '@/lib/constants/site';

/**
 * Landing Page
 * 
 * Main homepage at root route (/) featuring:
 * - HeroSection: Hero image and text from Content collection
 * - AboutUsSection: Company history with carousel and biography
 * - CakesAndPastries: Confectionary products showcase
 * - FoodstuffsSection: Foodstuffs products showcase
 * - FishSection: Fish products showcase
 * - FeaturedProducts: Featured products display
 * 
 * Server-side rendered for optimal SEO and performance.
 * 
 * Requirements: Design - Landing Page (Task 23.1)
 */

export const metadata: Metadata = {
  title: `${BRAND_NAME} | Premium Confectioneries & Delicacies`,
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  openGraph: {
    title: `${BRAND_NAME} | Premium Confectioneries & Delicacies`,
    description: SITE_DESCRIPTION,
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND_NAME} | Premium Confectioneries & Delicacies`,
    description: SITE_DESCRIPTION,
  },
};

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section - White background */}
      <section className="w-full bg-white">
        <HeroSection />
      </section>

      {/* About Us Section - Dark background with carousel and biography */}
      <AboutUsSection />

       {/* Featured Products - Warm orange tint background */}
      <section className="w-full bg-gradient-to-b from-orange-50/50 to-white">
        <FeaturedProducts />
      </section>

      {/* Cakes and Pastries Section - Light warm beige */}
      <CakesAndPastries />

      {/* Foodstuffs Section - Light green */}
      <FoodstuffsSection />

      {/* Fish Section - Light blue */}
      <FishSection />

     
    </main>
  );
}
