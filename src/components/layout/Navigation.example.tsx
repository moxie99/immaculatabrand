/**
 * Navigation Component Usage Examples
 * 
 * The Navigation component provides category filtering for products.
 * It supports two modes:
 * 1. Link mode (default): Navigates between category pages
 * 2. Button mode: Client-side filtering on the same page
 * 
 * It can be used in controlled or uncontrolled mode:
 * - Uncontrolled: Automatically detects active category from URL pathname
 * - Controlled: Uses activeCategory prop and onCategoryChange callback
 */

'use client';

import { useState } from 'react';
import { Navigation } from './Navigation';

// Example 1: Basic usage with links (uncontrolled mode)
// Automatically detects active category from pathname
export function BasicNavigationExample() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <Navigation />
      <div className="mt-8">
        {/* Product grid would go here */}
        <p>Product listing...</p>
      </div>
    </div>
  );
}

// Example 2: Button mode for client-side filtering
// Use this when you want to filter products on the same page without navigation
export function ButtonModeExample() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'confectionary' | 'fish' | 'foodstuffs'>('all');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <Navigation
        asButtons
        activeCategory={selectedCategory}
        onCategoryChange={(category) => setSelectedCategory(category)}
      />
      <div className="mt-8">
        <p>Showing products for: {selectedCategory}</p>
        {/* Filter and display products based on selectedCategory */}
      </div>
    </div>
  );
}

// Example 3: Custom base path
// Use when your products are at a different path
export function CustomBasePathExample() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Shop</h1>
      <Navigation basePath="/shop" />
      <div className="mt-8">
        {/* Product grid would go here */}
        <p>Product listing...</p>
      </div>
    </div>
  );
}

// Example 4: Controlled mode with links
// Use when you need to track category changes but still want navigation
export function ControlledLinkModeExample() {
  const handleCategoryChange = (category: 'all' | 'confectionary' | 'fish' | 'foodstuffs') => {
    console.log('Category changed to:', category);
    // Track analytics, update state, etc.
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <Navigation onCategoryChange={handleCategoryChange} />
      <div className="mt-8">
        {/* Product grid would go here */}
        <p>Product listing...</p>
      </div>
    </div>
  );
}

// Example 5: In a products listing page
export function ProductsPageExample() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Our Products</h1>
          <p className="text-muted-foreground mb-6">
            Browse our selection of authentic African delicacies
          </p>
          <Navigation />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ProductCard components would go here */}
          <div className="border rounded-lg p-4">Product 1</div>
          <div className="border rounded-lg p-4">Product 2</div>
          <div className="border rounded-lg p-4">Product 3</div>
        </div>
      </div>
    </div>
  );
}

// Example 6: With sidebar layout
export function SidebarLayoutExample() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar with navigation */}
        <aside className="md:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Categories</h2>
          <Navigation />
        </aside>

        {/* Main content */}
        <main className="md:col-span-3">
          <h1 className="text-2xl font-bold mb-6">Products</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Product cards */}
            <div className="border rounded-lg p-4">Product 1</div>
            <div className="border rounded-lg p-4">Product 2</div>
            <div className="border rounded-lg p-4">Product 3</div>
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * Features:
 * 
 * 1. Two Rendering Modes:
 *    - Link mode (default): Uses Next.js Link for navigation between pages
 *    - Button mode (asButtons=true): Renders buttons for client-side filtering
 * 
 * 2. Controlled vs Uncontrolled:
 *    - Uncontrolled: Automatically detects active category from pathname
 *    - Controlled: Use activeCategory prop to control which category is active
 * 
 * 3. Category Options:
 *    - All: Shows all products
 *    - Confectionary: Cakes, oat flour, plantain flour, etc.
 *    - Fish Products: Crayfish, smoked fish, catfish
 *    - African Foodstuffs: Various African food items
 * 
 * 4. Active State Highlighting:
 *    - Active category uses 'default' button variant (filled)
 *    - Inactive categories use 'outline' button variant
 *    - Smooth transition animations
 * 
 * 5. Responsive Design:
 *    - Uses flex-wrap for responsive layout
 *    - Buttons wrap to multiple lines on small screens
 *    - Consistent spacing with gap-2
 * 
 * 6. Accessibility:
 *    - Proper navigation landmark with aria-label
 *    - Keyboard navigation support via Shadcn Button
 *    - Semantic HTML structure
 * 
 * 7. Customization:
 *    - basePath: Change the base URL for category links
 *    - onCategoryChange: Callback for tracking category changes
 *    - activeCategory: Control which category is highlighted
 *    - asButtons: Switch between link and button rendering
 */
