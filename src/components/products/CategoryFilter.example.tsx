'use client';

import { useState } from 'react';
import { CategoryFilter } from './CategoryFilter';
import { Category } from '@/types/product.types';

/**
 * Example usage of CategoryFilter component
 * 
 * This example demonstrates:
 * 1. Using CategoryFilter in controlled mode
 * 2. Handling category changes
 * 3. Displaying the selected category
 */
export function CategoryFilterExample() {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');

  const handleCategoryChange = (category: Category | 'all') => {
    setSelectedCategory(category);
    console.log('Category changed to:', category);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Category Filter Example</h2>
        <p className="text-muted-foreground mb-4">
          Select a category to filter products. The active category is highlighted.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Filter by Category:</h3>
          <CategoryFilter
            activeCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm">
            <strong>Selected Category:</strong>{' '}
            <span className="capitalize">{selectedCategory}</span>
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Usage Example:</h3>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
          {`import { CategoryFilter } from '@/components/products/CategoryFilter';
import { useState } from 'react';

function ProductsPage() {
  const [category, setCategory] = useState('all');

  return (
    <div>
      <CategoryFilter
        activeCategory={category}
        onCategoryChange={setCategory}
      />
      {/* Display filtered products based on category */}
    </div>
  );
}`}
        </pre>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Features:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>Displays category buttons: All, Confectionary, Fish, Foodstuffs</li>
          <li>Highlights the active/selected category</li>
          <li>Accepts onCategoryChange callback prop</li>
          <li>Accepts activeCategory prop for controlled mode</li>
          <li>Uses Shadcn Button component with variants (default for active, outline for inactive)</li>
          <li>Responsive design that wraps on mobile</li>
          <li>Client component for interactivity</li>
        </ul>
      </div>
    </div>
  );
}
