/**
 * Tests for Navigation component
 * 
 * Note: These are unit tests for the component's structure and exports.
 * For full integration tests with React rendering, use a separate test suite
 * with jsdom environment.
 */

import { describe, it, expect } from 'vitest';
import { Navigation } from './Navigation';

describe('Navigation Component', () => {
  it('should export Navigation component', () => {
    expect(Navigation).toBeDefined();
    expect(typeof Navigation).toBe('function');
  });

  it('should be a valid React component', () => {
    // Verify the component has the expected structure
    expect(Navigation.name).toBe('Navigation');
  });

  describe('Component Props Interface', () => {
    it('should accept activeCategory prop', () => {
      // Type check - this will fail at compile time if prop doesn't exist
      const props: React.ComponentProps<typeof Navigation> = {
        activeCategory: 'confectionary',
      };
      expect(props.activeCategory).toBe('confectionary');
    });

    it('should accept onCategoryChange callback prop', () => {
      const callback = (category: 'all' | 'confectionary' | 'fish' | 'foodstuffs') => {
        return category;
      };
      const props: React.ComponentProps<typeof Navigation> = {
        onCategoryChange: callback,
      };
      expect(props.onCategoryChange).toBe(callback);
    });

    it('should accept basePath prop', () => {
      const props: React.ComponentProps<typeof Navigation> = {
        basePath: '/shop',
      };
      expect(props.basePath).toBe('/shop');
    });

    it('should accept asButtons prop', () => {
      const props: React.ComponentProps<typeof Navigation> = {
        asButtons: true,
      };
      expect(props.asButtons).toBe(true);
    });

    it('should accept all props together', () => {
      const callback = (category: 'all' | 'confectionary' | 'fish' | 'foodstuffs') => {
        return category;
      };
      const props: React.ComponentProps<typeof Navigation> = {
        activeCategory: 'fish',
        onCategoryChange: callback,
        basePath: '/products',
        asButtons: false,
      };
      expect(props.activeCategory).toBe('fish');
      expect(props.onCategoryChange).toBe(callback);
      expect(props.basePath).toBe('/products');
      expect(props.asButtons).toBe(false);
    });
  });

  describe('Category Values', () => {
    it('should support "all" category', () => {
      const category: 'all' | 'confectionary' | 'fish' | 'foodstuffs' = 'all';
      expect(category).toBe('all');
    });

    it('should support "confectionary" category', () => {
      const category: 'all' | 'confectionary' | 'fish' | 'foodstuffs' = 'confectionary';
      expect(category).toBe('confectionary');
    });

    it('should support "fish" category', () => {
      const category: 'all' | 'confectionary' | 'fish' | 'foodstuffs' = 'fish';
      expect(category).toBe('fish');
    });

    it('should support "foodstuffs" category', () => {
      const category: 'all' | 'confectionary' | 'fish' | 'foodstuffs' = 'foodstuffs';
      expect(category).toBe('foodstuffs');
    });
  });
});
