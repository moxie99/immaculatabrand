/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HeroSection from './HeroSection';

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('HeroSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should render loading state initially', () => {
    // Mock fetch to never resolve
    (global.fetch as any).mockImplementation(() => new Promise(() => {}));

    render(<HeroSection />);

    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('should fetch and display hero content and image', async () => {
    const mockContent = {
      success: true,
      data: {
        key: 'homepage_hero',
        data: {
          heading: 'Test Heading',
          subheading: 'Test Subheading',
          ctaText: 'Shop Now',
          ctaLink: '/products',
        },
      },
    };

    const mockMedia = {
      success: true,
      data: [
        {
          secureUrl: 'https://example.com/hero.jpg',
          altText: 'Hero Image',
          width: 1200,
          height: 800,
        },
      ],
    };

    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/content')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockContent),
        });
      }
      if (url.includes('/api/media/hero')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMedia),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<HeroSection />);

    await waitFor(() => {
      expect(screen.getByText('Test Heading')).toBeTruthy();
    });

    expect(screen.getByText('Test Subheading')).toBeTruthy();
    expect(screen.getByText('Shop Now')).toBeTruthy();
    expect(screen.getByAltText('Hero Image')).toBeTruthy();
  });

  it('should display default content when API returns no data', async () => {
    const mockContent = {
      success: true,
      data: null,
    };

    const mockMedia = {
      success: true,
      data: [],
    };

    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/content')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockContent),
        });
      }
      if (url.includes('/api/media/hero')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMedia),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<HeroSection />);

    await waitFor(() => {
      expect(screen.getByText('Authentic African Delicacies')).toBeTruthy();
    });

    expect(screen.getByText('Delivered to Your Doorstep')).toBeTruthy();
    expect(screen.getByText('Browse Products')).toBeTruthy();
  });

  it('should display error state when fetch fails', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    render(<HeroSection />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load hero section')).toBeTruthy();
    });
  });

  it('should display error state when API returns error status', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<HeroSection />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load hero section')).toBeTruthy();
    });
  });

  it('should render CTA button with correct link', async () => {
    const mockContent = {
      success: true,
      data: {
        key: 'homepage_hero',
        data: {
          heading: 'Test Heading',
          subheading: 'Test Subheading',
          ctaText: 'Shop Now',
          ctaLink: '/products',
        },
      },
    };

    const mockMedia = {
      success: true,
      data: [],
    };

    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/content')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockContent),
        });
      }
      if (url.includes('/api/media/hero')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMedia),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<HeroSection />);

    await waitFor(() => {
      const link = screen.getByRole('link', { name: 'Shop Now' });
      expect(link).toBeTruthy();
      expect(link.getAttribute('href')).toBe('/products');
    });
  });

  it('should handle missing hero image gracefully', async () => {
    const mockContent = {
      success: true,
      data: {
        key: 'homepage_hero',
        data: {
          heading: 'Test Heading',
          subheading: 'Test Subheading',
          ctaText: 'Shop Now',
          ctaLink: '/products',
        },
      },
    };

    const mockMedia = {
      success: true,
      data: [],
    };

    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/content')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockContent),
        });
      }
      if (url.includes('/api/media/hero')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMedia),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<HeroSection />);

    await waitFor(() => {
      expect(screen.getByText('Test Heading')).toBeTruthy();
    });

    // Should not have an image with alt text
    expect(screen.queryByAltText(/hero/i)).toBeNull();
  });
});
