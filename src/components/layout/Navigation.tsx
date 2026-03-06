'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Category } from '@/types/product.types';

interface NavigationProps {
  /**
   * Active category (controlled mode)
   * If provided, this will be used instead of pathname detection
   */
  activeCategory?: Category | 'all';
  /**
   * Callback when a category is selected (controlled mode)
   */
  onCategoryChange?: (category: Category | 'all') => void;
  /**
   * Base path for category links (default: '/products')
   * Used in uncontrolled mode with Link components
   */
  basePath?: string;
  /**
   * Render as buttons instead of links (for filtering on same page)
   */
  asButtons?: boolean;
}

const categories: Array<{ value: Category | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'confectionary', label: 'Confectionary' },
  { value: 'fish', label: 'Fish Products' },
  { value: 'foodstuffs', label: 'African Foodstuffs' },
];

export function Navigation({
  activeCategory,
  onCategoryChange,
  basePath = '/products',
  asButtons = false,
}: NavigationProps) {
  const pathname = usePathname();

  // Determine active category from pathname if not controlled
  const getActiveCategory = (): Category | 'all' => {
    if (activeCategory !== undefined) {
      return activeCategory;
    }

    // Extract category from pathname
    if (pathname === basePath || pathname === '/') {
      return 'all';
    }

    const pathSegments = pathname.split('/');
    const categoryFromPath = pathSegments[pathSegments.length - 1];

    if (
      categoryFromPath === 'confectionary' ||
      categoryFromPath === 'fish' ||
      categoryFromPath === 'foodstuffs'
    ) {
      return categoryFromPath;
    }

    return 'all';
  };

  const active = getActiveCategory();

  const handleCategoryClick = (category: Category | 'all') => {
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  const getCategoryHref = (category: Category | 'all'): string => {
    if (category === 'all') {
      return basePath;
    }
    return `${basePath}/${category}`;
  };

  const isActive = (category: Category | 'all'): boolean => {
    return active === category;
  };

  // Render as buttons (for client-side filtering)
  if (asButtons) {
    return (
      <nav className="flex flex-wrap gap-2" aria-label="Product categories">
        {categories.map((category) => (
          <Button
            key={category.value}
            variant={isActive(category.value) ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategoryClick(category.value)}
            className="transition-colors"
          >
            {category.label}
          </Button>
        ))}
      </nav>
    );
  }

  // Render as links (for navigation between pages)
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Product categories">
      {categories.map((category) => (
        <Link
          key={category.value}
          href={getCategoryHref(category.value)}
          onClick={() => handleCategoryClick(category.value)}
        >
          <Button
            variant={isActive(category.value) ? 'default' : 'outline'}
            size="sm"
            className="transition-colors"
          >
            {category.label}
          </Button>
        </Link>
      ))}
    </nav>
  );
}
