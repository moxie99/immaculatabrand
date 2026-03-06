/**
 * Product type definitions
 * These types align with the Product Mongoose schema
 */

/**
 * Product category enum
 */
export type Category = 'confectionary' | 'fish' | 'foodstuffs';

/**
 * Currency enum
 */
export type Currency = 'GBP' | 'USD' | 'EUR';

/**
 * Preparation step for a product
 */
export interface PreparationStep {
  stepNumber: number;
  title: string;
  description: string;
  imageUrl?: string;
  duration?: string;
}

/**
 * Nutrition information for a product
 */
export interface NutritionInfo {
  servingSize: string;
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
}

/**
 * Product interface
 * Represents a food product (confectionary, fish, or foodstuff)
 */
export interface Product {
  _id: string;
  name: string;
  slug: string;
  category: Category;
  description: string;
  price: number;
  currency: Currency;
  images: string[];
  preparationSteps: PreparationStep[];
  nutritionInfo?: NutritionInfo;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Product creation input (without auto-generated fields)
 */
export interface ProductCreateInput {
  name: string;
  category: Category;
  description: string;
  price: number;
  currency?: Currency;
  images?: string[];
  preparationSteps?: PreparationStep[];
  nutritionInfo?: NutritionInfo;
  isFeatured?: boolean;
  isActive?: boolean;
}

/**
 * Product update input (all fields optional except id)
 */
export interface ProductUpdateInput {
  name?: string;
  category?: Category;
  description?: string;
  price?: number;
  currency?: Currency;
  images?: string[];
  preparationSteps?: PreparationStep[];
  nutritionInfo?: NutritionInfo;
  isFeatured?: boolean;
  isActive?: boolean;
}
