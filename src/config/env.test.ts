import { z } from 'zod';

// Import the schema for testing
const envSchema = z.object({
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
  ADMIN_USERNAME: z.string().min(1, 'ADMIN_USERNAME is required'),
  ADMIN_PASSWORD: z.string().min(1, 'ADMIN_PASSWORD is required'),
  NEXT_PUBLIC_SITE_URL: z.string().url('NEXT_PUBLIC_SITE_URL must be a valid URL'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

describe('Environment Configuration', () => {
  it('should validate all required environment variables when present', () => {
    const validEnv = {
      MONGODB_URI: 'mongodb://localhost:27017/test',
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_API_KEY: 'test-key',
      CLOUDINARY_API_SECRET: 'test-secret',
      ADMIN_USERNAME: 'admin',
      ADMIN_PASSWORD: 'password123',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      NODE_ENV: 'development' as const,
    };

    const result = envSchema.parse(validEnv);

    expect(result.MONGODB_URI).toBe('mongodb://localhost:27017/test');
    expect(result.CLOUDINARY_CLOUD_NAME).toBe('test-cloud');
    expect(result.CLOUDINARY_API_KEY).toBe('test-key');
    expect(result.CLOUDINARY_API_SECRET).toBe('test-secret');
    expect(result.ADMIN_USERNAME).toBe('admin');
    expect(result.ADMIN_PASSWORD).toBe('password123');
    expect(result.NEXT_PUBLIC_SITE_URL).toBe('http://localhost:3000');
    expect(result.NODE_ENV).toBe('development');
  });

  it('should throw error when MONGODB_URI is missing', () => {
    const invalidEnv = {
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_API_KEY: 'test-key',
      CLOUDINARY_API_SECRET: 'test-secret',
      ADMIN_USERNAME: 'admin',
      ADMIN_PASSWORD: 'password123',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      NODE_ENV: 'development' as const,
    };

    expect(() => envSchema.parse(invalidEnv)).toThrow();
  });

  it('should throw error when CLOUDINARY_CLOUD_NAME is missing', () => {
    const invalidEnv = {
      MONGODB_URI: 'mongodb://localhost:27017/test',
      CLOUDINARY_API_KEY: 'test-key',
      CLOUDINARY_API_SECRET: 'test-secret',
      ADMIN_USERNAME: 'admin',
      ADMIN_PASSWORD: 'password123',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      NODE_ENV: 'development' as const,
    };

    expect(() => envSchema.parse(invalidEnv)).toThrow();
  });

  it('should throw error when CLOUDINARY_API_KEY is missing', () => {
    const invalidEnv = {
      MONGODB_URI: 'mongodb://localhost:27017/test',
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_API_SECRET: 'test-secret',
      ADMIN_USERNAME: 'admin',
      ADMIN_PASSWORD: 'password123',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      NODE_ENV: 'development' as const,
    };

    expect(() => envSchema.parse(invalidEnv)).toThrow();
  });

  it('should throw error when CLOUDINARY_API_SECRET is missing', () => {
    const invalidEnv = {
      MONGODB_URI: 'mongodb://localhost:27017/test',
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_API_KEY: 'test-key',
      ADMIN_USERNAME: 'admin',
      ADMIN_PASSWORD: 'password123',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      NODE_ENV: 'development' as const,
    };

    expect(() => envSchema.parse(invalidEnv)).toThrow();
  });

  it('should throw error when ADMIN_USERNAME is missing', () => {
    const invalidEnv = {
      MONGODB_URI: 'mongodb://localhost:27017/test',
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_API_KEY: 'test-key',
      CLOUDINARY_API_SECRET: 'test-secret',
      ADMIN_PASSWORD: 'password123',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      NODE_ENV: 'development' as const,
    };

    expect(() => envSchema.parse(invalidEnv)).toThrow();
  });

  it('should throw error when ADMIN_PASSWORD is missing', () => {
    const invalidEnv = {
      MONGODB_URI: 'mongodb://localhost:27017/test',
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_API_KEY: 'test-key',
      CLOUDINARY_API_SECRET: 'test-secret',
      ADMIN_USERNAME: 'admin',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      NODE_ENV: 'development' as const,
    };

    expect(() => envSchema.parse(invalidEnv)).toThrow();
  });

  it('should throw error when NEXT_PUBLIC_SITE_URL is invalid', () => {
    const invalidEnv = {
      MONGODB_URI: 'mongodb://localhost:27017/test',
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_API_KEY: 'test-key',
      CLOUDINARY_API_SECRET: 'test-secret',
      ADMIN_USERNAME: 'admin',
      ADMIN_PASSWORD: 'password123',
      NEXT_PUBLIC_SITE_URL: 'not-a-valid-url',
      NODE_ENV: 'development' as const,
    };

    expect(() => envSchema.parse(invalidEnv)).toThrow('NEXT_PUBLIC_SITE_URL must be a valid URL');
  });

  it('should throw error when NEXT_PUBLIC_SITE_URL is missing', () => {
    const invalidEnv = {
      MONGODB_URI: 'mongodb://localhost:27017/test',
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_API_KEY: 'test-key',
      CLOUDINARY_API_SECRET: 'test-secret',
      ADMIN_USERNAME: 'admin',
      ADMIN_PASSWORD: 'password123',
      NODE_ENV: 'development' as const,
    };

    expect(() => envSchema.parse(invalidEnv)).toThrow();
  });

  it('should default NODE_ENV to development when not provided', () => {
    const envWithoutNodeEnv = {
      MONGODB_URI: 'mongodb://localhost:27017/test',
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_API_KEY: 'test-key',
      CLOUDINARY_API_SECRET: 'test-secret',
      ADMIN_USERNAME: 'admin',
      ADMIN_PASSWORD: 'password123',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
    };

    const result = envSchema.parse(envWithoutNodeEnv);

    expect(result.NODE_ENV).toBe('development');
  });

  it('should accept valid NODE_ENV values', () => {
    const validEnvs = ['development', 'production', 'test'] as const;

    for (const nodeEnv of validEnvs) {
      const validEnv = {
        MONGODB_URI: 'mongodb://localhost:27017/test',
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-key',
        CLOUDINARY_API_SECRET: 'test-secret',
        ADMIN_USERNAME: 'admin',
        ADMIN_PASSWORD: 'password123',
        NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
        NODE_ENV: nodeEnv,
      };

      const result = envSchema.parse(validEnv);

      expect(result.NODE_ENV).toBe(nodeEnv);
    }
  });

  it('should throw error when NODE_ENV has invalid value', () => {
    const invalidEnv = {
      MONGODB_URI: 'mongodb://localhost:27017/test',
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_API_KEY: 'test-key',
      CLOUDINARY_API_SECRET: 'test-secret',
      ADMIN_USERNAME: 'admin',
      ADMIN_PASSWORD: 'password123',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      NODE_ENV: 'invalid',
    };

    expect(() => envSchema.parse(invalidEnv)).toThrow();
  });

  it('should throw error when multiple variables are missing', () => {
    const invalidEnv = {
      MONGODB_URI: 'mongodb://localhost:27017/test',
      ADMIN_USERNAME: 'admin',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      NODE_ENV: 'development' as const,
    };

    expect(() => envSchema.parse(invalidEnv)).toThrow();
  });

  it('should validate empty strings as missing', () => {
    const invalidEnv = {
      MONGODB_URI: '',
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_API_KEY: 'test-key',
      CLOUDINARY_API_SECRET: 'test-secret',
      ADMIN_USERNAME: 'admin',
      ADMIN_PASSWORD: 'password123',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      NODE_ENV: 'development' as const,
    };

    expect(() => envSchema.parse(invalidEnv)).toThrow('MONGODB_URI is required');
  });
});
