import React from 'react';
import ProductCard from './ProductCard';
import type { Product } from '@/types/product.types';

/**
 * ProductCard Component Examples
 * 
 * This file demonstrates various use cases of the ProductCard component.
 */

// Example 1: Basic product card with all fields
const confectionaryProduct: Product = {
  _id: '1',
  name: 'Nigerian Chin Chin',
  slug: 'nigerian-chin-chin',
  category: 'confectionary',
  description: 'Delicious crunchy snack made from wheat flour',
  price: 1500, // £15.00
  currency: 'GBP',
  images: ['https://res.cloudinary.com/demo/image/upload/chin-chin.jpg'],
  preparationSteps: [],
  isFeatured: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Example 2: Fish product
const fishProduct: Product = {
  _id: '2',
  name: 'Smoked Catfish',
  slug: 'smoked-catfish',
  category: 'fish',
  description: 'Premium smoked catfish from Nigeria',
  price: 2500, // £25.00
  currency: 'GBP',
  images: ['https://res.cloudinary.com/demo/image/upload/catfish.jpg'],
  preparationSteps: [],
  isFeatured: false,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Example 3: Product without images (uses placeholder)
const productWithoutImage: Product = {
  _id: '3',
  name: 'Plantain Flour',
  slug: 'plantain-flour',
  category: 'foodstuffs',
  description: 'Organic plantain flour',
  price: 800, // £8.00
  currency: 'GBP',
  images: [],
  preparationSteps: [],
  isFeatured: false,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Example 4: Product with USD currency
const usdProduct: Product = {
  _id: '4',
  name: 'Dried Crayfish',
  slug: 'dried-crayfish',
  category: 'fish',
  description: 'Premium dried crayfish',
  price: 3000, // $30.00
  currency: 'USD',
  images: ['https://res.cloudinary.com/demo/image/upload/crayfish.jpg'],
  preparationSteps: [],
  isFeatured: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Example: Single ProductCard
 */
export function SingleProductCardExample() {
  return (
    <div className="w-full max-w-sm">
      <ProductCard product={confectionaryProduct} />
    </div>
  );
}

/**
 * Example: ProductCard Grid (2 columns)
 */
export function ProductCardGridExample() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl">
      <ProductCard product={confectionaryProduct} />
      <ProductCard product={fishProduct} />
    </div>
  );
}

/**
 * Example: ProductCard Grid (4 columns - typical homepage layout)
 */
export function ProductCardGridFullExample() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <ProductCard product={confectionaryProduct} />
      <ProductCard product={fishProduct} />
      <ProductCard product={productWithoutImage} />
      <ProductCard product={usdProduct} />
    </div>
  );
}

/**
 * Example: ProductCard with missing image (shows placeholder)
 */
export function ProductCardPlaceholderExample() {
  return (
    <div className="w-full max-w-sm">
      <ProductCard product={productWithoutImage} />
    </div>
  );
}

/**
 * Example: ProductCard with different currency
 */
export function ProductCardDifferentCurrencyExample() {
  return (
    <div className="w-full max-w-sm">
      <ProductCard product={usdProduct} />
    </div>
  );
}

/**
 * Example: Responsive ProductCard Grid
 * Demonstrates how the component adapts to different screen sizes
 */
export function ResponsiveProductCardExample() {
  const products = [
    confectionaryProduct,
    fishProduct,
    productWithoutImage,
    usdProduct,
  ];

  return (
    <div className="w-full px-4">
      <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default function ProductCardExamples() {
  return (
    <div className="space-y-12 p-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Single Product Card</h2>
        <SingleProductCardExample />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Product Card Grid (2 columns)</h2>
        <ProductCardGridExample />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Product Card Grid (4 columns)</h2>
        <ProductCardGridFullExample />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Product Card with Placeholder</h2>
        <ProductCardPlaceholderExample />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Product Card with USD Currency</h2>
        <ProductCardDifferentCurrencyExample />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Responsive Grid</h2>
        <ResponsiveProductCardExample />
      </section>
    </div>
  );
}
