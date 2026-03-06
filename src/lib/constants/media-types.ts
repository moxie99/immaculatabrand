/**
 * Media type constants for the Confectionary Platform
 * Defines the four media types: hero, carousel, product, and category
 */

import { MediaType } from '@/types/media.types';

/**
 * Media types
 * These are the only valid types for media/images in the system
 */
export const MEDIA_TYPES = {
  HERO: 'hero',
  CAROUSEL: 'carousel',
  PRODUCT: 'product',
  CATEGORY: 'category',
} as const;

/**
 * Array of all valid media types
 * Useful for validation and iteration
 */
export const MEDIA_TYPE_VALUES: readonly MediaType[] = [
  MEDIA_TYPES.HERO,
  MEDIA_TYPES.CAROUSEL,
  MEDIA_TYPES.PRODUCT,
  MEDIA_TYPES.CATEGORY,
] as const;

/**
 * Display names for media types
 * Maps media type values to human-readable names
 */
export const MEDIA_TYPE_DISPLAY_NAMES: Record<MediaType, string> = {
  [MEDIA_TYPES.HERO]: 'Hero Image',
  [MEDIA_TYPES.CAROUSEL]: 'Carousel Image',
  [MEDIA_TYPES.PRODUCT]: 'Product Image',
  [MEDIA_TYPES.CATEGORY]: 'Category Image',
} as const;

/**
 * Media type descriptions
 * Provides context about each media type's purpose
 */
export const MEDIA_TYPE_DESCRIPTIONS: Record<MediaType, string> = {
  [MEDIA_TYPES.HERO]: 'Large banner image displayed on the homepage hero section',
  [MEDIA_TYPES.CAROUSEL]: 'Images displayed in the homepage carousel/slideshow',
  [MEDIA_TYPES.PRODUCT]: 'Product photos displayed on product detail pages',
  [MEDIA_TYPES.CATEGORY]: 'Category banner images for product category pages',
} as const;

/**
 * Cloudinary folder paths for each media type
 * Used when uploading images to organize them in Cloudinary
 */
export const MEDIA_TYPE_FOLDERS: Record<MediaType, string> = {
  [MEDIA_TYPES.HERO]: 'confectionary/hero',
  [MEDIA_TYPES.CAROUSEL]: 'confectionary/carousel',
  [MEDIA_TYPES.PRODUCT]: 'confectionary/product',
  [MEDIA_TYPES.CATEGORY]: 'confectionary/category',
} as const;

/**
 * Helper function to check if a value is a valid media type
 */
export function isValidMediaType(value: unknown): value is MediaType {
  return typeof value === 'string' && MEDIA_TYPE_VALUES.includes(value as MediaType);
}

/**
 * Helper function to get display name for a media type
 */
export function getMediaTypeDisplayName(type: MediaType): string {
  return MEDIA_TYPE_DISPLAY_NAMES[type] || type;
}

/**
 * Helper function to get description for a media type
 */
export function getMediaTypeDescription(type: MediaType): string {
  return MEDIA_TYPE_DESCRIPTIONS[type] || '';
}

/**
 * Helper function to get Cloudinary folder path for a media type
 */
export function getMediaTypeFolder(type: MediaType): string {
  return MEDIA_TYPE_FOLDERS[type] || `confectionary/${type}`;
}
