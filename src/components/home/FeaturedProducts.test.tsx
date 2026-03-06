/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FeaturedProducts from './FeaturedProducts';
import * as useProductsHook from '@/lib/hooks/useProducts';

// Mock the useProducts hook
vi.mock('@/lib/hooks/useProducts');

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('FeaturedProducts', () => {
  const mockProducts = [
    {
      _id: '1',
      name: 'Nigerian Chin Chin',
      slug: 'nigerian-chin-chin',
      category: 'confectionary',
      description: 'Delicious crunchy snack',
      price: 1500,
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
      price: 2500,
      currency: 'GBP',
      images: ['https://res.cloudinary.com/test/image2.jpg'],
      preparationSteps: [],
      isFeatured: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    vi.mocked(useProductsHook.useProducts).mockReturnValue({
      products: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
      isLoading: true,
      isError: false,
      error: undefined,
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      goToPage: vi.fn(),
      setCategory: vi.fn(),
      setFeatured: vi.fn(),
      setSearch: vi.fn(),
      mutate: vi.fn(),
    });

    render(<FeaturedProducts />);

    expect(screen.getByText('Featured Products')).toBeTruthy();
    // Loading skeleton should be present
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render featured products when loaded', async () => {
    vi.mocked(useProductsHook.useProducts).mockReturnValue({
      products: mockProducts,
      total: 2,
      page: 1,
      limit: 12,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
      isLoading: false,
      isError: false,
      error: undefined,
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      goToPage: vi.fn(),
      setCategory: vi.fn(),
      setFeatured: vi.fn(),
      setSearch: vi.fn(),
      mutate: vi.fn(),
    });

    render(<FeaturedProducts />);

    await waitFor(() => {
      expect(screen.getByText('Nigerian Chin Chin')).toBeTruthy();
      expect(screen.getByText('Smoked Catfish')).toBeTruthy();
    });

    // Check that prices are formatted correctly
    expect(screen.getByText('£15.00')).toBeTruthy();
    expect(screen.getByText('£25.00')).toBeTruthy();

    // Check that categories are displayed (capitalized by ProductCard)
    expect(screen.getByText('Confectionary')).toBeTruthy();
    expect(screen.getByText('Fish')).toBeTruthy();

    // Check that "View All Products" button is present
    expect(screen.getByText('View All Products')).toBeTruthy();
  });

  it('should render error state when fetch fails', () => {
    const mockError = new Error('Failed to fetch');
    vi.mocked(useProductsHook.useProducts).mockReturnValue({
      products: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
      isLoading: false,
      isError: true,
      error: mockError,
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      goToPage: vi.fn(),
      setCategory: vi.fn(),
      setFeatured: vi.fn(),
      setSearch: vi.fn(),
      mutate: vi.fn(),
    });

    render(<FeaturedProducts />);

    expect(screen.getByText(/Failed to load featured products/i)).toBeTruthy();
    expect(screen.getByText('Retry')).toBeTruthy();
  });

  it('should render empty state when no products are available', () => {
    vi.mocked(useProductsHook.useProducts).mockReturnValue({
      products: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
      isLoading: false,
      isError: false,
      error: undefined,
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      goToPage: vi.fn(),
      setCategory: vi.fn(),
      setFeatured: vi.fn(),
      setSearch: vi.fn(),
      mutate: vi.fn(),
    });

    render(<FeaturedProducts />);

    expect(screen.getByText(/No featured products available/i)).toBeTruthy();
    expect(screen.getByText('Browse All Products')).toBeTruthy();
  });

  it('should call useProducts with correct parameters', () => {
    const mockUseProducts = vi.mocked(useProductsHook.useProducts);
    mockUseProducts.mockReturnValue({
      products: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
      isLoading: true,
      isError: false,
      error: undefined,
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      goToPage: vi.fn(),
      setCategory: vi.fn(),
      setFeatured: vi.fn(),
      setSearch: vi.fn(),
      mutate: vi.fn(),
    });

    render(<FeaturedProducts />);

    expect(mockUseProducts).toHaveBeenCalledWith({
      filters: { featured: true },
      pagination: { limit: 12 },
      revalidateOnFocus: false,
    });
  });

  it('should render products in a responsive grid', () => {
    vi.mocked(useProductsHook.useProducts).mockReturnValue({
      products: mockProducts,
      total: 2,
      page: 1,
      limit: 12,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
      isLoading: false,
      isError: false,
      error: undefined,
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      goToPage: vi.fn(),
      setCategory: vi.fn(),
      setFeatured: vi.fn(),
      setSearch: vi.fn(),
      mutate: vi.fn(),
    });

    const { container } = render(<FeaturedProducts />);

    // Check for grid layout classes
    const grid = container.querySelector('.grid');
    expect(grid).toBeTruthy();
    expect(grid?.className).toContain('grid-cols-1');
    expect(grid?.className).toContain('sm:grid-cols-2');
    expect(grid?.className).toContain('lg:grid-cols-3');
    expect(grid?.className).toContain('xl:grid-cols-4');
  });

  it('should render View Details links for each product', () => {
    vi.mocked(useProductsHook.useProducts).mockReturnValue({
      products: mockProducts,
      total: 2,
      page: 1,
      limit: 12,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
      isLoading: false,
      isError: false,
      error: undefined,
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      goToPage: vi.fn(),
      setCategory: vi.fn(),
      setFeatured: vi.fn(),
      setSearch: vi.fn(),
      mutate: vi.fn(),
    });

    render(<FeaturedProducts />);

    const viewDetailsLinks = screen.getAllByText('View Details');
    expect(viewDetailsLinks).toHaveLength(2);

    // Check that links point to correct product pages
    const links = screen.getAllByRole('link', { name: 'View Details' });
    expect(links[0].getAttribute('href')).toBe('/products/1');
    expect(links[1].getAttribute('href')).toBe('/products/2');
  });
});
