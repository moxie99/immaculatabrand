/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProductGrid from './ProductGrid';
import type { Product } from '@/types/product.types';

// Mock ProductCard component
vi.mock('./ProductCard', () => ({
  default: ({ product }: { product: Product }) => (
    <div data-testid={`product-card-${product._id}`}>
      {product.name}
    </div>
  ),
}));

// Mock Shadcn Card components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

describe('ProductGrid', () => {
  const mockProducts: Product[] = [
    {
      _id: '1',
      name: 'Nigerian Chin Chin',
      slug: 'nigerian-chin-chin',
      category: 'confectionary',
      description: 'Crunchy fried snack',
      price: 599,
      currency: 'GBP',
      images: ['https://res.cloudinary.com/test/image1.jpg'],
      preparationSteps: [],
      isFeatured: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: '2',
      name: 'Smoked Catfish',
      slug: 'smoked-catfish',
      category: 'fish',
      description: 'Premium smoked catfish',
      price: 1299,
      currency: 'GBP',
      images: ['https://res.cloudinary.com/test/image2.jpg'],
      preparationSteps: [],
      isFeatured: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: '3',
      name: 'Plantain Flour',
      slug: 'plantain-flour',
      category: 'foodstuffs',
      description: 'Organic plantain flour',
      price: 799,
      currency: 'GBP',
      images: ['https://res.cloudinary.com/test/image3.jpg'],
      preparationSteps: [],
      isFeatured: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  describe('Product Display', () => {
    it('should render all products in a grid', () => {
      render(<ProductGrid products={mockProducts} />);

      expect(screen.getByTestId('product-card-1')).toBeTruthy();
      expect(screen.getByTestId('product-card-2')).toBeTruthy();
      expect(screen.getByTestId('product-card-3')).toBeTruthy();
    });

    it('should render products with correct names', () => {
      render(<ProductGrid products={mockProducts} />);

      expect(screen.getByText('Nigerian Chin Chin')).toBeTruthy();
      expect(screen.getByText('Smoked Catfish')).toBeTruthy();
      expect(screen.getByText('Plantain Flour')).toBeTruthy();
    });

    it('should render a single product', () => {
      const singleProduct = [mockProducts[0]];
      render(<ProductGrid products={singleProduct} />);

      expect(screen.getByTestId('product-card-1')).toBeTruthy();
      expect(screen.queryByTestId('product-card-2')).toBeNull();
    });
  });

  describe('Loading State', () => {
    it('should display loading skeleton when isLoading is true', () => {
      render(<ProductGrid products={[]} isLoading={true} />);

      // Check for skeleton elements (animate-pulse class)
      const skeletons = screen.getAllByRole('generic').filter(
        (el) => el.className.includes('animate-pulse')
      );
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should display 8 skeleton cards when loading', () => {
      const { container } = render(<ProductGrid products={[]} isLoading={true} />);

      // Count skeleton cards by looking for the image skeleton divs
      const skeletonCards = container.querySelectorAll('.h-48.bg-muted.animate-pulse');
      expect(skeletonCards.length).toBe(8);
    });

    it('should not display products when loading', () => {
      render(<ProductGrid products={mockProducts} isLoading={true} />);

      expect(screen.queryByTestId('product-card-1')).toBeNull();
      expect(screen.queryByTestId('product-card-2')).toBeNull();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when products array is empty', () => {
      render(<ProductGrid products={[]} />);

      expect(screen.getByText('No products found')).toBeTruthy();
      expect(
        screen.getByText(/There are currently no products available/i)
      ).toBeTruthy();
    });

    it('should display empty state icon', () => {
      const { container } = render(<ProductGrid products={[]} />);

      const icon = container.querySelector('svg');
      expect(icon).toBeTruthy();
    });

    it('should not display products when array is empty', () => {
      render(<ProductGrid products={[]} />);

      expect(screen.queryByTestId('product-card-1')).toBeNull();
    });

    it('should handle undefined products array', () => {
      render(<ProductGrid products={undefined as any} />);

      expect(screen.getByText('No products found')).toBeTruthy();
    });
  });

  describe('Grid Layout', () => {
    it('should apply responsive grid classes', () => {
      const { container } = render(<ProductGrid products={mockProducts} />);

      const grid = container.querySelector('.grid');
      expect(grid).toBeTruthy();
      expect(grid?.className).toContain('grid-cols-1');
      expect(grid?.className).toContain('sm:grid-cols-2');
      expect(grid?.className).toContain('lg:grid-cols-3');
      expect(grid?.className).toContain('xl:grid-cols-4');
    });

    it('should apply gap between grid items', () => {
      const { container } = render(<ProductGrid products={mockProducts} />);

      const grid = container.querySelector('.grid');
      expect(grid).toBeTruthy();
      expect(grid?.className).toContain('gap-6');
    });
  });

  describe('Edge Cases', () => {
    it('should handle large number of products', () => {
      const manyProducts = Array.from({ length: 50 }, (_, i) => ({
        ...mockProducts[0],
        _id: `product-${i}`,
        name: `Product ${i}`,
      }));

      render(<ProductGrid products={manyProducts} />);

      expect(screen.getByTestId('product-card-product-0')).toBeTruthy();
      expect(screen.getByTestId('product-card-product-49')).toBeTruthy();
    });

    it('should not show loading state when isLoading is false', () => {
      const { container } = render(<ProductGrid products={mockProducts} isLoading={false} />);

      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBe(0);
    });

    it('should default isLoading to false when not provided', () => {
      render(<ProductGrid products={mockProducts} />);

      expect(screen.getByTestId('product-card-1')).toBeTruthy();
      expect(screen.queryByText('No products found')).toBeNull();
    });
  });
});
