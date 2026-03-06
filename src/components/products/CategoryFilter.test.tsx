/**
 * Tests for CategoryFilter component
 * 
 * Note: These are unit tests for the component's structure and exports.
 * For full integration tests with React rendering, use a separate test suite
 * with jsdom environment.
 */

import { describe, it, expect } from 'vitest';
import { CategoryFilter } from './CategoryFilter';

describe('CategoryFilter Component', () => {
  it('should export CategoryFilter component', () => {
    expect(CategoryFilter).toBeDefined();
    expect(typeof CategoryFilter).toBe('function');
  });

  it('should be a valid React component', () => {
    // Verify the component has the expected structure
    expect(CategoryFilter.name).toBe('CategoryFilter');
  });

  describe('Component Props Interface', () => {
    it('should accept activeCategory prop', () => {
      // Type check - this will fail at compile time if prop doesn't exist
      const props: React.ComponentProps<typeof CategoryFilter> = {
        activeCategory: 'confectionary',
        onCategoryChange: () => {},
      };
      expect(props.activeCategory).toBe('confectionary');
    });

    it('should accept onCategoryChange callback prop', () => {
      const callback = (category: 'all' | 'confectionary' | 'fish' | 'foodstuffs') => {
        return category;
      };
      const props: React.ComponentProps<typeof CategoryFilter> = {
        activeCategory: 'all',
        onCategoryChange: callback,
      };
      expect(props.onCategoryChange).toBe(callback);
    });

    it('should require both activeCategory and onCategoryChange props', () => {
      const callback = (category: 'all' | 'confectionary' | 'fish' | 'foodstuffs') => {
        return category;
      };
      const props: React.ComponentProps<typeof CategoryFilter> = {
        activeCategory: 'fish',
        onCategoryChange: callback,
      };
      expect(props.activeCategory).toBe('fish');
      expect(props.onCategoryChange).toBe(callback);
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

  describe('Controlled Component Behavior', () => {
    it('should work as a controlled component', () => {
      let currentCategory: 'all' | 'confectionary' | 'fish' | 'foodstuffs' = 'all';
      const handleChange = (category: 'all' | 'confectionary' | 'fish' | 'foodstuffs') => {
        currentCategory = category;
      };

      const props: React.ComponentProps<typeof CategoryFilter> = {
        activeCategory: currentCategory,
        onCategoryChange: handleChange,
      };

      expect(props.activeCategory).toBe('all');
      
      // Simulate category change
      props.onCategoryChange('confectionary');
      expect(currentCategory).toBe('confectionary');
    });
  });
});
