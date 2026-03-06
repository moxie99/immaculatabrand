/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ImageCarousel from './ImageCarousel';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

// Mock embla-carousel-autoplay
vi.mock('embla-carousel-autoplay', () => ({
  default: vi.fn((options) => ({
    name: 'autoplay',
    options: options || {},
    init: vi.fn(),
    destroy: vi.fn(),
    stop: vi.fn(),
    play: vi.fn(),
  })),
}));

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('ImageCarousel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should display loading state initially', () => {
    (global.fetch as any).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<ImageCarousel />);
    expect(screen.getByText('Loading carousel...')).toBeTruthy();
  });

  it('should fetch and display carousel images', async () => {
    const mockImages = [
      {
        _id: '1',
        secureUrl: 'https://res.cloudinary.com/test/image1.jpg',
        altText: 'Carousel Image 1',
        width: 1200,
        height: 800,
      },
      {
        _id: '2',
        secureUrl: 'https://res.cloudinary.com/test/image2.jpg',
        altText: 'Carousel Image 2',
        width: 1200,
        height: 800,
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockImages,
      }),
    });

    render(<ImageCarousel />);

    await waitFor(() => {
      expect(screen.getByAltText('Carousel Image 1')).toBeTruthy();
    });

    expect(screen.getByAltText('Carousel Image 2')).toBeTruthy();
  });

  it('should display error state when fetch fails', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<ImageCarousel />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load carousel images')).toBeTruthy();
    });
  });

  it('should display empty state when no images are available', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [],
      }),
    });

    render(<ImageCarousel />);

    await waitFor(() => {
      expect(screen.getByText('No carousel images available')).toBeTruthy();
    });
  });

  it('should call the correct API endpoint', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [],
      }),
    });

    global.fetch = mockFetch;

    render(<ImageCarousel />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/media/carousel');
    });
  });

  it('should use HTTPS URLs for images', async () => {
    const mockImages = [
      {
        _id: '1',
        secureUrl: 'https://res.cloudinary.com/test/image1.jpg',
        altText: 'Test Image',
        width: 1200,
        height: 800,
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockImages,
      }),
    });

    render(<ImageCarousel />);

    await waitFor(() => {
      const img = screen.getByAltText('Test Image');
      expect(img).toBeTruthy();
      expect(img.getAttribute('src')).toBe('https://res.cloudinary.com/test/image1.jpg');
    });
  });
});
