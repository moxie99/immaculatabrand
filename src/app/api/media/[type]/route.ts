/**
 * Media List API Route
 * 
 * GET /api/media/[type] - Fetch all media by type
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMediaByType, getAllMedia } from '@/lib/services/media.service';
import { AppError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';
import { ApiResponse } from '@/types/api.types';
import { MediaType } from '@/lib/db/models/Media';

/**
 * GET /api/media/[type]
 * Returns all media by type
 * Public endpoint for display, admin for management
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const { type } = params;

    logger.info('GET /api/media/[type]', { type });

    // Special case: 'all' returns all media
    if (type === 'all') {
      const media = await getAllMedia();

      const response: ApiResponse = {
        success: true,
        data: media,
      };

      return NextResponse.json(response, { status: 200 });
    }

    // Validate media type
    const validTypes: MediaType[] = ['hero', 'carousel', 'product', 'category'];
    if (!validTypes.includes(type as MediaType)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Media type must be one of: hero, carousel, product, category, all',
          },
        },
        { status: 400 }
      );
    }

    // Parse optional limit query parameter
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    // Fetch media by type
    const media = await getMediaByType(type as MediaType, limit);

    // Return success response
    const response: ApiResponse = {
      success: true,
      data: media,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    logger.error('GET /api/media/[type] failed', { error, type: params.type });

    // Handle custom app errors
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FETCH_ERROR',
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
          message: 'Failed to fetch media',
        },
      },
      { status: 500 }
    );
  }
}
