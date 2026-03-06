/**
 * HeroSection Component Example
 * 
 * This example demonstrates how to use the HeroSection component
 * on the homepage to display hero content and images.
 */

import HeroSection from './HeroSection';

/**
 * Basic Usage
 * 
 * Simply render the HeroSection component on your homepage.
 * It will automatically fetch and display:
 * - Hero image from /api/media/hero endpoint
 * - Hero content from /api/content?key=homepage_hero endpoint
 */
export function BasicHeroExample() {
  return (
    <div className="container mx-auto px-4 py-8">
      <HeroSection />
    </div>
  );
}

/**
 * Homepage Layout Example
 * 
 * Typical usage in a homepage layout with other sections
 */
export function HomepageLayoutExample() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Full width */}
      <HeroSection />

      {/* Other homepage sections */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
        {/* Featured products grid would go here */}
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Image Carousel</h2>
        {/* Image carousel would go here */}
      </section>
    </div>
  );
}

/**
 * Expected API Response Format
 * 
 * Content API (/api/content?key=homepage_hero):
 * {
 *   "success": true,
 *   "data": {
 *     "key": "homepage_hero",
 *     "title": "Homepage Hero Section",
 *     "data": {
 *       "heading": "Authentic African Delicacies",
 *       "subheading": "Delivered to Your Doorstep",
 *       "ctaText": "Browse Products",
 *       "ctaLink": "/products"
 *     }
 *   }
 * }
 * 
 * Media API (/api/media/hero?limit=1):
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "cloudinaryId": "confectionary/hero/hero-image-1",
 *       "url": "http://res.cloudinary.com/...",
 *       "secureUrl": "https://res.cloudinary.com/...",
 *       "type": "hero",
 *       "altText": "African food products display",
 *       "width": 1200,
 *       "height": 800,
 *       "format": "jpg"
 *     }
 *   ]
 * }
 */

/**
 * Responsive Behavior
 * 
 * The HeroSection component is fully responsive:
 * - Mobile (< 768px): 500px height, smaller text
 * - Desktop (>= 768px): 600px height, larger text
 * - Text is centered and overlaid on the hero image
 * - Dark overlay ensures text readability
 */

/**
 * Loading and Error States
 * 
 * The component handles three states:
 * 1. Loading: Shows animated skeleton
 * 2. Error: Shows error message if fetch fails
 * 3. Success: Shows hero content and image
 * 
 * If no content is found, it falls back to default content.
 */
