import cloudinary from '@/config/cloudinary';
import Media, { IMedia, MediaType } from '@/lib/db/models/Media';
import { AppError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';

/**
 * Maximum file size for image uploads (5MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

/**
 * Allowed image MIME types
 */
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

/**
 * Validate file before upload
 */
function validateFile(file: File): void {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new AppError(
      `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      400
    );
  }

  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new AppError(
      `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
      400
    );
  }
}

/**
 * Upload image to Cloudinary and save media record
 * @param file - The image file to upload
 * @param type - The media type (hero, carousel, product, category)
 * @param altText - Alt text for accessibility
 * @returns The created media record
 */
export async function uploadImage(
  file: File,
  type: MediaType,
  altText: string
): Promise<IMedia> {
  try {
    // Validate file
    validateFile(file);

    // Convert file to base64 data URI
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary with transformations
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: `confectionary/${type}`,
      transformation: [
        { width: 1200, height: 800, crop: 'limit' }, // Max dimensions
        { quality: 'auto', fetch_format: 'auto' }, // Auto quality and format
      ],
      resource_type: 'image',
    });

    logger.info('Image uploaded to Cloudinary', {
      cloudinaryId: result.public_id,
      type,
    });

    // Create media record in database
    const media = await Media.create({
      cloudinaryId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      type,
      altText,
      width: result.width,
      height: result.height,
      format: result.format,
    });

    logger.info('Media record created', { mediaId: media._id });

    return media;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logger.error('Failed to upload image', { error });
    throw new AppError('Failed to upload image', 500);
  }
}

/**
 * Delete image from Cloudinary and remove media record
 * @param cloudinaryId - The Cloudinary public ID
 * @returns True if deletion was successful
 */
export async function deleteImage(cloudinaryId: string): Promise<boolean> {
  try {
    // Find media record
    const media = await Media.findByCloudinaryId(cloudinaryId);

    if (!media) {
      throw new AppError('Media not found', 404);
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(cloudinaryId);

    logger.info('Image deleted from Cloudinary', { cloudinaryId });

    // Delete media record from database
    await Media.deleteOne({ cloudinaryId });

    logger.info('Media record deleted', { cloudinaryId });

    return true;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logger.error('Failed to delete image', { error, cloudinaryId });
    throw new AppError('Failed to delete image', 500);
  }
}

/**
 * Get all media by type
 * @param type - The media type to filter by
 * @param limit - Optional limit on number of results
 * @returns Array of media records
 */
export async function getMediaByType(
  type: MediaType,
  limit?: number
): Promise<IMedia[]> {
  try {
    const media = await Media.getByType(type, limit);

    logger.info('Fetched media by type', { type, count: media.length });

    return media;
  } catch (error) {
    logger.error('Failed to fetch media by type', { error, type });
    throw new AppError('Failed to fetch media', 500);
  }
}

/**
 * Get all media (for admin gallery)
 * @returns Array of all media records
 */
export async function getAllMedia(): Promise<IMedia[]> {
  try {
    const media = await Media.find().sort({ createdAt: -1 });

    logger.info('Fetched all media', { count: media.length });

    return media;
  } catch (error) {
    logger.error('Failed to fetch all media', { error });
    throw new AppError('Failed to fetch media', 500);
  }
}

/**
 * Get media by Cloudinary ID
 * @param cloudinaryId - The Cloudinary public ID
 * @returns The media record or null if not found
 */
export async function getMediaByCloudinaryId(
  cloudinaryId: string
): Promise<IMedia | null> {
  try {
    const media = await Media.findByCloudinaryId(cloudinaryId);

    if (!media) {
      logger.warn('Media not found', { cloudinaryId });
      return null;
    }

    return media;
  } catch (error) {
    logger.error('Failed to fetch media by Cloudinary ID', {
      error,
      cloudinaryId,
    });
    throw new AppError('Failed to fetch media', 500);
  }
}
