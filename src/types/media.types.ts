/**
 * Media type definitions
 * These types align with the Media Mongoose schema
 */

/**
 * Media type enum
 * Defines the purpose/location of the image
 */
export type MediaType = 'hero' | 'carousel' | 'product' | 'category';

/**
 * Media interface
 * Represents an image stored in Cloudinary
 */
export interface Media {
  _id: string;
  cloudinaryId: string;
  url: string;
  secureUrl: string;
  type: MediaType;
  altText: string;
  width: number;
  height: number;
  format: string;
  createdAt: Date;
}

/**
 * Media upload input
 */
export interface MediaUploadInput {
  type: MediaType;
  altText: string;
}

/**
 * Media upload result (returned from Cloudinary)
 */
export interface MediaUploadResult {
  cloudinaryId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
}
