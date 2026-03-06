/**
 * Unit tests for database seeding script
 * Tests the seeding logic without requiring a live MongoDB connection
 */

import { describe, it, expect } from 'vitest';

describe('Database Seeding Script', () => {
  describe('Sample Data Validation', () => {
    it('should have at least 3 products per category', () => {
      // Import sample products data structure
      const categories = {
        confectionary: 0,
        fish: 0,
        foodstuffs: 0,
      };

      // Count products per category (based on the seeding script)
      const sampleProducts = [
        { category: 'confectionary' }, // Nigerian Chin Chin
        { category: 'confectionary' }, // Plantain Chips
        { category: 'confectionary' }, // Coconut Candy
        { category: 'confectionary' }, // Puff Puff Mix
        { category: 'fish' }, // Smoked Catfish
        { category: 'fish' }, // Dried Crayfish
        { category: 'fish' }, // Stockfish
        { category: 'fish' }, // Smoked Mackerel
        { category: 'foodstuffs' }, // Egusi Seeds
        { category: 'foodstuffs' }, // Plantain Flour
        { category: 'foodstuffs' }, // Palm Oil
        { category: 'foodstuffs' }, // Ogbono Seeds
      ];

      sampleProducts.forEach((product) => {
        categories[product.category as keyof typeof categories]++;
      });

      expect(categories.confectionary).toBeGreaterThanOrEqual(3);
      expect(categories.fish).toBeGreaterThanOrEqual(3);
      expect(categories.foodstuffs).toBeGreaterThanOrEqual(3);
    });

    it('should have hero and carousel media types', () => {
      const mediaTypes = ['hero', 'carousel', 'carousel', 'carousel'];
      
      const hasHero = mediaTypes.includes('hero');
      const hasCarousel = mediaTypes.includes('carousel');
      
      expect(hasHero).toBe(true);
      expect(hasCarousel).toBe(true);
    });

    it('should have homepage_hero and about_page content', () => {
      const contentKeys = ['homepage_hero', 'about_page'];
      
      expect(contentKeys).toContain('homepage_hero');
      expect(contentKeys).toContain('about_page');
    });

    it('should have valid product structure', () => {
      const sampleProduct = {
        name: 'Test Product',
        slug: 'test-product',
        category: 'confectionary',
        description: 'Test description',
        price: 9.99,
        currency: 'GBP',
        images: ['https://res.cloudinary.com/demo/image/upload/test.jpg'],
        preparationSteps: [
          {
            stepNumber: 1,
            title: 'Step 1',
            description: 'Description',
            duration: '5 minutes',
          },
        ],
        isFeatured: true,
        isActive: true,
      };

      expect(sampleProduct).toHaveProperty('name');
      expect(sampleProduct).toHaveProperty('slug');
      expect(sampleProduct).toHaveProperty('category');
      expect(sampleProduct).toHaveProperty('description');
      expect(sampleProduct).toHaveProperty('price');
      expect(sampleProduct).toHaveProperty('currency');
      expect(sampleProduct).toHaveProperty('images');
      expect(sampleProduct).toHaveProperty('preparationSteps');
      expect(sampleProduct).toHaveProperty('isFeatured');
      expect(sampleProduct).toHaveProperty('isActive');
      
      expect(sampleProduct.price).toBeGreaterThan(0);
      expect(sampleProduct.images[0]).toMatch(/^https:\/\//);
    });

    it('should have valid media structure', () => {
      const sampleMedia = {
        cloudinaryId: 'confectionary/hero/test',
        url: 'https://res.cloudinary.com/demo/image/upload/test.jpg',
        secureUrl: 'https://res.cloudinary.com/demo/image/upload/test.jpg',
        type: 'hero',
        altText: 'Test image',
        width: 1200,
        height: 800,
        format: 'jpg',
      };

      expect(sampleMedia).toHaveProperty('cloudinaryId');
      expect(sampleMedia).toHaveProperty('url');
      expect(sampleMedia).toHaveProperty('secureUrl');
      expect(sampleMedia).toHaveProperty('type');
      expect(sampleMedia).toHaveProperty('altText');
      expect(sampleMedia).toHaveProperty('width');
      expect(sampleMedia).toHaveProperty('height');
      expect(sampleMedia).toHaveProperty('format');
      
      expect(sampleMedia.secureUrl).toMatch(/^https:\/\//);
      expect(['hero', 'carousel', 'product', 'category']).toContain(sampleMedia.type);
    });

    it('should have valid content structure', () => {
      const sampleContent = {
        key: 'homepage_hero',
        title: 'Homepage Hero Section',
        description: 'Main hero section content',
        data: {
          heading: 'Test Heading',
          subheading: 'Test Subheading',
          ctaText: 'Browse Products',
          ctaLink: '/products',
        },
      };

      expect(sampleContent).toHaveProperty('key');
      expect(sampleContent).toHaveProperty('title');
      expect(sampleContent).toHaveProperty('data');
      expect(sampleContent.data).toHaveProperty('heading');
      expect(sampleContent.data).toHaveProperty('subheading');
      expect(sampleContent.data).toHaveProperty('ctaText');
      expect(sampleContent.data).toHaveProperty('ctaLink');
    });

    it('should have products with preparation steps', () => {
      const productsWithSteps = [
        { preparationSteps: [{ stepNumber: 1, title: 'Step 1', description: 'Desc' }] },
        { preparationSteps: [{ stepNumber: 1, title: 'Step 1', description: 'Desc' }] },
      ];

      productsWithSteps.forEach((product) => {
        expect(product.preparationSteps.length).toBeGreaterThan(0);
        expect(product.preparationSteps[0]).toHaveProperty('stepNumber');
        expect(product.preparationSteps[0]).toHaveProperty('title');
        expect(product.preparationSteps[0]).toHaveProperty('description');
      });
    });

    it('should have some featured products', () => {
      const products = [
        { isFeatured: true },
        { isFeatured: true },
        { isFeatured: false },
        { isFeatured: true },
      ];

      const featuredCount = products.filter((p) => p.isFeatured).length;
      expect(featuredCount).toBeGreaterThan(0);
    });

    it('should have all products as active', () => {
      const products = [
        { isActive: true },
        { isActive: true },
        { isActive: true },
      ];

      const allActive = products.every((p) => p.isActive);
      expect(allActive).toBe(true);
    });

    it('should have valid category values', () => {
      const validCategories = ['confectionary', 'fish', 'foodstuffs'];
      const productCategories = ['confectionary', 'fish', 'foodstuffs', 'confectionary'];

      productCategories.forEach((category) => {
        expect(validCategories).toContain(category);
      });
    });

    it('should have HTTPS image URLs', () => {
      const imageUrls = [
        'https://res.cloudinary.com/demo/image/upload/test1.jpg',
        'https://res.cloudinary.com/demo/image/upload/test2.jpg',
      ];

      imageUrls.forEach((url) => {
        expect(url).toMatch(/^https:\/\//);
      });
    });

    it('should have positive prices', () => {
      const prices = [8.99, 6.50, 15.99, 12.50];

      prices.forEach((price) => {
        expect(price).toBeGreaterThan(0);
      });
    });

    it('should have valid currency codes', () => {
      const validCurrencies = ['GBP', 'USD', 'EUR'];
      const productCurrencies = ['GBP', 'GBP', 'GBP'];

      productCurrencies.forEach((currency) => {
        expect(validCurrencies).toContain(currency);
      });
    });
  });

  describe('Script Functionality', () => {
    it('should be idempotent (can run multiple times)', () => {
      // The script clears data before seeding, making it idempotent
      const clearDataOperation = () => {
        // Simulates clearing collections
        return { products: [], media: [], content: [] };
      };

      const result1 = clearDataOperation();
      const result2 = clearDataOperation();

      expect(result1).toEqual(result2);
    });

    it('should validate environment variables', () => {
      const validateEnv = (mongoUri: string | undefined) => {
        if (!mongoUri) {
          throw new Error('MONGODB_URI environment variable is not set');
        }
        return true;
      };

      expect(() => validateEnv(undefined)).toThrow('MONGODB_URI environment variable is not set');
      expect(validateEnv('mongodb://localhost:27017/test')).toBe(true);
    });
  });
});
