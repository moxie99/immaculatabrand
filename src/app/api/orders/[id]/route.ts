/**
 * Single Order API Route
 * 
 * GET /api/orders/[id] - Get order by ID (admin only)
 * PUT /api/orders/[id] - Update order status (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  getOrderById, 
  updateOrderStatus 
} from '@/lib/services/order.service';
import { orderUpdateSchema } from '@/lib/utils/validation';
import { ValidationError, NotFoundError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';
import { ApiResponse, FieldError } from '@/types/api.types';

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
 * GET /api/orders/[id]
 * Returns order by ID with full details
 * Admin only - requires Basic Auth
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const authError = checkAdminAuth(request);
    if (authError) return authError;

    const { id } = params;

    logger.info('GET /api/orders/[id]', { id });

    // Fetch order by ID
    const order = await getOrderById(id);

    // Return success response
    const response: ApiResponse = {
      success: true,
      data: order,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    logger.error('GET /api/orders/[id] failed', { error, id: params.id });

    // Handle not found errors
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message,
          },
        },
        { status: 404 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch order',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/orders/[id]
 * Update order status by ID
 * Admin only - requires Basic Auth
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const authError = checkAdminAuth(request);
    if (authError) return authError;

    const { id } = params;

    // Parse request body
    const body = await request.json();

    logger.info('PUT /api/orders/[id]', { id, body });

    // Validate input with Zod
    const validatedData = orderUpdateSchema.parse(body);

    // Update order
    const order = await updateOrderStatus(id, validatedData);

    // Return success response
    const response: ApiResponse = {
      success: true,
      data: order,
      message: 'Order updated successfully',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    logger.error('PUT /api/orders/[id] failed', { error, id: params.id });

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

    // Handle not found errors
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message,
          },
        },
        { status: 404 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update order',
        },
      },
      { status: 500 }
    );
  }
}
