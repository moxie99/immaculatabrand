'use client';

import { Button } from '@/components/ui/button';
import { Category } from '@/types/product.types';

interface CategoryFilterProps {
  /**
   * Currently active/selected category
   */
  activeCategory: Category | 'all';
  /**
   * Callback when a category is selected
   */
  onCategoryChange: (category: Category | 'all') => void;
}

const categories: Array<{ value: Category | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'confectionary', label: 'Confectionary' },
  { value: 'fish', label: 'Fish Products' },
  { value: 'foodstuffs', label: 'African Foodstuffs' },
];

/**
 * CategoryFilter component for filtering products by category
 * 
 * Displays category buttons (All, Confectionary, Fish, Foodstuffs) with active state highlighting.
 * Uses Shadcn Button component with variants (default for active, outline for inactive).
 * Responsive design that wraps on mobile devices.
 */
export function CategoryFilter({
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const isActive = (category: Category | 'all'): boolean => {
    return activeCategory === category;
  };

  return (
    <nav className="flex flex-wrap gap-2" aria-label="Filter products by category">
      {categories.map((category) => (
        <Button
          key={category.value}
          variant={isActive(category.value) ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange(category.value)}
          className="transition-colors"
          aria-pressed={isActive(category.value)}
        >
          {category.label}
        </Button>
      ))}
    </nav>
  );
}
