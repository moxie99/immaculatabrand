import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Media type enum
 */
export type MediaType = 'hero' | 'carousel' | 'product' | 'category';

/**
 * Media document interface
 * Represents an image stored in Cloudinary
 */
export interface IMedia extends Document {
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
 * Media model interface with static methods
 */
export interface IMediaModel extends Model<IMedia> {
  findByCloudinaryId(cloudinaryId: string): Promise<IMedia | null>;
  findByType(type: MediaType): Promise<IMedia[]>;
  getByType(type: MediaType, limit?: number): Promise<IMedia[]>;
  deleteByCloudinaryId(cloudinaryId: string): Promise<boolean>;
}

/**
 * Media schema definition
 */
const MediaSchema = new Schema<IMedia>(
  {
    cloudinaryId: {
      type: String,
      required: [true, 'Cloudinary ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
      validate: {
        validator: function (url: string) {
          return url.startsWith('http://') || url.startsWith('https://');
        },
        message: 'URL must be a valid HTTP or HTTPS URL',
      },
    },
    secureUrl: {
      type: String,
      required: [true, 'Secure URL is required'],
      trim: true,
      validate: {
        validator: function (url: string) {
          return url.startsWith('https://');
        },
        message: 'Secure URL must use HTTPS protocol',
      },
    },
    type: {
      type: String,
      required: [true, 'Media type is required'],
      enum: {
        values: ['hero', 'carousel', 'product', 'category'],
        message: '{VALUE} is not a valid media type',
      },
      index: true,
    },
    altText: {
      type: String,
      required: [true, 'Alt text is required for accessibility'],
      trim: true,
      maxlength: [500, 'Alt text cannot exceed 500 characters'],
    },
    width: {
      type: Number,
      required: [true, 'Width is required'],
      min: [1, 'Width must be a positive number'],
    },
    height: {
      type: Number,
      required: [true, 'Height is required'],
      min: [1, 'Height must be a positive number'],
    },
    format: {
      type: String,
      required: [true, 'Format is required'],
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only track creation time
    collection: 'media',
  }
);

/**
 * Index on createdAt for sorting recent uploads (descending)
 */
MediaSchema.index({ createdAt: -1 });

/**
 * Compound index for filtering by type and sorting by date
 */
MediaSchema.index({ type: 1, createdAt: -1 });

/**
 * Instance method to check if media is a hero image
 */
MediaSchema.methods.isHeroImage = function (): boolean {
  return this.type === 'hero';
};

/**
 * Instance method to check if media is a carousel image
 */
MediaSchema.methods.isCarouselImage = function (): boolean {
  return this.type === 'carousel';
};

/**
 * Instance method to check if media is a product image
 */
MediaSchema.methods.isProductImage = function (): boolean {
  return this.type === 'product';
};

/**
 * Instance method to check if media is a category image
 */
MediaSchema.methods.isCategoryImage = function (): boolean {
  return this.type === 'category';
};

/**
 * Static method to get media by type
 */
MediaSchema.statics.getByType = async function (
  type: MediaType,
  limit?: number
): Promise<IMedia[]> {
  const query = this.find({ type }).sort({ createdAt: -1 });
  
  if (limit) {
    query.limit(limit);
  }
  
  return query.exec();
};

/**
 * Static method to find by Cloudinary ID
 */
MediaSchema.statics.findByCloudinaryId = async function (
  cloudinaryId: string
): Promise<IMedia | null> {
  return this.findOne({ cloudinaryId });
};

// Prevent model recompilation in development (Next.js hot reload)
const Media: IMediaModel =
  (mongoose.models.Media as IMediaModel) || mongoose.model<IMedia, IMediaModel>('Media', MediaSchema);

export default Media;
