/**
 * Zod validation schemas for API inputs
 * These schemas validate all incoming requests before processing
 */

import { z } from 'zod';

/**
 * Custom validators
 */

// Email validation using standard email regex
export const emailValidator = z
  .string()
  .email('Invalid email format')
  .min(1, 'Email is required');

// Phone validation - non-empty string
export const phoneValidator = z
  .string()
  .min(1, 'Phone number is required')
  .trim();

// Price validation - positive number
export const priceValidator = z
  .number()
  .positive('Price must be a positive number')
  .finite('Price must be a finite number');

/**
 * Product validation schemas
 */

// Category enum
const categorySchema = z.enum(['confectionary', 'fish', 'foodstuffs'], {
  errorMap: () => ({ message: 'Category must be one of: confectionary, fish, foodstuffs' }),
});

// Currency enum
const currencySchema = z.enum(['GBP', 'USD', 'EUR'], {
  errorMap: () => ({ message: 'Currency must be one of: GBP, USD, EUR' }),
});

// Preparation step schema
const preparationStepSchema = z.object({
  stepNumber: z.number().int().positive('Step number must be a positive integer'),
  title: z.string().min(1, 'Step title is required').trim(),
  description: z.string().min(1, 'Step description is required').trim(),
  imageUrl: z.string().url('Invalid image URL').optional(),
  duration: z.string().optional(),
});

// Nutrition info schema
const nutritionInfoSchema = z.object({
  servingSize: z.string().min(1, 'Serving size is required').trim(),
  calories: z.number().int().nonnegative('Calories must be a non-negative integer'),
  protein: z.string().min(1, 'Protein is required').trim(),
  carbs: z.string().min(1, 'Carbs is required').trim(),
  fat: z.string().min(1, 'Fat is required').trim(),
});

// Product create schema
export const productCreateSchema = z.object({
  name: z.string().min(1, 'Product name is required').trim(),
  category: categorySchema,
  description: z.string().min(1, 'Description is required').trim(),
  price: priceValidator,
  currency: currencySchema.default('GBP'),
  images: z.array(z.string().url('Invalid image URL')).default([]),
  preparationSteps: z.array(preparationStepSchema).default([]),
  nutritionInfo: nutritionInfoSchema.optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

// Product update schema - all fields optional
export const productUpdateSchema = z.object({
  name: z.string().min(1, 'Product name cannot be empty').trim().optional(),
  category: categorySchema.optional(),
  description: z.string().min(1, 'Description cannot be empty').trim().optional(),
  price: priceValidator.optional(),
  currency: currencySchema.optional(),
  images: z.array(z.string().url('Invalid image URL')).optional(),
  preparationSteps: z.array(preparationStepSchema).optional(),
  nutritionInfo: nutritionInfoSchema.optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

/**
 * Order validation schemas
 */

// Order status enum
const orderStatusSchema = z.enum(['new', 'contacted', 'completed', 'cancelled'], {
  errorMap: () => ({ message: 'Status must be one of: new, contacted, completed, cancelled' }),
});

// Shipping address schema
const shippingAddressSchema = z.object({
  street: z.string().min(1, 'Street is required').trim(),
  city: z.string().min(1, 'City is required').trim(),
  state: z.string().min(1, 'State is required').trim(),
  postalCode: z.string().min(1, 'Postal code is required').trim(),
  country: z.string().min(1, 'Country is required').trim(),
});

// Order item schema (for creation)
const orderItemCreateSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

// Order create schema
export const orderCreateSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required').trim(),
  customerEmail: emailValidator,
  customerPhone: phoneValidator,
  items: z
    .array(orderItemCreateSchema)
    .min(1, 'At least one item is required')
    .max(50, 'Maximum 50 items per order'),
  message: z.string().trim().optional(),
  shippingAddress: shippingAddressSchema.optional(),
});

// Order update schema
export const orderUpdateSchema = z.object({
  status: orderStatusSchema.optional(),
  message: z.string().trim().optional(),
});

/**
 * Media validation schemas
 */

// Media type enum
const mediaTypeSchema = z.enum(['hero', 'carousel', 'product', 'category'], {
  errorMap: () => ({ message: 'Media type must be one of: hero, carousel, product, category' }),
});

// Media upload schema
export const mediaUploadSchema = z.object({
  type: mediaTypeSchema,
  altText: z.string().min(1, 'Alt text is required for accessibility').trim(),
  file: z.any().refine(
    (file) => {
      if (!file) return false;
      // Check if it's a File object
      if (typeof File !== 'undefined' && file instanceof File) {
        return true;
      }
      // For server-side validation, check if it has required properties
      return file && typeof file === 'object';
    },
    { message: 'File is required' }
  ).refine(
    (file) => {
      if (typeof File !== 'undefined' && file instanceof File) {
        // File size validation: max 5MB
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        return file.size <= maxSize;
      }
      // For server-side, assume size is validated elsewhere
      return true;
    },
    { message: 'File size must be less than 5MB' }
  ).refine(
    (file) => {
      if (typeof File !== 'undefined' && file instanceof File) {
        // File type validation: only images
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        return validTypes.includes(file.type);
      }
      // For server-side, assume type is validated elsewhere
      return true;
    },
    { message: 'File must be an image (JPEG, PNG, WebP, or GIF)' }
  ),
});

/**
 * Content validation schemas
 */

// Content update schema
export const contentUpdateSchema = z.object({
  key: z.string().min(1, 'Content key is required').trim(),
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().trim().optional(),
  data: z.record(z.any()).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'Content data cannot be empty' }
  ),
});

/**
 * Query parameter validation schemas
 */

// Pagination params
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// Product filter params
export const productFilterSchema = paginationSchema.extend({
  category: categorySchema.optional(),
  featured: z.coerce.boolean().optional(),
  active: z.coerce.boolean().optional(),
  search: z.string().trim().optional(),
});

// Order filter params
export const orderFilterSchema = z.object({
  page: z.string().nullable().optional().transform(val => val ? parseInt(val, 10) : 1).pipe(z.number().int().positive().default(1)),
  limit: z.string().nullable().optional().transform(val => val ? parseInt(val, 10) : 20).pipe(z.number().int().positive().max(100).default(20)),
  status: z.string().nullable().optional().transform(val => val || undefined).pipe(orderStatusSchema.optional()),
  customerEmail: z.string().nullable().optional().transform(val => val || undefined).pipe(emailValidator.optional()),
  startDate: z.string().nullable().optional().transform(val => val || undefined).pipe(z.string().datetime().optional()),
  endDate: z.string().nullable().optional().transform(val => val || undefined).pipe(z.string().datetime().optional()),
});

// Media filter params
export const mediaFilterSchema = paginationSchema.extend({
  type: mediaTypeSchema.optional(),
});

/**
 * Type exports for use in API routes
 */
export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
export type OrderUpdateInput = z.infer<typeof orderUpdateSchema>;
export type MediaUploadInput = z.infer<typeof mediaUploadSchema>;
export type ContentUpdateInput = z.infer<typeof contentUpdateSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;
export type ProductFilterParams = z.infer<typeof productFilterSchema>;
export type OrderFilterParams = z.infer<typeof orderFilterSchema>;
export type MediaFilterParams = z.infer<typeof mediaFilterSchema>;
