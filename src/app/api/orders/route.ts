/**
 * Orders API Route
 * 
 * GET /api/orders - List orders with pagination and filters (admin only)
 * POST /api/orders - Create new order/inquiry (public endpoint)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAllOrders, createOrder } from '@/lib/services/order.service';
import { orderCreateSchema, orderFilterSchema } from '@/lib/utils/validation';
import { ValidationError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';
import { PaginatedResponse, ApiResponse, FieldError } from '@/types/api.types';

/**
 * Helper function to check admin authentication
 */
function checkAdminAuth(request: NextRequest): NextResponse | null {
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

  return null; // Auth successful
}

/**
 * GET /api/orders
 * Returns paginated orders with optional filters
 * Admin only - requires Basic Auth
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authError = checkAdminAuth(request);
    if (authError) return authError;

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
      customerEmail: searchParams.get('customerEmail'),
    };

    // Validate query parameters
    const validatedParams = orderFilterSchema.parse(queryParams);

    logger.info('GET /api/orders', { params: validatedParams });

    // Fetch orders from service
    const result = await getAllOrders(validatedParams);

    // Format paginated response
    const response: PaginatedResponse = {
      success: true,
      data: result.orders,
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
    logger.error('GET /api/orders failed', { error });

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
          message: 'Failed to fetch orders',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Create a new order/inquiry
 * Public endpoint - no authentication required
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    logger.info('POST /api/orders', { body });

    // Validate input with Zod
    const validatedData = orderCreateSchema.parse(body);

    // Create order
    const order = await createOrder(validatedData);

    // Return success response with order number
    const response: ApiResponse = {
      success: true,
      data: {
        order,
        orderNumber: order.orderNumber,
      },
      message: 'Order created successfully',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    logger.error('POST /api/orders failed', { error });

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
            message: 'Invalid order data',
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
          message: 'Failed to create order',
        },
      },
      { status: 500 }
    );
  }
}
