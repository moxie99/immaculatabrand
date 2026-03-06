/**
 * Product category constants for the Confectionary Platform
 * Defines the three main product categories: confectionary, fish, and foodstuffs
 */

import { Category } from '@/types/product.types';

/**
 * Product categories
 * These are the only valid categories for products in the system
 */
export const CATEGORIES = {
  CONFECTIONARY: 'confectionary',
  FISH: 'fish',
  FOODSTUFFS: 'foodstuffs',
} as const;

/**
 * Array of all valid categories
 * Useful for validation and iteration
 */
export const CATEGORY_VALUES: readonly Category[] = [
  CATEGORIES.CONFECTIONARY,
  CATEGORIES.FISH,
  CATEGORIES.FOODSTUFFS,
] as const;

/**
 * Display names for categories
 * Maps category values to human-readable names
 */
export const CATEGORY_DISPLAY_NAMES: Record<Category, string> = {
  [CATEGORIES.CONFECTIONARY]: 'Confectionary',
  [CATEGORIES.FISH]: 'Fish Products',
  [CATEGORIES.FOODSTUFFS]: 'African Foodstuffs',
} as const;

/**
 * Category descriptions
 * Provides context about each category
 */
export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  [CATEGORIES.CONFECTIONARY]: 'Delicious African cakes, snacks, and sweet treats',
  [CATEGORIES.FISH]: 'Premium smoked and dried fish products',
  [CATEGORIES.FOODSTUFFS]: 'Authentic African ingredients and staples',
} as const;

/**
 * Helper function to check if a value is a valid category
 */
export function isValidCategory(value: unknown): value is Category {
  return typeof value === 'string' && CATEGORY_VALUES.includes(value as Category);
}

/**
 * Helper function to get display name for a category
 */
export function getCategoryDisplayName(category: Category): string {
  return CATEGORY_DISPLAY_NAMES[category] || category;
}

/**
 * Helper function to get description for a category
 */
export function getCategoryDescription(category: Category): string {
  return CATEGORY_DESCRIPTIONS[category] || '';
}
