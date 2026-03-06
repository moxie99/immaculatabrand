import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Product document interface
 * Represents a food product (confectionary, fish, or foodstuff)
 */
export interface IProduct extends Document {
  name: string;
  slug: string;
  category: 'confectionary' | 'fish' | 'foodstuffs';
  description: string;
  price: number;
  currency: string;
  images: string[];
  preparationSteps: {
    stepNumber: number;
    title: string;
    description: string;
    imageUrl?: string;
    duration?: string;
  }[];
  nutritionInfo?: {
    servingSize: string;
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Product model interface with static methods
 */
export interface IProductModel extends Model<IProduct> {
  generateUniqueSlug(name: string, excludeId?: string): Promise<string>;
  findBySlug(slug: string): Promise<IProduct | null>;
  findActiveProducts(filters?: any): Promise<IProduct[]>;
  findFeaturedProducts(limit?: number): Promise<IProduct[]>;
}

/**
 * Product schema definition
 */
const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: {
        values: ['confectionary', 'fish', 'foodstuffs'],
        message: '{VALUE} is not a valid category',
      },
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be a positive number'],
      validate: {
        validator: function (value: number) {
          return value > 0;
        },
        message: 'Price must be greater than zero',
      },
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      enum: ['GBP', 'USD', 'EUR'],
      default: 'GBP',
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (images: string[]) {
          return images.every((url) => url.startsWith('https://'));
        },
        message: 'All image URLs must use HTTPS protocol',
      },
    },
    preparationSteps: [
      {
        stepNumber: {
          type: Number,
          required: true,
        },
        title: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          required: true,
          trim: true,
        },
        imageUrl: {
          type: String,
          trim: true,
        },
        duration: {
          type: String,
          trim: true,
        },
      },
    ],
    nutritionInfo: {
      servingSize: {
        type: String,
        trim: true,
      },
      calories: {
        type: Number,
        min: 0,
      },
      protein: {
        type: String,
        trim: true,
      },
      carbs: {
        type: String,
        trim: true,
      },
      fat: {
        type: String,
        trim: true,
      },
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'products',
  }
);

/**
 * Compound index for homepage featured products query
 * Optimizes queries that filter by both isFeatured and isActive
 */
ProductSchema.index({ isFeatured: 1, isActive: 1 });

/**
 * Text index on name for search functionality
 * Enables full-text search on product names
 */
ProductSchema.index({ name: 'text' });

/**
 * Pre-save middleware to auto-generate slug from product name
 * Only generates slug if it's not already set or if name has changed
 */
ProductSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.isModified('slug')) {
    this.slug = generateSlug(this.name);
  }
  next();
});

/**
 * Helper function to generate URL-friendly slug from product name
 * Converts to lowercase, replaces spaces with hyphens, removes special characters
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Static method to generate unique slug
 * Appends number suffix if slug already exists
 */
ProductSchema.statics.generateUniqueSlug = async function (
  name: string,
  excludeId?: string
): Promise<string> {
  let slug = generateSlug(name);
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    const query: any = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existingProduct = await this.findOne(query);

    if (!existingProduct) {
      isUnique = true;
    } else {
      slug = `${generateSlug(name)}-${counter}`;
      counter++;
    }
  }

  return slug;
};

/**
 * Instance method to check if product is visible to public
 */
ProductSchema.methods.isVisibleToPublic = function (): boolean {
  return this.isActive === true;
};

/**
 * Instance method to check if product should appear on homepage
 */
ProductSchema.methods.shouldShowOnHomepage = function (): boolean {
  return this.isFeatured === true && this.isActive === true;
};

// Prevent model recompilation in development (Next.js hot reload)
const Product: IProductModel =
  (mongoose.models.Product as IProductModel) || mongoose.model<IProduct, IProductModel>('Product', ProductSchema);

export default Product;
