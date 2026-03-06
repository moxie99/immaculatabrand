/**
 * Content API Route
 * 
 * GET /api/content - Fetch site content by key (query parameter)
 * PUT /api/content - Update site content (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getContentByKey, updateContent } from '@/lib/services/content.service';
import { contentUpdateSchema } from '@/lib/utils/validation';
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
 * GET /api/content
 * Fetch site content by key (query parameter)
 * Public endpoint - no authentication required
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameter
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Content key is required',
          },
        },
        { status: 400 }
      );
    }

    logger.info('GET /api/content', { key });

    // Fetch content by key
    const content = await getContentByKey(key);

    // Return success response
    const response: ApiResponse = {
      success: true,
      data: content,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    logger.error('GET /api/content failed', { error });

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
          message: 'Failed to fetch content',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/content
 * Update site content
 * Admin only - requires Basic Auth
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const authError = checkAdminAuth(request);
    if (authError) return authError;

    // Parse request body
    const body = await request.json();

    logger.info('PUT /api/content', { body });

    // Validate input with Zod
    const validatedData = contentUpdateSchema.parse(body);

    // Update content
    const content = await updateContent(validatedData);

    // Return success response
    const response: ApiResponse = {
      success: true,
      data: content,
      message: 'Content updated successfully',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    logger.error('PUT /api/content failed', { error });

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
            message: 'Invalid content data',
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
          message: 'Failed to update content',
        },
      },
      { status: 500 }
    );
  }
}
