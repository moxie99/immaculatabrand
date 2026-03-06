/**
 * Integration tests for Media Management Flow
 * Task 30.3: Connect media management flow
 * 
 * Tests:
 * - Image upload to Cloudinary
 * - Media records in database
 * - Image display on public pages (hero, carousel, products)
 * - Media deletion
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Media from '@/lib/db/models/Media';
import mongoose from 'mongoose';
import { POST as uploadMedia } from '@/app/api/media/upload/route';
import { GET as getMediaByType } from '@/app/api/media/[type]/route';
import cloudinary from '@/config/cloudinary';

// Admin credentials for authenticated requests
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';
const adminAuth = Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64');

/**
 * Helper function to create a mock image file
 */
function createMockImageFile(name: string, size: number = 1024): File {
  const buffer = Buffer.alloc(size);
  const blob = new Blob([buffer], { type: 'image/jpeg' });
  return new File([blob], name, { type: 'image/jpeg' });
}

describe('Media Management Flow Integration Tests', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri);

    // Mock Cloudinary uploader for integration tests
    vi.spyOn(cloudinary.uploader, 'upload').mockImplementation(async (file: any, options: any) => {
      // Extract folder and generate mock cloudinary ID
      const folder = options?.folder || 'confectionary/test';
      const timestamp = Date.now();
      const publicId = `${folder}/test-image-${timestamp}`;

      return {
        public_id: publicId,
        url: `http://res.cloudinary.com/test/image/upload/v1/${publicId}.jpg`,
        secure_url: `https://res.cloudinary.com/test/image/upload/v1/${publicId}.jpg`,
        width: 1200,
        height: 800,
        format: 'jpg',
      } as any;
    });

    // Mock Cloudinary destroy for deletion tests
    vi.spyOn(cloudinary.uploader, 'destroy').mockImplementation(async (publicId: string) => {
      return { result: 'ok' } as any;
    });
  }, 60000); // Increase timeout for MongoDB Memory Server startup

  afterAll(async () => {
    // Cleanup
    vi.restoreAllMocks();
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clean up media before each test
    await Media.deleteMany({});
  });

  describe('Image Upload to Cloudinary', () => {
    it('should upload a hero image', async () => {
      const file = createMockImageFile('hero-image.jpg', 2048);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'hero');
      formData.append('altText', 'Hero section background');

      const request = new NextRequest('http://localhost:3000/api/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
        },
        body: formData,
      });

      const response = await uploadMedia(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.type).toBe('hero');
      expect(data.data.altText).toBe('Hero section background');
      expect(data.data.cloudinaryId).toBeDefined();
      expect(data.data.url).toContain('cloudinary.com');
      expect(data.data.secureUrl).toContain('https://');
    });

    it('should upload a carousel image', async () => {
      const file = createMockImageFile('carousel-image.jpg', 3072);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'carousel');
      formData.append('altText', 'Carousel slide showing products');

      const request = new NextRequest('http://localhost:3000/api/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
        },
        body: formData,
      });

      const response = await uploadMedia(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.type).toBe('carousel');
      expect(data.data.width).toBeGreaterThan(0);
      expect(data.data.height).toBeGreaterThan(0);
      expect(data.data.format).toBeDefined();
    });

    it('should upload a product image', async () => {
      const file = createMockImageFile('product-image.jpg', 2560);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'product');
      formData.append('altText', 'Nigerian Chin Chin product photo');

      const request = new NextRequest('http://localhost:3000/api/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
        },
        body: formData,
      });

      const response = await uploadMedia(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.type).toBe('product');
    });

    it('should upload a category image', async () => {
      const file = createMockImageFile('category-image.jpg', 1536);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'category');
      formData.append('altText', 'Confectionary category banner');

      const request = new NextRequest('http://localhost:3000/api/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
        },
        body: formData,
      });

      const response = await uploadMedia(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.type).toBe('category');
    });

    it('should reject upload without authentication', async () => {
      const file = createMockImageFile('test.jpg');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'hero');
      formData.append('altText', 'Test image');

      const request = new NextRequest('http://localhost:3000/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await uploadMedia(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject upload with invalid media type', async () => {
      const file = createMockImageFile('test.jpg');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'invalid-type');
      formData.append('altText', 'Test image');

      const request = new NextRequest('http://localhost:3000/api/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
        },
        body: formData,
      });

      const response = await uploadMedia(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject upload without alt text', async () => {
      const file = createMockImageFile('test.jpg');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'hero');

      const request = new NextRequest('http://localhost:3000/api/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
        },
        body: formData,
      });

      const response = await uploadMedia(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toContain('Alt text');
    });

    it('should reject upload with file size exceeding 5MB', async () => {
      const file = createMockImageFile('large-file.jpg', 6 * 1024 * 1024); // 6MB
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'hero');
      formData.append('altText', 'Large image');

      const request = new NextRequest('http://localhost:3000/api/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
        },
        body: formData,
      });

      const response = await uploadMedia(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('size');
    });
  });

  describe('Media Records in Database', () => {
    it('should create media record with all required fields', async () => {
      const file = createMockImageFile('test.jpg');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'hero');
      formData.append('altText', 'Test hero image');

      const request = new NextRequest('http://localhost:3000/api/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
        },
        body: formData,
      });

      const response = await uploadMedia(request);
      const data = await response.json();

      expect(response.status).toBe(201);

      // Verify record in database
      const mediaInDb = await Media.findById(data.data._id);
      expect(mediaInDb).toBeDefined();
      expect(mediaInDb?.cloudinaryId).toBe(data.data.cloudinaryId);
      expect(mediaInDb?.type).toBe('hero');
      expect(mediaInDb?.altText).toBe('Test hero image');
      expect(mediaInDb?.url).toBeDefined();
      expect(mediaInDb?.secureUrl).toBeDefined();
      expect(mediaInDb?.width).toBeGreaterThan(0);
      expect(mediaInDb?.height).toBeGreaterThan(0);
      expect(mediaInDb?.format).toBeDefined();
      expect(mediaInDb?.createdAt).toBeDefined();
    });

    it('should enforce unique cloudinaryId constraint', async () => {
      const cloudinaryId = 'confectionary/hero/test-unique-123';

      // Create first media record
      await Media.create({
        cloudinaryId,
        url: 'http://res.cloudinary.com/test/image/upload/v1/test.jpg',
        secureUrl: 'https://res.cloudinary.com/test/image/upload/v1/test.jpg',
        type: 'hero',
        altText: 'First image',
        width: 800,
        height: 600,
        format: 'jpg',
      });

      // Attempt to create duplicate
      await expect(
        Media.create({
          cloudinaryId, // Same ID
          url: 'http://res.cloudinary.com/test/image/upload/v1/test2.jpg',
          secureUrl: 'https://res.cloudinary.com/test/image/upload/v1/test2.jpg',
          type: 'carousel',
          altText: 'Second image',
          width: 800,
          height: 600,
          format: 'jpg',
        })
      ).rejects.toThrow();
    });

    it('should validate secure URL uses HTTPS', async () => {
      await expect(
        Media.create({
          cloudinaryId: 'test-http-url',
          url: 'http://res.cloudinary.com/test/image/upload/v1/test.jpg',
          secureUrl: 'http://res.cloudinary.com/test/image/upload/v1/test.jpg', // Invalid: HTTP
          type: 'hero',
          altText: 'Test image',
          width: 800,
          height: 600,
          format: 'jpg',
        })
      ).rejects.toThrow();
    });

    it('should validate media type enum', async () => {
      await expect(
        Media.create({
          cloudinaryId: 'test-invalid-type',
          url: 'http://res.cloudinary.com/test/image/upload/v1/test.jpg',
          secureUrl: 'https://res.cloudinary.com/test/image/upload/v1/test.jpg',
          type: 'invalid-type' as any, // Invalid type
          altText: 'Test image',
          width: 800,
          height: 600,
          format: 'jpg',
        })
      ).rejects.toThrow();
    });

    it('should automatically generate createdAt timestamp', async () => {
      const media = await Media.create({
        cloudinaryId: 'test-timestamp',
        url: 'http://res.cloudinary.com/test/image/upload/v1/test.jpg',
        secureUrl: 'https://res.cloudinary.com/test/image/upload/v1/test.jpg',
        type: 'hero',
        altText: 'Test image',
        width: 800,
        height: 600,
        format: 'jpg',
      });

      expect(media.createdAt).toBeDefined();
      expect(media.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('Image Display on Public Pages', () => {
    beforeEach(async () => {
      // Create test media for different types
      await Media.create([
        {
          cloudinaryId: 'confectionary/hero/hero-1',
          url: 'http://res.cloudinary.com/test/hero-1.jpg',
          secureUrl: 'https://res.cloudinary.com/test/hero-1.jpg',
          type: 'hero',
          altText: 'Hero image 1',
          width: 1200,
          height: 800,
          format: 'jpg',
          createdAt: new Date('2024-01-15T10:00:00Z'),
        },
        {
          cloudinaryId: 'confectionary/hero/hero-2',
          url: 'http://res.cloudinary.com/test/hero-2.jpg',
          secureUrl: 'https://res.cloudinary.com/test/hero-2.jpg',
          type: 'hero',
          altText: 'Hero image 2',
          width: 1200,
          height: 800,
          format: 'jpg',
          createdAt: new Date('2024-01-15T11:00:00Z'),
        },
        {
          cloudinaryId: 'confectionary/carousel/carousel-1',
          url: 'http://res.cloudinary.com/test/carousel-1.jpg',
          secureUrl: 'https://res.cloudinary.com/test/carousel-1.jpg',
          type: 'carousel',
          altText: 'Carousel image 1',
          width: 1200,
          height: 600,
          format: 'jpg',
          createdAt: new Date('2024-01-15T12:00:00Z'),
        },
        {
          cloudinaryId: 'confectionary/carousel/carousel-2',
          url: 'http://res.cloudinary.com/test/carousel-2.jpg',
          secureUrl: 'https://res.cloudinary.com/test/carousel-2.jpg',
          type: 'carousel',
          altText: 'Carousel image 2',
          width: 1200,
          height: 600,
          format: 'jpg',
          createdAt: new Date('2024-01-15T13:00:00Z'),
        },
        {
          cloudinaryId: 'confectionary/product/product-1',
          url: 'http://res.cloudinary.com/test/product-1.jpg',
          secureUrl: 'https://res.cloudinary.com/test/product-1.jpg',
          type: 'product',
          altText: 'Product image 1',
          width: 800,
          height: 800,
          format: 'jpg',
          createdAt: new Date('2024-01-15T14:00:00Z'),
        },
      ]);
    });

    it('should fetch hero images for homepage', async () => {
      const request = new NextRequest('http://localhost:3000/api/media/hero');
      const response = await getMediaByType(request, { params: { type: 'hero' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.data.every((m: any) => m.type === 'hero')).toBe(true);
      expect(data.data.every((m: any) => m.secureUrl.startsWith('https://'))).toBe(true);
    });

    it('should fetch carousel images for homepage', async () => {
      const request = new NextRequest('http://localhost:3000/api/media/carousel');
      const response = await getMediaByType(request, { params: { type: 'carousel' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.data.every((m: any) => m.type === 'carousel')).toBe(true);
    });

    it('should fetch product images', async () => {
      const request = new NextRequest('http://localhost:3000/api/media/product');
      const response = await getMediaByType(request, { params: { type: 'product' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].type).toBe('product');
    });

    it('should sort media by creation date descending (newest first)', async () => {
      const request = new NextRequest('http://localhost:3000/api/media/hero');
      const response = await getMediaByType(request, { params: { type: 'hero' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data[0].cloudinaryId).toBe('confectionary/hero/hero-2'); // Most recent
      expect(data.data[1].cloudinaryId).toBe('confectionary/hero/hero-1'); // Older
    });

    it('should limit number of results when limit parameter is provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/media/carousel?limit=1');
      const response = await getMediaByType(request, { params: { type: 'carousel' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].cloudinaryId).toBe('confectionary/carousel/carousel-2'); // Most recent
    });

    it('should fetch all media when type is "all"', async () => {
      const request = new NextRequest('http://localhost:3000/api/media/all');
      const response = await getMediaByType(request, { params: { type: 'all' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(5); // All media records
    });

    it('should include alt text for accessibility', async () => {
      const request = new NextRequest('http://localhost:3000/api/media/hero');
      const response = await getMediaByType(request, { params: { type: 'hero' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.every((m: any) => m.altText && m.altText.length > 0)).toBe(true);
    });

    it('should reject invalid media type', async () => {
      const request = new NextRequest('http://localhost:3000/api/media/invalid-type');
      const response = await getMediaByType(request, { params: { type: 'invalid-type' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Media Deletion', () => {
    let testMedia: any;

    beforeEach(async () => {
      testMedia = await Media.create({
        cloudinaryId: 'confectionary/test/delete-me',
        url: 'http://res.cloudinary.com/test/delete-me.jpg',
        secureUrl: 'https://res.cloudinary.com/test/delete-me.jpg',
        type: 'product',
        altText: 'Image to be deleted',
        width: 800,
        height: 600,
        format: 'jpg',
      });
    });

    it('should delete media record from database', async () => {
      // Delete the media
      await Media.deleteOne({ cloudinaryId: testMedia.cloudinaryId });

      // Verify it's deleted
      const mediaInDb = await Media.findById(testMedia._id);
      expect(mediaInDb).toBeNull();
    });

    it('should remove deleted media from listings', async () => {
      // Delete the media
      await Media.deleteOne({ cloudinaryId: testMedia.cloudinaryId });

      // Try to fetch product images
      const request = new NextRequest('http://localhost:3000/api/media/product');
      const response = await getMediaByType(request, { params: { type: 'product' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(0); // No product images
    });

    it('should find media by cloudinaryId before deletion', async () => {
      const media = await Media.findByCloudinaryId(testMedia.cloudinaryId);

      expect(media).toBeDefined();
      expect(media?.cloudinaryId).toBe(testMedia.cloudinaryId);
    });

    it('should return null when finding non-existent cloudinaryId', async () => {
      const media = await Media.findByCloudinaryId('non-existent-id');

      expect(media).toBeNull();
    });
  });

  describe('Complete Media Management Flow', () => {
    it('should complete full media lifecycle', async () => {
      // 1. UPLOAD: Admin uploads a hero image
      const file = createMockImageFile('hero-flow.jpg', 2048);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'hero');
      formData.append('altText', 'Hero image for flow test');

      const uploadRequest = new NextRequest('http://localhost:3000/api/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
        },
        body: formData,
      });

      const uploadResponse = await uploadMedia(uploadRequest);
      const uploadData = await uploadResponse.json();

      expect(uploadResponse.status).toBe(201);
      expect(uploadData.success).toBe(true);
      const cloudinaryId = uploadData.data.cloudinaryId;
      const mediaId = uploadData.data._id;

      // 2. VERIFY DATABASE: Check media record exists in database
      const mediaInDb = await Media.findById(mediaId);
      expect(mediaInDb).toBeDefined();
      expect(mediaInDb?.cloudinaryId).toBe(cloudinaryId);
      expect(mediaInDb?.type).toBe('hero');

      // 3. DISPLAY: Fetch hero images for public page
      const fetchRequest = new NextRequest('http://localhost:3000/api/media/hero');
      const fetchResponse = await getMediaByType(fetchRequest, { params: { type: 'hero' } });
      const fetchData = await fetchResponse.json();

      expect(fetchResponse.status).toBe(200);
      expect(fetchData.success).toBe(true);
      expect(fetchData.data).toHaveLength(1);
      expect(fetchData.data[0].cloudinaryId).toBe(cloudinaryId);
      expect(fetchData.data[0].secureUrl).toContain('https://');
      expect(fetchData.data[0].altText).toBe('Hero image for flow test');

      // 4. DELETE: Admin deletes the media
      await Media.deleteOne({ cloudinaryId });

      // 5. VERIFY DELETION: Check media is removed from database
      const deletedMedia = await Media.findById(mediaId);
      expect(deletedMedia).toBeNull();

      // 6. VERIFY NOT IN LISTINGS: Check media doesn't appear in public listings
      const finalFetchRequest = new NextRequest('http://localhost:3000/api/media/hero');
      const finalFetchResponse = await getMediaByType(finalFetchRequest, { params: { type: 'hero' } });
      const finalFetchData = await finalFetchResponse.json();

      expect(finalFetchResponse.status).toBe(200);
      expect(finalFetchData.data).toHaveLength(0); // No hero images
    });

    it('should handle multiple media types in complete flow', async () => {
      const mediaTypes = ['hero', 'carousel', 'product', 'category'] as const;
      const uploadedMedia: any[] = [];

      // Upload one image of each type
      for (const type of mediaTypes) {
        const file = createMockImageFile(`${type}-image.jpg`, 2048);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        formData.append('altText', `${type} image for multi-type test`);

        const request = new NextRequest('http://localhost:3000/api/media/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${adminAuth}`,
          },
          body: formData,
        });

        const response = await uploadMedia(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        uploadedMedia.push(data.data);
      }

      // Verify all media types are in database
      expect(uploadedMedia).toHaveLength(4);

      // Fetch each type and verify
      for (const type of mediaTypes) {
        const request = new NextRequest(`http://localhost:3000/api/media/${type}`);
        const response = await getMediaByType(request, { params: { type } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.data).toHaveLength(1);
        expect(data.data[0].type).toBe(type);
      }

      // Fetch all media
      const allRequest = new NextRequest('http://localhost:3000/api/media/all');
      const allResponse = await getMediaByType(allRequest, { params: { type: 'all' } });
      const allData = await allResponse.json();

      expect(allResponse.status).toBe(200);
      expect(allData.data).toHaveLength(4);

      // Delete all media
      for (const media of uploadedMedia) {
        await Media.deleteOne({ cloudinaryId: media.cloudinaryId });
      }

      // Verify all deleted
      const finalAllRequest = new NextRequest('http://localhost:3000/api/media/all');
      const finalAllResponse = await getMediaByType(finalAllRequest, { params: { type: 'all' } });
      const finalAllData = await finalAllResponse.json();

      expect(finalAllResponse.status).toBe(200);
      expect(finalAllData.data).toHaveLength(0);
    });
  });
});
