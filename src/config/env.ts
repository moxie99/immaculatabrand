import { z } from 'zod';

/**
 * Environment variable schema definition
 * Validates all required environment variables on application startup
 */
const envSchema = z.object({
  // Database
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),

  // Admin Authentication
  ADMIN_USERNAME: z.string().min(1, 'ADMIN_USERNAME is required'),
  ADMIN_PASSWORD: z.string().min(1, 'ADMIN_PASSWORD is required'),

  // Application
  NEXT_PUBLIC_SITE_URL: z.string().url('NEXT_PUBLIC_SITE_URL must be a valid URL'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Type definition for validated environment variables
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables and returns typed configuration
 * Throws an error with detailed messages if validation fails
 */
function validateEnv(): Env {
  try {
    const env = envSchema.parse({
      MONGODB_URI: process.env.MONGODB_URI,
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
      ADMIN_USERNAME: process.env.ADMIN_USERNAME,
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NODE_ENV: process.env.NODE_ENV,
    });

    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => {
        const path = err.path.join('.');
        return `  - ${path}: ${err.message}`;
      });

      console.error('❌ Environment variable validation failed:\n');
      console.error(missingVars.join('\n'));
      console.error('\nPlease check your .env.local file and ensure all required variables are set.');

      throw new Error('Invalid environment configuration');
    }

    throw error;
  }
}

/**
 * Validated and typed environment configuration
 * Use this export throughout the application instead of process.env
 */
export const env = validateEnv();
