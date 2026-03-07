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
      {/* Hero Section - Light */}
      <section className="w-full bg-white">
        <HeroSection />
      </section>

      {/* About Us Section - Dark */}
      <AboutUsSection />

      {/* Featured Products - Light */}
      <section className="w-full bg-gradient-to-b from-amber-50/50 to-orange-50/30">
        <FeaturedProducts />
      </section>

      {/* Cakes and Pastries Section - Dark */}
      <CakesAndPastries />

      {/* Foodstuffs Section - Light */}
      <FoodstuffsSection />

      {/* Fish Section - Dark */}
      <FishSection />
    </main>
  );
}
