/**
 * Integration tests for Product Management Flow
 * Task 30.1: Connect product management flow
 * 
 * Tests:
 * - Product creation with image upload
 * - Product listing with filters
 * - Product update and deletion
 * - Slug generation and uniqueness
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Product from '@/lib/db/models/Product';
import mongoose from 'mongoose';
import { GET as getProducts, POST as createProduct } from '@/app/api/products/route';
import { 
  GET as getProductById, 
  PUT as updateProduct, 
  DELETE as deleteProduct 
} from '@/app/api/products/[id]/route';

// Admin credentials for authenticated requests
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';
const adminAuth = Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64');

describe('Product Management Flow Integration Tests', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri);
  }, 60000); // Increase timeout for MongoDB Memory Server startup

  afterAll(async () => {
    // Cleanup
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clean up products before each test
    await Product.deleteMany({});
  });

  describe('Product Creation with Image Upload', () => {
    it('should create a product with single image', async () => {
      const productData = {
        name: 'Nigerian Chin Chin',
        category: 'confectionary',
        description: 'Delicious crunchy Nigerian snack',
        price: 1500,
        currency: 'GBP',
        images: ['https://res.cloudinary.com/test/image/upload/v1/confectionary/product/chin-chin.jpg'],
        isActive: true,
        isFeatured: false,
      };

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const response = await createProduct(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Nigerian Chin Chin');
      expect(data.data.slug).toBe('nigerian-chin-chin');
      expect(data.data.images).toHaveLength(1);
      expect(data.data.images[0]).toContain('cloudinary.com');
    });

    it('should create a product with multiple images', async () => {
      const productData = {
        name: 'Smoked Catfish',
        category: 'fish',
        description: 'Premium smoked catfish from Nigeria',
        price: 2500,
        currency: 'GBP',
        images: [
          'https://res.cloudinary.com/test/image/upload/v1/fish/product/catfish-1.jpg',
          'https://res.cloudinary.com/test/image/upload/v1/fish/product/catfish-2.jpg',
          'https://res.cloudinary.com/test/image/upload/v1/fish/product/catfish-3.jpg',
        ],
        isActive: true,
        isFeatured: true,
      };

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const response = await createProduct(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.images).toHaveLength(3);
      expect(data.data.images.every((img: string) => img.includes('cloudinary.com'))).toBe(true);
    });

    it('should create a product with preparation steps and images', async () => {
      const productData = {
        name: 'Plantain Flour',
        category: 'foodstuffs',
        description: 'Organic plantain flour for various dishes',
        price: 1200,
        currency: 'GBP',
        images: ['https://res.cloudinary.com/test/image/upload/v1/foodstuffs/product/plantain-flour.jpg'],
        preparationSteps: [
          {
            stepNumber: 1,
            title: 'Mix the flour',
            description: 'Mix plantain flour with water',
            imageUrl: 'https://res.cloudinary.com/test/image/upload/v1/foodstuffs/steps/step1.jpg',
            duration: '5 minutes',
          },
          {
            stepNumber: 2,
            title: 'Cook the mixture',
            description: 'Cook on medium heat while stirring',
            duration: '15 minutes',
          },
        ],
        nutritionInfo: {
          servingSize: '100g',
          calories: 350,
          protein: '3g',
          carbs: '85g',
          fat: '1g',
        },
        isActive: true,
        isFeatured: false,
      };

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const response = await createProduct(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.preparationSteps).toHaveLength(2);
      expect(data.data.preparationSteps[0].imageUrl).toContain('cloudinary.com');
      expect(data.data.nutritionInfo).toBeDefined();
      expect(data.data.nutritionInfo.calories).toBe(350);
    });
  });

  describe('Product Listing with Filters', () => {
    beforeEach(async () => {
      // Create test products across different categories
      await Product.create([
        {
          name: 'Chin Chin',
          slug: 'chin-chin',
          category: 'confectionary',
          description: 'Crunchy snack',
          price: 1000,
          currency: 'GBP',
          images: ['https://res.cloudinary.com/test/chin-chin.jpg'],
          isActive: true,
          isFeatured: true,
        },
        {
          name: 'Puff Puff',
          slug: 'puff-puff',
          category: 'confectionary',
          description: 'Sweet fried dough',
          price: 800,
          currency: 'GBP',
          images: ['https://res.cloudinary.com/test/puff-puff.jpg'],
          isActive: true,
          isFeatured: false,
        },
        {
          name: 'Smoked Fish',
          slug: 'smoked-fish',
          category: 'fish',
          description: 'Premium smoked fish',
          price: 2000,
          currency: 'GBP',
          images: ['https://res.cloudinary.com/test/smoked-fish.jpg'],
          isActive: true,
          isFeatured: true,
        },
        {
          name: 'Crayfish',
          slug: 'crayfish',
          category: 'fish',
          description: 'Ground crayfish',
          price: 1500,
          currency: 'GBP',
          images: ['https://res.cloudinary.com/test/crayfish.jpg'],
          isActive: false, // Inactive product
          isFeatured: false,
        },
        {
          name: 'Garri',
          slug: 'garri',
          category: 'foodstuffs',
          description: 'Cassava flakes',
          price: 900,
          currency: 'GBP',
          images: ['https://res.cloudinary.com/test/garri.jpg'],
          isActive: true,
          isFeatured: false,
        },
      ]);
    });

    it('should list all active products', async () => {
      const request = new NextRequest('http://localhost:3000/api/products');
      const response = await getProducts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(4); // Only active products
      expect(data.pagination.total).toBe(4);
    });

    it('should filter products by category', async () => {
      const request = new NextRequest('http://localhost:3000/api/products?category=confectionary');
      const response = await getProducts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.data.every((p: any) => p.category === 'confectionary')).toBe(true);
    });

    it('should filter featured products', async () => {
      const request = new NextRequest('http://localhost:3000/api/products?featured=true');
      const response = await getProducts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2); // Chin Chin and Smoked Fish
      expect(data.data.every((p: any) => p.isFeatured === true)).toBe(true);
    });

    it('should filter by category and featured status', async () => {
      const request = new NextRequest('http://localhost:3000/api/products?category=fish&featured=true');
      const response = await getProducts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1); // Only Smoked Fish
      expect(data.data[0].category).toBe('fish');
      expect(data.data[0].isFeatured).toBe(true);
    });

    it('should paginate product results', async () => {
      const request = new NextRequest('http://localhost:3000/api/products?page=1&limit=2');
      const response = await getProducts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(2);
      expect(data.pagination.totalPages).toBe(2);
    });
  });

  describe('Product Update', () => {
    let testProduct: any;

    beforeEach(async () => {
      testProduct = await Product.create({
        name: 'Original Product',
        slug: 'original-product',
        category: 'confectionary',
        description: 'Original description',
        price: 1000,
        currency: 'GBP',
        images: ['https://res.cloudinary.com/test/original.jpg'],
        isActive: true,
        isFeatured: false,
      });
    });

    it('should update product basic information', async () => {
      const updateData = {
        description: 'Updated description',
        price: 1200,
      };

      const request = new NextRequest(`http://localhost:3000/api/products/${testProduct._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const response = await updateProduct(request, { params: { id: testProduct._id.toString() } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.description).toBe('Updated description');
      expect(data.data.price).toBe(1200);
      expect(data.data.slug).toBe('original-product'); // Slug unchanged
    });

    it('should update product images', async () => {
      const updateData = {
        images: [
          'https://res.cloudinary.com/test/new-image-1.jpg',
          'https://res.cloudinary.com/test/new-image-2.jpg',
        ],
      };

      const request = new NextRequest(`http://localhost:3000/api/products/${testProduct._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const response = await updateProduct(request, { params: { id: testProduct._id.toString() } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.images).toHaveLength(2);
      expect(data.data.images).toContain('https://res.cloudinary.com/test/new-image-1.jpg');
    });

    it('should update product name and regenerate slug', async () => {
      const updateData = {
        name: 'Completely New Product Name',
      };

      const request = new NextRequest(`http://localhost:3000/api/products/${testProduct._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const response = await updateProduct(request, { params: { id: testProduct._id.toString() } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Completely New Product Name');
      expect(data.data.slug).toBe('completely-new-product-name');
      expect(data.data.slug).not.toBe('original-product');
    });

    it('should toggle featured status', async () => {
      const updateData = {
        isFeatured: true,
      };

      const request = new NextRequest(`http://localhost:3000/api/products/${testProduct._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const response = await updateProduct(request, { params: { id: testProduct._id.toString() } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.isFeatured).toBe(true);
    });
  });

  describe('Product Deletion (Soft Delete)', () => {
    let testProduct: any;

    beforeEach(async () => {
      testProduct = await Product.create({
        name: 'Product to Delete',
        slug: 'product-to-delete',
        category: 'confectionary',
        description: 'This will be deleted',
        price: 1000,
        currency: 'GBP',
        images: ['https://res.cloudinary.com/test/delete-me.jpg'],
        isActive: true,
        isFeatured: false,
      });
    });

    it('should soft delete a product', async () => {
      const request = new NextRequest(`http://localhost:3000/api/products/${testProduct._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
        },
      });

      const response = await deleteProduct(request, { params: { id: testProduct._id.toString() } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.isActive).toBe(false);

      // Verify product still exists in database but is inactive
      const productInDb = await Product.findById(testProduct._id);
      expect(productInDb).toBeDefined();
      expect(productInDb?.isActive).toBe(false);
    });

    it('should not show deleted product in public listings', async () => {
      // Delete the product
      const deleteReq = new NextRequest(`http://localhost:3000/api/products/${testProduct._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
        },
      });
      await deleteProduct(deleteReq, { params: { id: testProduct._id.toString() } });

      // Try to list products
      const listReq = new NextRequest('http://localhost:3000/api/products');
      const listResponse = await getProducts(listReq);
      const listData = await listResponse.json();

      expect(listResponse.status).toBe(200);
      expect(listData.data).toHaveLength(0); // No active products
    });

    it('should return 404 for non-existent product deletion', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const request = new NextRequest(`http://localhost:3000/api/products/${fakeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
        },
      });

      const response = await deleteProduct(request, { params: { id: fakeId.toString() } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('Slug Generation and Uniqueness', () => {
    it('should generate slug from product name', async () => {
      const productData = {
        name: 'Nigerian Chin Chin Deluxe',
        category: 'confectionary',
        description: 'Premium chin chin',
        price: 1500,
        currency: 'GBP',
        images: ['https://res.cloudinary.com/test/chin-chin.jpg'],
      };

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const response = await createProduct(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.slug).toBe('nigerian-chin-chin-deluxe');
    });

    it('should handle special characters in slug generation', async () => {
      const productData = {
        name: 'Chin-Chin & Puff-Puff (Special)',
        category: 'confectionary',
        description: 'Special combo',
        price: 2000,
        currency: 'GBP',
        images: ['https://res.cloudinary.com/test/combo.jpg'],
      };

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const response = await createProduct(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.slug).toMatch(/^[a-z0-9-]+$/); // Only lowercase letters, numbers, and hyphens
      expect(data.data.slug).not.toContain('&');
      expect(data.data.slug).not.toContain('(');
      expect(data.data.slug).not.toContain(')');
    });

    it('should generate unique slug when duplicate name exists', async () => {
      // Create first product
      const firstProduct = {
        name: 'Chin Chin',
        category: 'confectionary',
        description: 'First chin chin',
        price: 1000,
        currency: 'GBP',
        images: ['https://res.cloudinary.com/test/chin-chin-1.jpg'],
      };

      const firstRequest = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(firstProduct),
      });

      const firstResponse = await createProduct(firstRequest);
      const firstData = await firstResponse.json();

      expect(firstResponse.status).toBe(201);
      expect(firstData.data.slug).toBe('chin-chin');

      // Create second product with same name
      const secondProduct = {
        name: 'Chin Chin',
        category: 'confectionary',
        description: 'Second chin chin',
        price: 1200,
        currency: 'GBP',
        images: ['https://res.cloudinary.com/test/chin-chin-2.jpg'],
      };

      const secondRequest = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(secondProduct),
      });

      const secondResponse = await createProduct(secondRequest);
      const secondData = await secondResponse.json();

      expect(secondResponse.status).toBe(201);
      expect(secondData.data.slug).not.toBe('chin-chin');
      expect(secondData.data.slug).toMatch(/^chin-chin-\d+$/); // Should have numeric suffix
    });

    it('should maintain slug uniqueness across multiple duplicates', async () => {
      const slugs: string[] = [];

      // Create 3 products with the same name
      for (let i = 0; i < 3; i++) {
        const productData = {
          name: 'Popular Product',
          category: 'confectionary',
          description: `Product ${i + 1}`,
          price: 1000 + i * 100,
          currency: 'GBP',
          images: [`https://res.cloudinary.com/test/product-${i}.jpg`],
        };

        const request = new NextRequest('http://localhost:3000/api/products', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${adminAuth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });

        const response = await createProduct(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        slugs.push(data.data.slug);
      }

      // Verify all slugs are unique
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(3);
      expect(slugs[0]).toBe('popular-product');
      expect(slugs[1]).toMatch(/^popular-product-\d+$/);
      expect(slugs[2]).toMatch(/^popular-product-\d+$/);
    });
  });

  describe('Complete Product Management Flow', () => {
    it('should complete full CRUD cycle', async () => {
      // 1. CREATE: Create a new product
      const createData = {
        name: 'Test Product Flow',
        category: 'foodstuffs',
        description: 'Testing complete flow',
        price: 1500,
        currency: 'GBP',
        images: ['https://res.cloudinary.com/test/flow-test.jpg'],
        isActive: true,
        isFeatured: false,
      };

      const createRequest = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createData),
      });

      const createResponse = await createProduct(createRequest);
      const createResult = await createResponse.json();

      expect(createResponse.status).toBe(201);
      const productId = createResult.data._id;

      // 2. READ: Fetch the created product
      const readRequest = new NextRequest(`http://localhost:3000/api/products/${productId}`);
      const readResponse = await getProductById(readRequest, { params: { id: productId } });
      const readResult = await readResponse.json();

      expect(readResponse.status).toBe(200);
      expect(readResult.data.name).toBe('Test Product Flow');

      // 3. UPDATE: Update the product
      const updateData = {
        price: 1800,
        isFeatured: true,
      };

      const updateRequest = new NextRequest(`http://localhost:3000/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const updateResponse = await updateProduct(updateRequest, { params: { id: productId } });
      const updateResult = await updateResponse.json();

      expect(updateResponse.status).toBe(200);
      expect(updateResult.data.price).toBe(1800);
      expect(updateResult.data.isFeatured).toBe(true);

      // 4. DELETE: Soft delete the product
      const deleteRequest = new NextRequest(`http://localhost:3000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${adminAuth}`,
        },
      });

      const deleteResponse = await deleteProduct(deleteRequest, { params: { id: productId } });
      const deleteResult = await deleteResponse.json();

      expect(deleteResponse.status).toBe(200);
      expect(deleteResult.data.isActive).toBe(false);

      // 5. VERIFY: Product should not appear in public listings
      const listRequest = new NextRequest('http://localhost:3000/api/products');
      const listResponse = await getProducts(listRequest);
      const listResult = await listResponse.json();

      expect(listResponse.status).toBe(200);
      expect(listResult.data.find((p: any) => p._id === productId)).toBeUndefined();
    });
  });
});
