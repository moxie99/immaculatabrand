/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProductCard from './ProductCard';
import type { Product } from '@/types/product.types';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('ProductCard', () => {
  const mockProduct: Product = {
    _id: '123',
    name: 'Nigerian Chin Chin',
    slug: 'nigerian-chin-chin',
    category: 'confectionary',
    description: 'Delicious crunchy snack',
    price: 1500, // £15.00
    currency: 'GBP',
    images: ['https://res.cloudinary.com/test/image/upload/product1.jpg'],
    preparationSteps: [],
    isFeatured: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('renders product name', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Nigerian Chin Chin')).toBeTruthy();
  });

  it('renders product category', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Confectionary')).toBeTruthy();
  });

  it('renders formatted price', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('£15.00')).toBeTruthy();
  });

  it('renders product image with correct src', () => {
    render(<ProductCard product={mockProduct} />);
    const image = screen.getByAltText('Nigerian Chin Chin');
    expect(image).toBeTruthy();
    expect(image.getAttribute('src')).toBe(mockProduct.images[0]);
  });

  it('renders View Details button with correct link', () => {
    render(<ProductCard product={mockProduct} />);
    const link = screen.getByRole('link', { name: /view details/i });
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('/products/123');
  });

  it('uses placeholder image when no images provided', () => {
    const productWithoutImages: Product = {
      ...mockProduct,
      images: [],
    };
    render(<ProductCard product={productWithoutImages} />);
    const image = screen.getByAltText('Nigerian Chin Chin');
    expect(image.getAttribute('src')).toBe('/images/placeholders/product.jpg');
  });

  it('formats price correctly for different currencies', () => {
    const productUSD: Product = {
      ...mockProduct,
      currency: 'USD',
      price: 2000, // $20.00
    };
    render(<ProductCard product={productUSD} />);
    // USD format includes "US$" prefix
    expect(screen.getByText(/20\.00/)).toBeTruthy();
  });

  it('capitalizes category name', () => {
    const fishProduct: Product = {
      ...mockProduct,
      category: 'fish',
    };
    render(<ProductCard product={fishProduct} />);
    expect(screen.getByText('Fish')).toBeTruthy();
  });

  it('applies hover effect classes', () => {
    const { container } = render(<ProductCard product={mockProduct} />);
    const card = container.querySelector('.group');
    expect(card).toBeTruthy();
    expect(card?.className).toContain('hover:shadow-xl');
    expect(card?.className).toContain('hover:scale-[1.02]');
  });
});
