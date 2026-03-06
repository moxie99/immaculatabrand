/**
 * Product Service Layer
 * Handles all product-related business logic and database operations
 */

import Product, { IProduct } from '../db/models/Product';
import connectDB from '../db/mongodb';
import { ProductCreateInput, ProductUpdateInput } from '../../types/product.types';
import { NotFoundError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Product filter options for querying
 */
export interface ProductFilterOptions {
  category?: 'confectionary' | 'fish' | 'foodstuffs';
  featured?: boolean;
  active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Paginated product response
 */
export interface PaginatedProductResponse {
  products: IProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Create a new product with automatic slug generation
 * @param input - Product creation data
 * @returns Created product document
 * @throws ValidationError if product data is invalid
 */
export async function createProduct(input: ProductCreateInput): Promise<IProduct> {
  try {
    await connectDB();
    
    logger.info('Creating new product', { name: input.name, category: input.category });
    
    // Generate unique slug from product name
    const slug = await Product.generateUniqueSlug(input.name);
    
    // Create product with generated slug
    const product = new Product({
      ...input,
      slug,
    });
    
    await product.save();
    
    logger.info('Product created successfully', { 
      id: product._id, 
      slug: product.slug,
      name: product.name 
    });
    
    return product;
  } catch (error) {
    logger.error('Failed to create product', { error, input });
    
    if (error instanceof Error && error.name === 'ValidationError') {
      throw new ValidationError('Product validation failed', { general: [error.message] });
    }
    
    throw error;
  }
}

/**
 * Update an existing product with validation
 * @param id - Product ID
 * @param input - Product update data
 * @returns Updated product document
 * @throws NotFoundError if product doesn't exist
 * @throws ValidationError if update data is invalid
 */
export async function updateProduct(
  id: string,
  input: ProductUpdateInput
): Promise<IProduct> {
  try {
    await connectDB();
    
    logger.info('Updating product', { id, updates: Object.keys(input) });
    
    // Find product first to ensure it exists
    const product = await Product.findById(id);
    
    if (!product) {
      throw new NotFoundError(`Product with id '${id}' not found`);
    }
    
    // If name is being updated, regenerate slug
    if (input.name && input.name !== product.name) {
      const newSlug = await Product.generateUniqueSlug(input.name, id);
      Object.assign(product, { ...input, slug: newSlug });
    } else {
      Object.assign(product, input);
    }
    
    await product.save();
    
    logger.info('Product updated successfully', { id, slug: product.slug });
    
    return product;
  } catch (error) {
    logger.error('Failed to update product', { error, id, input });
    
    if (error instanceof NotFoundError) {
      throw error;
    }
    
    if (error instanceof Error && error.name === 'ValidationError') {
      throw new ValidationError('Product validation failed', { general: [error.message] });
    }
    
    throw error;
  }
}

/**
 * Delete a product (soft delete by setting isActive=false)
 * @param id - Product ID
 * @returns Updated product document with isActive=false
 * @throws NotFoundError if product doesn't exist
 */
export async function deleteProduct(id: string): Promise<IProduct> {
  try {
    await connectDB();
    
    logger.info('Soft deleting product', { id });
    
    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true, runValidators: true }
    );
    
    if (!product) {
      throw new NotFoundError(`Product with id '${id}' not found`);
    }
    
    logger.info('Product soft deleted successfully', { id, slug: product.slug });
    
    return product;
  } catch (error) {
    logger.error('Failed to delete product', { error, id });
    
    if (error instanceof NotFoundError) {
      throw error;
    }
    
    throw error;
  }
}

/**
 * Get products with pagination and filtering
 * @param options - Filter and pagination options
 * @returns Paginated product list
 */
export async function getProducts(
  options: ProductFilterOptions = {}
): Promise<PaginatedProductResponse> {
  try {
    await connectDB();
    
    const {
      category,
      featured,
      active,
      search,
      page = 1,
      limit = 20,
    } = options;
    
    logger.info('Fetching products', { options });
    
    // Build query filter
    const filter: any = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (featured !== undefined) {
      filter.isFeatured = featured;
    }
    
    if (active !== undefined) {
      filter.isActive = active;
    }
    
    // Text search on product name
    if (search) {
      filter.$text = { $search: search };
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query with pagination
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    logger.info('Products fetched successfully', { 
      count: products.length, 
      total, 
      page, 
      totalPages 
    });
    
    return {
      products: products as unknown as IProduct[],
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    logger.error('Failed to fetch products', { error, options });
    throw error;
  }
}

/**
 * Get a single product by slug for detail pages
 * @param slug - Product slug
 * @returns Product document
 * @throws NotFoundError if product doesn't exist
 */
export async function getProductBySlug(slug: string): Promise<IProduct> {
  try {
    await connectDB();
    
    logger.info('Fetching product by slug', { slug });
    
    const product = await Product.findOne({ slug }).lean();
    
    if (!product) {
      throw new NotFoundError(`Product with slug '${slug}' not found`);
    }
    
    logger.info('Product fetched successfully', { slug, id: product._id });
    
    return product as unknown as IProduct;
  } catch (error) {
    logger.error('Failed to fetch product by slug', { error, slug });
    
    if (error instanceof NotFoundError) {
      throw error;
    }
    
    throw error;
  }
}

/**
 * Get a single product by ID
 * @param id - Product ID
 * @returns Product document
 * @throws NotFoundError if product doesn't exist
 */
export async function getProductById(id: string): Promise<IProduct> {
  try {
    await connectDB();
    
    logger.info('Fetching product by ID', { id });
    
    const product = await Product.findById(id).lean();
    
    if (!product) {
      throw new NotFoundError(`Product with id '${id}' not found`);
    }
    
    logger.info('Product fetched successfully', { id, slug: product.slug });
    
    return product as unknown as IProduct;
  } catch (error) {
    logger.error('Failed to fetch product by ID', { error, id });
    
    if (error instanceof NotFoundError) {
      throw error;
    }
    
    throw error;
  }
}

/**
 * Search products using MongoDB text search
 * @param searchTerm - Search query string
 * @param options - Additional filter and pagination options
 * @returns Paginated search results sorted by relevance
 */
export async function searchProducts(
  searchTerm: string,
  options: Omit<ProductFilterOptions, 'search'> = {}
): Promise<PaginatedProductResponse> {
  try {
    await connectDB();
    
    logger.info('Searching products', { searchTerm, options });
    
    // Use getProducts with search parameter
    return await getProducts({
      ...options,
      search: searchTerm,
    });
  } catch (error) {
    logger.error('Failed to search products', { error, searchTerm, options });
    throw error;
  }
}

/**
 * Get featured products for homepage display
 * @param limit - Maximum number of products to return (default: 12)
 * @returns Array of featured and active products
 */
export async function getFeaturedProducts(limit: number = 12): Promise<IProduct[]> {
  try {
    await connectDB();
    
    logger.info('Fetching featured products', { limit });
    
    const products = await Product.find({
      isFeatured: true,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    logger.info('Featured products fetched successfully', { count: products.length });
    
    return products as unknown as IProduct[];
  } catch (error) {
    logger.error('Failed to fetch featured products', { error, limit });
    throw error;
  }
}

/**
 * Get product categories with product counts
 * @returns Array of categories with their product counts
 */
export async function getProductCategories(): Promise<
  Array<{ category: string; count: number }>
> {
  try {
    await connectDB();
    
    logger.info('Fetching product categories');
    
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { category: '$_id', count: 1, _id: 0 } },
      { $sort: { category: 1 } },
    ]);
    
    logger.info('Product categories fetched successfully', { count: categories.length });
    
    return categories;
  } catch (error) {
    logger.error('Failed to fetch product categories', { error });
    throw error;
  }
}
