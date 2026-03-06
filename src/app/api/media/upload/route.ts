/**
 * Media Upload API Route
 * 
 * POST /api/media/upload - Upload image to Cloudinary (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/services/media.service';
import { AppError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';
import { ApiResponse } from '@/types/api.types';
import { MediaType } from '@/lib/db/models/Media';

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
 * POST /api/media/upload
 * Upload image to Cloudinary and create media record
 * Admin only - requires Basic Auth
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authError = checkAdminAuth(request);
    if (authError) return authError;

    logger.info('POST /api/media/upload');

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as MediaType | null;
    const altText = formData.get('altText') as string | null;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'File is required',
          },
        },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Media type is required',
          },
        },
        { status: 400 }
      );
    }

    // Validate media type
    const validTypes: MediaType[] = ['hero', 'carousel', 'product', 'category'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Media type must be one of: hero, carousel, product, category',
          },
        },
        { status: 400 }
      );
    }

    if (!altText) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Alt text is required for accessibility',
          },
        },
        { status: 400 }
      );
    }

    // Upload image
    const media = await uploadImage(file, type, altText);

    // Return success response
    const response: ApiResponse = {
      success: true,
      data: media,
      message: 'Image uploaded successfully',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    logger.error('POST /api/media/upload failed', { error });

    // Handle custom app errors
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UPLOAD_ERROR',
            message: error.message,
          },
        },
        { status: error.statusCode }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to upload image',
        },
      },
      { status: 500 }
    );
  }
}
