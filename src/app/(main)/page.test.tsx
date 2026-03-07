/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Home, { metadata } from './page';
import { BRAND_NAME, SITE_DESCRIPTION } from '@/lib/constants/site';

// Mock the home components
vi.mock('@/components/home/HeroSection', () => ({
  default: function MockHeroSection() {
    return <div data-testid="hero-section">Hero Section</div>;
  },
}));

vi.mock('@/components/home/ImageCarousel', () => ({
  default: function MockImageCarousel() {
    return <div data-testid="image-carousel">Image Carousel</div>;
  },
}));

vi.mock('@/components/home/FeaturedProducts', () => ({
  default: function MockFeaturedProducts() {
    return <div data-testid="featured-products">Featured Products</div>;
  },
}));

describe('Home Landing Page', () => {
  it('renders all three main components', () => {
    render(<Home />);

    expect(screen.getByTestId('hero-section')).toBeTruthy();
    expect(screen.getByTestId('image-carousel')).toBeTruthy();
    expect(screen.getByTestId('featured-products')).toBeTruthy();
  });

  it('renders components in correct order', () => {
    const { container } = render(<Home />);
    const sections = container.querySelectorAll('section');

    expect(sections.length).toBe(3);
    expect(sections[0].contains(screen.getByTestId('hero-section'))).toBe(true);
    expect(sections[1].contains(screen.getByTestId('image-carousel'))).toBe(true);
    expect(sections[2].contains(screen.getByTestId('featured-products'))).toBe(true);
  });

  it('has proper semantic structure', () => {
    const { container } = render(<Home />);
    const main = container.querySelector('main');

    expect(main).toBeTruthy();
    expect(main?.classList.contains('min-h-screen')).toBe(true);
  });

  describe('SEO Metadata', () => {
    it('has proper title', () => {
      expect(metadata.title).toBe(`${BRAND_NAME} | Premium Confectioneries & Delicacies`);
    });

    it('has proper description', () => {
      expect(metadata.description).toBe(SITE_DESCRIPTION);
    });

    it('has keywords for SEO', () => {
      expect(metadata.keywords).toContain('confectionery');
      expect(metadata.keywords).toContain('sweets');
      expect(metadata.keywords).toContain('traditional delicacies');
    });

    it('has Open Graph metadata', () => {
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.title).toBe(`${BRAND_NAME} | Premium Confectioneries & Delicacies`);
      expect(metadata.openGraph?.type).toBe('website');
      expect(metadata.openGraph?.locale).toBe('en_US');
    });

    it('has Twitter Card metadata', () => {
      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter?.card).toBe('summary_large_image');
      expect(metadata.twitter?.title).toBe(`${BRAND_NAME} | Premium Confectioneries & Delicacies`);
    });
  });
});
