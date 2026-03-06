import React from 'react';
import ProductGrid from './ProductGrid';
import type { Product } from '@/types/product.types';

/**
 * ProductGrid Component Examples
 * 
 * This file demonstrates various usage scenarios for the ProductGrid component.
 */

// Sample product data
const sampleProducts: Product[] = [
  {
    _id: '1',
    name: 'Nigerian Chin Chin',
    slug: 'nigerian-chin-chin',
    category: 'confectionary',
    description: 'Crunchy fried snack made from wheat flour, sugar, and spices',
    price: 599,
    currency: 'GBP',
    images: ['https://res.cloudinary.com/demo/image/upload/sample1.jpg'],
    preparationSteps: [],
    isFeatured: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '2',
    name: 'Smoked Catfish',
    slug: 'smoked-catfish',
    category: 'fish',
    description: 'Premium smoked catfish from West Africa',
    price: 1299,
    currency: 'GBP',
    images: ['https://res.cloudinary.com/demo/image/upload/sample2.jpg'],
    preparationSteps: [],
    isFeatured: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '3',
    name: 'Plantain Flour',
    slug: 'plantain-flour',
    category: 'foodstuffs',
    description: 'Organic plantain flour for traditional dishes',
    price: 799,
    currency: 'GBP',
    images: ['https://res.cloudinary.com/demo/image/upload/sample3.jpg'],
    preparationSteps: [],
    isFeatured: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '4',
    name: 'Puff Puff Mix',
    slug: 'puff-puff-mix',
    category: 'confectionary',
    description: 'Ready-to-use puff puff mix for delicious African donuts',
    price: 449,
    currency: 'GBP',
    images: ['https://res.cloudinary.com/demo/image/upload/sample4.jpg'],
    preparationSteps: [],
    isFeatured: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Example 1: Basic Product Grid
 * Standard usage with a list of products
 */
export function BasicProductGrid() {
  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Our Products</h2>
      <ProductGrid products={sampleProducts} />
    </div>
  );
}

/**
 * Example 2: Loading State
 * Shows skeleton cards while products are being fetched
 */
export function LoadingProductGrid() {
  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Loading Products...</h2>
      <ProductGrid products={[]} isLoading={true} />
    </div>
  );
}

/**
 * Example 3: Empty State
 * Shows message when no products are available
 */
export function EmptyProductGrid() {
  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Products</h2>
      <ProductGrid products={[]} isLoading={false} />
    </div>
  );
}

/**
 * Example 4: Single Product
 * Grid with only one product
 */
export function SingleProductGrid() {
  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Featured Product</h2>
      <ProductGrid products={[sampleProducts[0]]} />
    </div>
  );
}

/**
 * Example 5: Category-Filtered Grid
 * Shows products from a specific category
 */
export function CategoryFilteredGrid() {
  const confectionaryProducts = sampleProducts.filter(
    (p) => p.category === 'confectionary'
  );

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Confectionary Products</h2>
      <ProductGrid products={confectionaryProducts} />
    </div>
  );
}

/**
 * Example 6: With Pagination
 * Demonstrates how to use ProductGrid with pagination
 */
export function PaginatedProductGrid() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const productsPerPage = 2;
  
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = sampleProducts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(sampleProducts.length / productsPerPage);

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Products (Page {currentPage})</h2>
      <ProductGrid products={currentProducts} />
      
      <div className="flex justify-center gap-2 mt-8">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/**
 * Example 7: Responsive Layout Demo
 * Shows how the grid adapts to different screen sizes
 */
export function ResponsiveGridDemo() {
  return (
    <div className="space-y-12 py-8">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold mb-4">Desktop View (4 columns)</h2>
        <p className="text-muted-foreground mb-6">
          On extra-large screens (1280px+), products display in 4 columns
        </p>
        <ProductGrid products={sampleProducts} />
      </div>

      <div className="container mx-auto max-w-5xl">
        <h2 className="text-2xl font-bold mb-4">Tablet View (3 columns)</h2>
        <p className="text-muted-foreground mb-6">
          On large screens (1024px+), products display in 3 columns
        </p>
        <ProductGrid products={sampleProducts} />
      </div>

      <div className="container mx-auto max-w-3xl">
        <h2 className="text-2xl font-bold mb-4">Small Tablet View (2 columns)</h2>
        <p className="text-muted-foreground mb-6">
          On small screens (640px+), products display in 2 columns
        </p>
        <ProductGrid products={sampleProducts} />
      </div>

      <div className="container mx-auto max-w-md">
        <h2 className="text-2xl font-bold mb-4">Mobile View (1 column)</h2>
        <p className="text-muted-foreground mb-6">
          On mobile screens, products display in 1 column
        </p>
        <ProductGrid products={sampleProducts} />
      </div>
    </div>
  );
}

/**
 * Example 8: Integration with Data Fetching
 * Shows how to use ProductGrid with async data fetching
 */
export function DataFetchingExample() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate API call
    const fetchProducts = async () => {
      setIsLoading(true);
      
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setProducts(sampleProducts);
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Products from API</h2>
      <ProductGrid products={products} isLoading={isLoading} />
    </div>
  );
}

// Default export for Storybook or documentation tools
export default {
  title: 'Components/Products/ProductGrid',
  component: ProductGrid,
  examples: {
    BasicProductGrid,
    LoadingProductGrid,
    EmptyProductGrid,
    SingleProductGrid,
    CategoryFilteredGrid,
    PaginatedProductGrid,
    ResponsiveGridDemo,
    DataFetchingExample,
  },
};
