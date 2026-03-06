/**
 * Featured Products API Route
 * 
 * GET /api/products/featured - Get featured products (public)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getFeaturedProducts } from '@/lib/services/product.service';
import { logger } from '@/lib/utils/logger';
import { ApiResponse, FieldError } from '@/types/api.types';

/**
 * Query parameter schema for featured products
 */
const featuredQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).default(12),
});

/**
 * GET /api/products/featured
 * Returns featured products (isFeatured=true, isActive=true, limit 12 by default)
 * Public endpoint - no authentication required
 */
export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      limit: searchParams.get('limit'),
    };

    // Validate query parameters
    const { limit } = featuredQuerySchema.parse(queryParams);

    logger.info('GET /api/products/featured', { limit });

    // Fetch featured products
    const products = await getFeaturedProducts(limit);

    // Return success response
    const response: ApiResponse = {
      success: true,
      data: products,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    logger.error('GET /api/products/featured failed', { error });

    // Handle validation errors
    if (error instanceof z.ZodError) {
      const fieldErrors: FieldError[] = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            fields: fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch featured products',
        },
      },
      { status: 500 }
    );
  }
}
