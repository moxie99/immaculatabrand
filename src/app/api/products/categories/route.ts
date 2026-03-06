/**
 * Product Categories API Route
 * 
 * GET /api/products/categories - Get all categories with product counts (public)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProductCategories } from '@/lib/services/product.service';
import { logger } from '@/lib/utils/logger';
import { ApiResponse } from '@/types/api.types';

/**
 * GET /api/products/categories
 * Returns list of all categories with product counts
 * Public endpoint - no authentication required
 */
export async function GET(_request: NextRequest) {
  try {
    logger.info('GET /api/products/categories');

    // Fetch categories with counts
    const categories = await getProductCategories();

    // Return success response
    const response: ApiResponse = {
      success: true,
      data: categories,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    logger.error('GET /api/products/categories failed', { error });

    // Handle errors
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch product categories',
        },
      },
      { status: 500 }
    );
  }
}
