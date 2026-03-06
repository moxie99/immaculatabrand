/**
 * Example usage of useProducts hook
 * 
 * This file demonstrates how to use the useProducts hook in React components.
 */

import React from 'react';
import { useProducts } from './useProducts';
import { Category } from '@/types/product.types';

/**
 * Example 1: Basic usage - fetch all products
 */
export function ProductListBasic() {
  const { products, isLoading, isError, error } = useProducts();

  if (isLoading) {
    return <div>Loading products...</div>;
  }

  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  return (
    <div>
      <h2>All Products</h2>
      <ul>
        {products.map((product) => (
          <li key={product._id}>
            {product.name} - £{(product.price / 100).toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Example 2: With pagination controls
 */
export function ProductListWithPagination() {
  const {
    products,
    isLoading,
    page,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
  } = useProducts({
    pagination: { page: 1, limit: 12 },
  });

  return (
    <div>
      <h2>Products (Page {page} of {totalPages})</h2>
      
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product._id} className="border p-4">
              <img src={product.images[0]} alt={product.name} />
              <h3>{product.name}</h3>
              <p>£{(product.price / 100).toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <button
          onClick={prevPage}
          disabled={!hasPrevPage}
          className="px-4 py-2 bg-blue-500 text-white disabled:bg-gray-300"
        >
          Previous
        </button>
        <button
          onClick={nextPage}
          disabled={!hasNextPage}
          className="px-4 py-2 bg-blue-500 text-white disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/**
 * Example 3: With category filtering
 */
export function ProductListWithFilters() {
  const {
    products,
    isLoading,
    setCategory,
    setFeatured,
    setSearch,
  } = useProducts({
    filters: { category: 'confectionary' },
    pagination: { page: 1, limit: 12 },
  });

  const categories: Category[] = ['confectionary', 'fish', 'foodstuffs'];

  return (
    <div>
      <h2>Filtered Products</h2>

      {/* Category Filter */}
      <div className="mb-4">
        <label>Category: </label>
        <select onChange={(e) => setCategory(e.target.value as Category || undefined)}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Featured Filter */}
      <div className="mb-4">
        <label>
          <input
            type="checkbox"
            onChange={(e) => setFeatured(e.target.checked || undefined)}
          />
          {' '}Featured Only
        </label>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search products..."
          onChange={(e) => setSearch(e.target.value || undefined)}
          className="border px-3 py-2"
        />
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product._id} className="border p-4">
              <h3>{product.name}</h3>
              <p>{product.category}</p>
              <p>£{(product.price / 100).toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Example 4: Featured products only (for homepage)
 */
export function FeaturedProductsSection() {
  const { products, isLoading } = useProducts({
    filters: { featured: true },
    pagination: { limit: 12 },
    // Revalidate on focus and reconnect for fresh data
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  if (isLoading) {
    return <div>Loading featured products...</div>;
  }

  return (
    <section>
      <h2>Featured Products</h2>
      <div className="grid grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product._id} className="border p-4">
            <img src={product.images[0]} alt={product.name} />
            <h3>{product.name}</h3>
            <p>£{(product.price / 100).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Example 5: With manual revalidation
 */
export function ProductListWithRefresh() {
  const { products, isLoading, mutate } = useProducts();

  const handleRefresh = () => {
    // Manually trigger a revalidation
    mutate();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Products</h2>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 text-white"
        >
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product._id}>{product.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Example 6: Auto-refresh every 30 seconds
 */
export function ProductListAutoRefresh() {
  const { products, isLoading } = useProducts({
    // Refresh data every 30 seconds
    refreshInterval: 30000,
  });

  return (
    <div>
      <h2>Products (Auto-refreshing)</h2>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product._id}>{product.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
