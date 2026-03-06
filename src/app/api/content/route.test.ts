/**
 * Content API Route Tests
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { GET, PUT } from './route';
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Content from '@/lib/db/models/Content';
import mongoose from 'mongoose';

// Mock admin credentials
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';
const adminAuth = Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64');

describe('Content API Routes', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    // Clean up test data
    await Content.deleteMany({ key: { $regex: /^test_/ } });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up test content before each test
    await Content.deleteMany({ key: { $regex: /^test_/ } });
    
    // Create test content
    await Content.create({
      key: 'test_content',
      title: 'Test Content',
      description: 'Test content description',
      data: {
        heading: 'Test Heading',
        subheading: 'Test Subheading',
        text: 'Test text content',
      },
    });
  });

  describe('GET /api/content', () => {
    it('should return content by key', async () => {
      const request = new NextRequest('http://localhost:3000/api/content?key=test_content', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.key).toBe('test_content');
      expect(data.data.title).toBe('Test Content');
      expect(data.data.data.heading).toBe('Test Heading');
    });

    it('should return 400 if key is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/content', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 for non-existent content', async () => {
      const request = new NextRequest('http://localhost:3000/api/content?key=non_existent', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PUT /api/content', () => {
    it('should update content with admin auth', async () => {
      const updateData = {
        key: 'test_content',
        title: 'Updated Test Content',
        description: 'Updated description',
        data: {
          heading: 'Updated Heading',
          subheading: 'Updated Subheading',
          text: 'Updated text content',
        },
      };

      const request = new NextRequest('http://localhost:3000/api/content', {
        method: 'PUT',
        headers: {
          authorization: `Basic ${adminAuth}`,
        },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('Updated Test Content');
      expect(data.data.data.heading).toBe('Updated Heading');
    });

    it('should create new content if key does not exist', async () => {
      const newData = {
        key: 'test_new_content',
        title: 'New Test Content',
        data: {
          value: 'New content value',
        },
      };

      const request = new NextRequest('http://localhost:3000/api/content', {
        method: 'PUT',
        headers: {
          authorization: `Basic ${adminAuth}`,
        },
        body: JSON.stringify(newData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.key).toBe('test_new_content');
      expect(data.data.title).toBe('New Test Content');
    });

    it('should reject request without auth', async () => {
      const updateData = {
        key: 'test_content',
        title: 'Updated Test Content',
        data: {
          heading: 'Updated Heading',
        },
      };

      const request = new NextRequest('http://localhost:3000/api/content', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject invalid content data', async () => {
      const invalidData = {
        key: 'test_content',
        title: 'Updated Test Content',
        data: {}, // Empty data object
      };

      const request = new NextRequest('http://localhost:3000/api/content', {
        method: 'PUT',
        headers: {
          authorization: `Basic ${adminAuth}`,
        },
        body: JSON.stringify(invalidData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
