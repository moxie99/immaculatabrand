/**
 * Media Delete API Route
 * 
 * DELETE /api/media/delete/[id] - Delete media by Cloudinary ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { deleteImage } from '@/lib/services/media.service';
import { AppError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';
import { ApiResponse } from '@/types/api.types';

/**
 * DELETE /api/media/delete/[id]
 * Deletes media by Cloudinary ID
 * Admin only endpoint
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    logger.info('DELETE /api/media/delete/[id]', { cloudinaryId: id });

    // Delete media
    await deleteImage(id);

    // Return success response
    const response: ApiResponse = {
      success: true,
      data: { message: 'Media deleted successfully' },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    logger.error('DELETE /api/media/delete/[id] failed', { error, id: params.id });

    // Handle custom app errors
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.statusCode === 404 ? 'NOT_FOUND' : 'DELETE_ERROR',
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
          message: 'Failed to delete media',
        },
      },
      { status: 500 }
    );
  }
}
