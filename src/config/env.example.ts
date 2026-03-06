/**
 * Example usage of the environment configuration
 * 
 * This file demonstrates how to use the validated environment configuration
 * throughout the application instead of accessing process.env directly.
 */

import { env } from './env';

// Example 1: Using MongoDB URI
export function getDatabaseConnectionString(): string {
  return env.MONGODB_URI;
}

// Example 2: Using Cloudinary credentials
export function getCloudinaryConfig() {
  return {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  };
}

// Example 3: Using admin credentials
export function getAdminCredentials() {
  return {
    username: env.ADMIN_USERNAME,
    password: env.ADMIN_PASSWORD,
  };
}

// Example 4: Using site URL
export function getSiteUrl(): string {
  return env.NEXT_PUBLIC_SITE_URL;
}

// Example 5: Checking environment
export function isDevelopment(): boolean {
  return env.NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return env.NODE_ENV === 'production';
}

export function isTest(): boolean {
  return env.NODE_ENV === 'test';
}

// Example 6: Type-safe environment access
// The env object is fully typed, so you get autocomplete and type checking
export function logEnvironmentInfo(): void {
  console.log('Environment:', env.NODE_ENV);
  console.log('Site URL:', env.NEXT_PUBLIC_SITE_URL);
  console.log('Database:', env.MONGODB_URI.split('@')[1] || 'localhost');
  console.log('Cloudinary Cloud:', env.CLOUDINARY_CLOUD_NAME);
}
