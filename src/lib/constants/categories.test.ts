import { describe, it, expect } from 'vitest';
import {
  CATEGORIES,
  CATEGORY_VALUES,
  CATEGORY_DISPLAY_NAMES,
  CATEGORY_DESCRIPTIONS,
  isValidCategory,
  getCategoryDisplayName,
  getCategoryDescription,
} from './categories';

describe('categories constants', () => {
  describe('CATEGORIES', () => {
    it('should have correct category values', () => {
      expect(CATEGORIES.CONFECTIONARY).toBe('confectionary');
      expect(CATEGORIES.FISH).toBe('fish');
      expect(CATEGORIES.FOODSTUFFS).toBe('foodstuffs');
    });
  });

  describe('CATEGORY_VALUES', () => {
    it('should contain all three categories', () => {
      expect(CATEGORY_VALUES).toHaveLength(3);
      expect(CATEGORY_VALUES).toContain('confectionary');
      expect(CATEGORY_VALUES).toContain('fish');
      expect(CATEGORY_VALUES).toContain('foodstuffs');
    });
  });

  describe('CATEGORY_DISPLAY_NAMES', () => {
    it('should have display names for all categories', () => {
      expect(CATEGORY_DISPLAY_NAMES.confectionary).toBe('Confectionary');
      expect(CATEGORY_DISPLAY_NAMES.fish).toBe('Fish Products');
      expect(CATEGORY_DISPLAY_NAMES.foodstuffs).toBe('African Foodstuffs');
    });
  });

  describe('CATEGORY_DESCRIPTIONS', () => {
    it('should have descriptions for all categories', () => {
      expect(CATEGORY_DESCRIPTIONS.confectionary).toBeTruthy();
      expect(CATEGORY_DESCRIPTIONS.fish).toBeTruthy();
      expect(CATEGORY_DESCRIPTIONS.foodstuffs).toBeTruthy();
    });

    it('should have meaningful descriptions', () => {
      expect(CATEGORY_DESCRIPTIONS.confectionary).toContain('African');
      expect(CATEGORY_DESCRIPTIONS.fish).toContain('fish');
      expect(CATEGORY_DESCRIPTIONS.foodstuffs).toContain('African');
    });
  });

  describe('isValidCategory', () => {
    it('should return true for valid categories', () => {
      expect(isValidCategory('confectionary')).toBe(true);
      expect(isValidCategory('fish')).toBe(true);
      expect(isValidCategory('foodstuffs')).toBe(true);
    });

    it('should return false for invalid categories', () => {
      expect(isValidCategory('invalid')).toBe(false);
      expect(isValidCategory('drinks')).toBe(false);
      expect(isValidCategory('')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(isValidCategory(123)).toBe(false);
      expect(isValidCategory(null)).toBe(false);
      expect(isValidCategory(undefined)).toBe(false);
      expect(isValidCategory({})).toBe(false);
      expect(isValidCategory([])).toBe(false);
    });
  });

  describe('getCategoryDisplayName', () => {
    it('should return correct display names', () => {
      expect(getCategoryDisplayName('confectionary')).toBe('Confectionary');
      expect(getCategoryDisplayName('fish')).toBe('Fish Products');
      expect(getCategoryDisplayName('foodstuffs')).toBe('African Foodstuffs');
    });
  });

  describe('getCategoryDescription', () => {
    it('should return correct descriptions', () => {
      expect(getCategoryDescription('confectionary')).toBe(
        'Delicious African cakes, snacks, and sweet treats'
      );
      expect(getCategoryDescription('fish')).toBe(
        'Premium smoked and dried fish products'
      );
      expect(getCategoryDescription('foodstuffs')).toBe(
        'Authentic African ingredients and staples'
      );
    });
  });
});
