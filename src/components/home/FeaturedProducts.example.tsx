/**
 * FeaturedProducts Component Examples
 * 
 * This file demonstrates various usage scenarios for the FeaturedProducts component.
 * The component is designed to be used on the homepage to display featured products.
 */

import React from 'react';
import FeaturedProducts from './FeaturedProducts';

/**
 * Example 1: Basic Usage
 * 
 * The FeaturedProducts component can be used directly without any props.
 * It automatically fetches featured products and handles all states internally.
 */
export function BasicUsage() {
  return (
    <div className="min-h-screen bg-background">
      <FeaturedProducts />
    </div>
  );
}

/**
 * Example 2: Within a Homepage Layout
 * 
 * Typical usage within a homepage layout with other sections.
 */
export function HomepageLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="h-[600px] bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to Our Store</h1>
          <p className="text-xl text-muted-foreground">Authentic African Delicacies</p>
        </div>
      </section>

      {/* Featured Products Section */}
      <FeaturedProducts />

      {/* Other sections can follow */}
    </div>
  );
}

/**
 * Example 3: With Custom Container
 * 
 * The component can be wrapped in a custom container for additional styling.
 */
export function WithCustomContainer() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto">
        <FeaturedProducts />
      </div>
    </div>
  );
}

/**
 * Example 4: Multiple Sections
 * 
 * Using FeaturedProducts as part of a multi-section homepage.
 */
export function MultiSectionHomepage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="h-[500px] bg-primary/10 flex items-center justify-center">
        <h1 className="text-4xl font-bold">Hero Section</h1>
      </section>

      {/* Image Carousel */}
      <section className="py-12 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Our Gallery</h2>
          <div className="h-[400px] bg-card rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Image Carousel Component</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Call to Action */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-xl mb-8">Browse our full catalog of authentic African products</p>
          <button className="bg-background text-foreground px-8 py-3 rounded-md font-semibold hover:bg-background/90">
            View All Products
          </button>
        </div>
      </section>
    </div>
  );
}

/**
 * Notes on Component Behavior:
 * 
 * 1. Loading State:
 *    - Displays animated skeleton cards while fetching data
 *    - Shows 8 skeleton cards in the grid
 * 
 * 2. Error State:
 *    - Shows error message if fetch fails
 *    - Provides a "Retry" button to reload the page
 * 
 * 3. Empty State:
 *    - Displays message when no featured products are available
 *    - Provides link to browse all products
 * 
 * 4. Success State:
 *    - Displays up to 12 featured products in a responsive grid
 *    - Grid layout: 1 column (mobile), 2 columns (tablet), 3-4 columns (desktop)
 *    - Each product shows image, name, category, price, and "View Details" button
 *    - Includes "View All Products" button at the bottom
 * 
 * 5. Responsive Design:
 *    - Mobile (< 640px): 1 column
 *    - Tablet (640px - 1024px): 2 columns
 *    - Desktop (1024px - 1280px): 3 columns
 *    - Large Desktop (> 1280px): 4 columns
 * 
 * 6. Data Fetching:
 *    - Uses useProducts hook with filters: { featured: true }
 *    - Limits results to 12 products
 *    - Disables revalidateOnFocus for better performance
 *    - Automatically caches data with SWR
 */

export default {
  BasicUsage,
  HomepageLayout,
  WithCustomContainer,
  MultiSectionHomepage,
};
