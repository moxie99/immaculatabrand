import { describe, it, expect } from 'vitest';
import {
  MEDIA_TYPES,
  MEDIA_TYPE_VALUES,
  MEDIA_TYPE_DISPLAY_NAMES,
  MEDIA_TYPE_DESCRIPTIONS,
  MEDIA_TYPE_FOLDERS,
  isValidMediaType,
  getMediaTypeDisplayName,
  getMediaTypeDescription,
  getMediaTypeFolder,
} from './media-types';

describe('media-types constants', () => {
  describe('MEDIA_TYPES', () => {
    it('should have correct media type values', () => {
      expect(MEDIA_TYPES.HERO).toBe('hero');
      expect(MEDIA_TYPES.CAROUSEL).toBe('carousel');
      expect(MEDIA_TYPES.PRODUCT).toBe('product');
      expect(MEDIA_TYPES.CATEGORY).toBe('category');
    });
  });

  describe('MEDIA_TYPE_VALUES', () => {
    it('should contain all four media types', () => {
      expect(MEDIA_TYPE_VALUES).toHaveLength(4);
      expect(MEDIA_TYPE_VALUES).toContain('hero');
      expect(MEDIA_TYPE_VALUES).toContain('carousel');
      expect(MEDIA_TYPE_VALUES).toContain('product');
      expect(MEDIA_TYPE_VALUES).toContain('category');
    });
  });

  describe('MEDIA_TYPE_DISPLAY_NAMES', () => {
    it('should have display names for all media types', () => {
      expect(MEDIA_TYPE_DISPLAY_NAMES.hero).toBe('Hero Image');
      expect(MEDIA_TYPE_DISPLAY_NAMES.carousel).toBe('Carousel Image');
      expect(MEDIA_TYPE_DISPLAY_NAMES.product).toBe('Product Image');
      expect(MEDIA_TYPE_DISPLAY_NAMES.category).toBe('Category Image');
    });
  });

  describe('MEDIA_TYPE_DESCRIPTIONS', () => {
    it('should have descriptions for all media types', () => {
      expect(MEDIA_TYPE_DESCRIPTIONS.hero).toBeTruthy();
      expect(MEDIA_TYPE_DESCRIPTIONS.carousel).toBeTruthy();
      expect(MEDIA_TYPE_DESCRIPTIONS.product).toBeTruthy();
      expect(MEDIA_TYPE_DESCRIPTIONS.category).toBeTruthy();
    });

    it('should have meaningful descriptions', () => {
      expect(MEDIA_TYPE_DESCRIPTIONS.hero).toContain('homepage');
      expect(MEDIA_TYPE_DESCRIPTIONS.carousel).toContain('carousel');
      expect(MEDIA_TYPE_DESCRIPTIONS.product).toContain('product');
      expect(MEDIA_TYPE_DESCRIPTIONS.category).toContain('category');
    });
  });

  describe('MEDIA_TYPE_FOLDERS', () => {
    it('should have Cloudinary folder paths for all media types', () => {
      expect(MEDIA_TYPE_FOLDERS.hero).toBe('confectionary/hero');
      expect(MEDIA_TYPE_FOLDERS.carousel).toBe('confectionary/carousel');
      expect(MEDIA_TYPE_FOLDERS.product).toBe('confectionary/product');
      expect(MEDIA_TYPE_FOLDERS.category).toBe('confectionary/category');
    });

    it('should use confectionary prefix for all folders', () => {
      Object.values(MEDIA_TYPE_FOLDERS).forEach((folder) => {
        expect(folder).toMatch(/^confectionary\//);
      });
    });
  });

  describe('isValidMediaType', () => {
    it('should return true for valid media types', () => {
      expect(isValidMediaType('hero')).toBe(true);
      expect(isValidMediaType('carousel')).toBe(true);
      expect(isValidMediaType('product')).toBe(true);
      expect(isValidMediaType('category')).toBe(true);
    });

    it('should return false for invalid media types', () => {
      expect(isValidMediaType('invalid')).toBe(false);
      expect(isValidMediaType('banner')).toBe(false);
      expect(isValidMediaType('')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(isValidMediaType(123)).toBe(false);
      expect(isValidMediaType(null)).toBe(false);
      expect(isValidMediaType(undefined)).toBe(false);
      expect(isValidMediaType({})).toBe(false);
      expect(isValidMediaType([])).toBe(false);
    });
  });

  describe('getMediaTypeDisplayName', () => {
    it('should return correct display names', () => {
      expect(getMediaTypeDisplayName('hero')).toBe('Hero Image');
      expect(getMediaTypeDisplayName('carousel')).toBe('Carousel Image');
      expect(getMediaTypeDisplayName('product')).toBe('Product Image');
      expect(getMediaTypeDisplayName('category')).toBe('Category Image');
    });
  });

  describe('getMediaTypeDescription', () => {
    it('should return correct descriptions', () => {
      expect(getMediaTypeDescription('hero')).toBe(
        'Large banner image displayed on the homepage hero section'
      );
      expect(getMediaTypeDescription('carousel')).toBe(
        'Images displayed in the homepage carousel/slideshow'
      );
      expect(getMediaTypeDescription('product')).toBe(
        'Product photos displayed on product detail pages'
      );
      expect(getMediaTypeDescription('category')).toBe(
        'Category banner images for product category pages'
      );
    });
  });

  describe('getMediaTypeFolder', () => {
    it('should return correct Cloudinary folder paths', () => {
      expect(getMediaTypeFolder('hero')).toBe('confectionary/hero');
      expect(getMediaTypeFolder('carousel')).toBe('confectionary/carousel');
      expect(getMediaTypeFolder('product')).toBe('confectionary/product');
      expect(getMediaTypeFolder('category')).toBe('confectionary/category');
    });
  });
});
