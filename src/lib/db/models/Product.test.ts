import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import Product from './Product';
import connectDB, { disconnectDB } from '../mongodb';

describe('Product Model', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    // Clean up products collection before each test
    await Product.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create a valid product with all required fields', async () => {
      const productData = {
        name: 'Nigerian Chin Chin',
        slug: 'nigerian-chin-chin',
        category: 'confectionary',
        description: 'Delicious crunchy Nigerian snack',
        price: 12.99,
        currency: 'GBP',
        images: ['https://res.cloudinary.com/test/image1.jpg'],
        preparationSteps: [
          {
            stepNumber: 1,
            title: 'Mix ingredients',
            description: 'Combine flour, sugar, and butter',
          },
        ],
        isFeatured: true,
        isActive: true,
      };

      const product = await Product.create(productData);

      expect(product.name).toBe(productData.name);
      expect(product.slug).toBe(productData.slug);
      expect(product.category).toBe(productData.category);
      expect(product.price).toBe(productData.price);
      expect(product.isFeatured).toBe(true);
      expect(product.isActive).toBe(true);
      expect(product.createdAt).toBeInstanceOf(Date);
      expect(product.updatedAt).toBeInstanceOf(Date);
    });

    it('should reject product with negative price', async () => {
      const productData = {
        name: 'Test Product',
        slug: 'test-product',
        category: 'confectionary',
        description: 'Test description',
        price: -10,
        currency: 'GBP',
      };

      await expect(Product.create(productData)).rejects.toThrow();
    });

    it('should reject product with zero price', async () => {
      const productData = {
        name: 'Test Product',
        slug: 'test-product',
        category: 'confectionary',
        description: 'Test description',
        price: 0,
        currency: 'GBP',
      };

      await expect(Product.create(productData)).rejects.toThrow();
    });

    it('should reject product with invalid category', async () => {
      const productData = {
        name: 'Test Product',
        slug: 'test-product',
        category: 'invalid-category',
        description: 'Test description',
        price: 10,
        currency: 'GBP',
      };

      await expect(Product.create(productData)).rejects.toThrow();
    });

    it('should reject product with HTTP image URL', async () => {
      const productData = {
        name: 'Test Product',
        slug: 'test-product',
        category: 'confectionary',
        description: 'Test description',
        price: 10,
        currency: 'GBP',
        images: ['http://insecure.com/image.jpg'],
      };

      await expect(Product.create(productData)).rejects.toThrow();
    });

    it('should accept all valid categories', async () => {
      const categories = ['confectionary', 'fish', 'foodstuffs'];

      for (const category of categories) {
        const product = await Product.create({
          name: `Test ${category}`,
          slug: `test-${category}`,
          category,
          description: 'Test description',
          price: 10,
          currency: 'GBP',
        });

        expect(product.category).toBe(category);
      }
    });
  });

  describe('Slug Generation', () => {
    it('should auto-generate slug from name on save', async () => {
      const product = new Product({
        name: 'Nigerian Chin Chin',
        category: 'confectionary',
        description: 'Test description',
        price: 10,
        currency: 'GBP',
      });

      await product.save();

      expect(product.slug).toBe('nigerian-chin-chin');
    });

    it('should handle special characters in slug generation', async () => {
      const product = new Product({
        name: 'Test Product! @#$% Special',
        category: 'confectionary',
        description: 'Test description',
        price: 10,
        currency: 'GBP',
      });

      await product.save();

      expect(product.slug).toBe('test-product-special');
    });

    it('should handle multiple spaces in slug generation', async () => {
      const product = new Product({
        name: 'Test    Product   With   Spaces',
        category: 'confectionary',
        description: 'Test description',
        price: 10,
        currency: 'GBP',
      });

      await product.save();

      expect(product.slug).toBe('test-product-with-spaces');
    });

    it('should generate unique slug when duplicate exists', async () => {
      // Create first product
      await Product.create({
        name: 'Test Product',
        slug: 'test-product',
        category: 'confectionary',
        description: 'Test description',
        price: 10,
        currency: 'GBP',
      });

      // Generate unique slug for second product with same name
      const uniqueSlug = await Product.generateUniqueSlug('Test Product');

      expect(uniqueSlug).toBe('test-product-1');
    });
  });

  describe('Indexes', () => {
    it('should enforce unique slug constraint', async () => {
      const productData = {
        name: 'Test Product',
        slug: 'test-product',
        category: 'confectionary',
        description: 'Test description',
        price: 10,
        currency: 'GBP',
      };

      await Product.create(productData);

      // Attempt to create duplicate slug
      await expect(
        Product.create({
          ...productData,
          name: 'Different Name',
        })
      ).rejects.toThrow();
    });

    it('should have index on category field', async () => {
      const indexes = Product.schema.indexes();
      const categoryIndex = indexes.find((idx) => 
        idx[0].category !== undefined
      );

      expect(categoryIndex).toBeDefined();
    });

    it('should have compound index on isFeatured and isActive', async () => {
      const indexes = Product.schema.indexes();
      const compoundIndex = indexes.find(
        (idx) => idx[0].isFeatured !== undefined && idx[0].isActive !== undefined
      );

      expect(compoundIndex).toBeDefined();
    });

    it('should have text index on name field', async () => {
      const indexes = Product.schema.indexes();
      const textIndex = indexes.find((idx) => idx[0].name === 'text');

      expect(textIndex).toBeDefined();
    });
  });

  describe('Instance Methods', () => {
    it('should correctly identify visible products', async () => {
      const activeProduct = await Product.create({
        name: 'Active Product',
        slug: 'active-product',
        category: 'confectionary',
        description: 'Test description',
        price: 10,
        currency: 'GBP',
        isActive: true,
      });

      const inactiveProduct = await Product.create({
        name: 'Inactive Product',
        slug: 'inactive-product',
        category: 'confectionary',
        description: 'Test description',
        price: 10,
        currency: 'GBP',
        isActive: false,
      });

      expect(activeProduct.isVisibleToPublic()).toBe(true);
      expect(inactiveProduct.isVisibleToPublic()).toBe(false);
    });

    it('should correctly identify homepage products', async () => {
      const homepageProduct = await Product.create({
        name: 'Homepage Product',
        slug: 'homepage-product',
        category: 'confectionary',
        description: 'Test description',
        price: 10,
        currency: 'GBP',
        isFeatured: true,
        isActive: true,
      });

      const notFeaturedProduct = await Product.create({
        name: 'Not Featured',
        slug: 'not-featured',
        category: 'confectionary',
        description: 'Test description',
        price: 10,
        currency: 'GBP',
        isFeatured: false,
        isActive: true,
      });

      const inactiveProduct = await Product.create({
        name: 'Inactive Featured',
        slug: 'inactive-featured',
        category: 'confectionary',
        description: 'Test description',
        price: 10,
        currency: 'GBP',
        isFeatured: true,
        isActive: false,
      });

      expect(homepageProduct.shouldShowOnHomepage()).toBe(true);
      expect(notFeaturedProduct.shouldShowOnHomepage()).toBe(false);
      expect(inactiveProduct.shouldShowOnHomepage()).toBe(false);
    });
  });

  describe('Preparation Steps', () => {
    it('should store preparation steps correctly', async () => {
      const product = await Product.create({
        name: 'Test Product',
        slug: 'test-product',
        category: 'confectionary',
        description: 'Test description',
        price: 10,
        currency: 'GBP',
        preparationSteps: [
          {
            stepNumber: 1,
            title: 'Step 1',
            description: 'First step',
            duration: '10 minutes',
          },
          {
            stepNumber: 2,
            title: 'Step 2',
            description: 'Second step',
            imageUrl: 'https://res.cloudinary.com/test/step2.jpg',
          },
        ],
      });

      expect(product.preparationSteps).toHaveLength(2);
      expect(product.preparationSteps[0].stepNumber).toBe(1);
      expect(product.preparationSteps[0].duration).toBe('10 minutes');
      expect(product.preparationSteps[1].imageUrl).toBe(
        'https://res.cloudinary.com/test/step2.jpg'
      );
    });
  });

  describe('Nutrition Info', () => {
    it('should store nutrition info when provided', async () => {
      const product = await Product.create({
        name: 'Test Product',
        slug: 'test-product',
        category: 'confectionary',
        description: 'Test description',
        price: 10,
        currency: 'GBP',
        nutritionInfo: {
          servingSize: '100g',
          calories: 250,
          protein: '5g',
          carbs: '30g',
          fat: '10g',
        },
      });

      expect(product.nutritionInfo).toBeDefined();
      expect(product.nutritionInfo?.servingSize).toBe('100g');
      expect(product.nutritionInfo?.calories).toBe(250);
    });

    it('should allow product without nutrition info', async () => {
      const product = await Product.create({
        name: 'Test Product',
        slug: 'test-product',
        category: 'confectionary',
        description: 'Test description',
        price: 10,
        currency: 'GBP',
      });

      expect(product.nutritionInfo).toBeUndefined();
    });
  });
});
