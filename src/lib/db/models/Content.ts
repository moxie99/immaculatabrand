import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Content document interface
 * Represents editable site content (homepage hero, about page, etc.)
 */
export interface IContent extends Document {
  key: string;
  title: string;
  description?: string;
  data: Record<string, any>;
  updatedAt: Date;
}

/**
 * Content model interface with static methods
 */
export interface IContentModel extends Model<IContent> {
  findByKey(key: string): Promise<IContent | null>;
  upsertByKey(
    key: string,
    title: string,
    data: Record<string, any>,
    description?: string
  ): Promise<IContent>;
  deleteByKey(key: string): Promise<boolean>;
  getAllKeys(): Promise<string[]>;
}

/**
 * Content schema definition
 */
const ContentSchema = new Schema<IContent>(
  {
    key: {
      type: String,
      required: [true, 'Content key is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      validate: {
        validator: function (key: string) {
          // Key should be alphanumeric with underscores only
          return /^[a-z0-9_]+$/.test(key);
        },
        message: 'Key must contain only lowercase letters, numbers, and underscores',
      },
    },
    title: {
      type: String,
      required: [true, 'Content title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    data: {
      type: Schema.Types.Mixed,
      required: [true, 'Content data is required'],
      default: {},
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true }, // Only track update time
    collection: 'content',
  }
);

/**
 * Instance method to get content data
 */
ContentSchema.methods.getData = function (): Record<string, any> {
  return this.data;
};

/**
 * Instance method to update content data
 */
ContentSchema.methods.updateData = function (
  newData: Record<string, any>
): void {
  this.data = { ...this.data, ...newData };
};

/**
 * Static method to find content by key
 */
ContentSchema.statics.findByKey = async function (
  key: string
): Promise<IContent | null> {
  return this.findOne({ key: key.toLowerCase() });
};

/**
 * Static method to upsert content (update or insert)
 */
ContentSchema.statics.upsertByKey = async function (
  key: string,
  title: string,
  data: Record<string, any>,
  description?: string
): Promise<IContent> {
  const content = await this.findOneAndUpdate(
    { key: key.toLowerCase() },
    {
      title,
      description,
      data,
      updatedAt: new Date(),
    },
    {
      new: true, // Return updated document
      upsert: true, // Create if doesn't exist
      runValidators: true, // Run schema validators
    }
  );
  
  return content;
};

/**
 * Static method to get all content keys
 */
ContentSchema.statics.getAllKeys = async function (): Promise<string[]> {
  const contents = await this.find({}, { key: 1, _id: 0 });
  return contents.map((c: { key: string }) => c.key);
};

// Prevent model recompilation in development (Next.js hot reload)
const Content: IContentModel =
  (mongoose.models.Content as IContentModel) || mongoose.model<IContent, IContentModel>('Content', ContentSchema);

export default Content;
