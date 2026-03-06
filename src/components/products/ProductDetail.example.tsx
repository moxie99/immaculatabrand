import React from 'react';
import ProductDetail from './ProductDetail';
import type { Product } from '@/types/product.types';

/**
 * Example usage of ProductDetail component
 */

// Example 1: Full product with all features
const fullProduct: Product = {
  _id: '1',
  name: 'Traditional Scottish Shortbread',
  slug: 'traditional-scottish-shortbread',
  category: 'confectionary',
  description: 'Authentic Scottish shortbread made with premium butter and traditional methods. Crisp, buttery, and melt-in-your-mouth delicious. Perfect with tea or coffee.',
  price: 1250,
  currency: 'GBP',
  images: [
    'https://example.com/shortbread-main.jpg',
    'https://example.com/shortbread-close.jpg',
    'https://example.com/shortbread-package.jpg',
    'https://example.com/shortbread-serving.jpg',
  ],
  preparationSteps: [
    {
      stepNumber: 1,
      title: 'Remove from Package',
      description: 'Carefully remove shortbread from packaging to preserve shape.',
      duration: '1 minute',
    },
    {
      stepNumber: 2,
      title: 'Serve at Room Temperature',
      description: 'For best flavor, allow shortbread to reach room temperature before serving.',
      duration: '10 minutes',
      imageUrl: 'https://example.com/serving-temp.jpg',
    },
    {
      stepNumber: 3,
      title: 'Pair with Beverage',
      description: 'Enjoy with your favorite tea, coffee, or hot chocolate for the perfect treat.',
      duration: '5 minutes',
    },
  ],
  nutritionInfo: {
    servingSize: '2 pieces (30g)',
    calories: 150,
    protein: '2g',
    carbs: '18g',
    fat: '8g',
  },
  isFeatured: true,
  isActive: true,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
};

// Example 2: Product without nutrition info
const productWithoutNutrition: Product = {
  _id: '2',
  name: 'Fresh Atlantic Salmon',
  slug: 'fresh-atlantic-salmon',
  category: 'fish',
  description: 'Premium fresh Atlantic salmon, sustainably sourced. Perfect for grilling, baking, or pan-searing.',
  price: 3500,
  currency: 'GBP',
  images: [
    'https://example.com/salmon-main.jpg',
    'https://example.com/salmon-fillet.jpg',
  ],
  preparationSteps: [
    {
      stepNumber: 1,
      title: 'Rinse and Pat Dry',
      description: 'Rinse the salmon under cold water and pat dry with paper towels.',
      duration: '2 minutes',
    },
    {
      stepNumber: 2,
      title: 'Season',
      description: 'Season with salt, pepper, and your choice of herbs.',
      duration: '3 minutes',
    },
    {
      stepNumber: 3,
      title: 'Cook',
      description: 'Grill, bake at 400°F, or pan-sear until internal temperature reaches 145°F.',
      duration: '12-15 minutes',
    },
  ],
  isFeatured: false,
  isActive: true,
  createdAt: new Date('2024-01-20'),
  updatedAt: new Date('2024-01-20'),
};

// Example 3: Minimal product (no prep steps or nutrition)
const minimalProduct: Product = {
  _id: '3',
  name: 'Organic Honey',
  slug: 'organic-honey',
  category: 'foodstuffs',
  description: 'Pure organic honey from local beekeepers. Raw and unfiltered for maximum flavor and health benefits.',
  price: 850,
  currency: 'GBP',
  images: ['https://example.com/honey.jpg'],
  preparationSteps: [],
  isFeatured: false,
  isActive: true,
  createdAt: new Date('2024-01-25'),
  updatedAt: new Date('2024-01-25'),
};

export default function ProductDetailExamples() {
  return (
    <div className="space-y-16 p-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Example 1: Full Product Details</h2>
        <p className="text-muted-foreground mb-6">
          Product with all features: multiple images, preparation steps, and nutrition info
        </p>
        <ProductDetail product={fullProduct} />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Example 2: Product Without Nutrition Info</h2>
        <p className="text-muted-foreground mb-6">
          Product with images and preparation steps but no nutrition information
        </p>
        <ProductDetail product={productWithoutNutrition} />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Example 3: Minimal Product</h2>
        <p className="text-muted-foreground mb-6">
          Product with minimal information (no prep steps or nutrition)
        </p>
        <ProductDetail product={minimalProduct} />
      </div>
    </div>
  );
}
