/**
 * Products API Route
 * 
 * GET /api/products - List products with pagination and filters (public)
 * POST /api/products - Create new product (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getProducts, createProduct } from '@/lib/services/product.service';
import { productCreateSchema, productFilterSchema } from '@/lib/utils/validation';
import { ValidationError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';
import { PaginatedResponse, ApiResponse, FieldError } from '@/types/api.types';

/**
 * GET /api/products
 * Returns paginated products with optional filters
 * Public endpoint - no authentication required
 */
export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      category: searchParams.get('category'),
      featured: searchParams.get('featured'),
      active: searchParams.get('active'),
      search: searchParams.get('search'),
    };

    // Validate query parameters
    const validatedParams = productFilterSchema.parse(queryParams);

    logger.info('GET /api/products', { params: validatedParams });

    // Fetch products from service
    const result = await getProducts(validatedParams);

    // Format paginated response
    const response: PaginatedResponse = {
      success: true,
      data: result.products,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPrevPage: result.page > 1,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    logger.error('GET /api/products failed', { error });

    // Handle validation errors
    if (error instanceof z.ZodError) {
      const fieldErrors: FieldError[] = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        value: err.path.length > 0 ? undefined : err.message,
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
          message: 'Failed to fetch products',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Create a new product
 * Admin only - requires Basic Auth
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { 
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="Admin Area"'
          }
        }
      );
    }

    // Validate Basic Auth credentials
    try {
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const [username, password] = credentials.split(':');

      const validUsername = process.env.ADMIN_USERNAME;
      const validPassword = process.env.ADMIN_PASSWORD;

      if (username !== validUsername || password !== validPassword) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Invalid credentials',
            },
          },
          { status: 401 }
        );
      }
    } catch (authError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid authentication format',
          },
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    logger.info('POST /api/products', { body });

    // Validate input with Zod
    const validatedData = productCreateSchema.parse(body);

    // Create product
    const product = await createProduct(validatedData);

    // Return success response
    const response: ApiResponse = {
      success: true,
      data: product,
      message: 'Product created successfully',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    logger.error('POST /api/products failed', { error });

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
            message: 'Invalid product data',
            fields: fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    // Handle custom validation errors
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
            details: error.errors,
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
          message: 'Failed to create product',
        },
      },
      { status: 500 }
    );
  }
}
