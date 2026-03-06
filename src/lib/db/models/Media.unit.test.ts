import { describe, it, expect } from 'vitest';
import Media from './Media';

describe('Media Model - Unit Tests (No DB)', () => {
  describe('Schema Structure', () => {
    it('should have correct schema paths defined', () => {
      const schema = Media.schema;
      
      // Check required fields exist
      expect(schema.path('cloudinaryId')).toBeDefined();
      expect(schema.path('url')).toBeDefined();
      expect(schema.path('secureUrl')).toBeDefined();
      expect(schema.path('type')).toBeDefined();
      expect(schema.path('altText')).toBeDefined();
      expect(schema.path('width')).toBeDefined();
      expect(schema.path('height')).toBeDefined();
      expect(schema.path('format')).toBeDefined();
    });

    it('should have correct field types', () => {
      const schema = Media.schema;
      
      expect(schema.path('cloudinaryId').instance).toBe('String');
      expect(schema.path('url').instance).toBe('String');
      expect(schema.path('secureUrl').instance).toBe('String');
      expect(schema.path('type').instance).toBe('String');
      expect(schema.path('altText').instance).toBe('String');
      expect(schema.path('width').instance).toBe('Number');
      expect(schema.path('height').instance).toBe('Number');
      expect(schema.path('format').instance).toBe('String');
    });

    it('should have required validators on mandatory fields', () => {
      const schema = Media.schema;
      
      expect(schema.path('cloudinaryId').isRequired).toBe(true);
      expect(schema.path('url').isRequired).toBe(true);
      expect(schema.path('secureUrl').isRequired).toBe(true);
      expect(schema.path('type').isRequired).toBe(true);
      expect(schema.path('altText').isRequired).toBe(true);
      expect(schema.path('width').isRequired).toBe(true);
      expect(schema.path('height').isRequired).toBe(true);
      expect(schema.path('format').isRequired).toBe(true);
    });

    it('should have enum validator on type field', () => {
      const schema = Media.schema;
      const typePath = schema.path('type') as any;
      
      expect(typePath.enumValues).toContain('hero');
      expect(typePath.enumValues).toContain('carousel');
      expect(typePath.enumValues).toContain('product');
      expect(typePath.enumValues).toContain('category');
      expect(typePath.enumValues).toHaveLength(4);
    });

    it('should have min validator on width field', () => {
      const schema = Media.schema;
      const widthPath = schema.path('width') as any;
      
      expect(widthPath.validators).toBeDefined();
      const minValidator = widthPath.validators.find((v: any) => 
        v.type === 'min'
      );
      expect(minValidator).toBeDefined();
      expect(minValidator.min).toBe(1);
    });

    it('should have min validator on height field', () => {
      const schema = Media.schema;
      const heightPath = schema.path('height') as any;
      
      expect(heightPath.validators).toBeDefined();
      const minValidator = heightPath.validators.find((v: any) => 
        v.type === 'min'
      );
      expect(minValidator).toBeDefined();
      expect(minValidator.min).toBe(1);
    });

    it('should have maxlength validator on altText field', () => {
      const schema = Media.schema;
      const altTextPath = schema.path('altText') as any;
      
      expect(altTextPath.validators).toBeDefined();
      const maxLengthValidator = altTextPath.validators.find((v: any) => 
        v.type === 'maxlength'
      );
      expect(maxLengthValidator).toBeDefined();
      expect(maxLengthValidator.maxlength).toBe(500);
    });
  });

  describe('Indexes', () => {
    it('should have unique index on cloudinaryId', () => {
      const schema = Media.schema;
      const cloudinaryIdPath = schema.path('cloudinaryId') as any;
      
      expect(cloudinaryIdPath.options.unique).toBe(true);
      expect(cloudinaryIdPath.options.index).toBe(true);
    });

    it('should have index on type', () => {
      const schema = Media.schema;
      const typePath = schema.path('type') as any;
      
      expect(typePath.options.index).toBe(true);
    });

    it('should have descending index on createdAt', () => {
      const indexes = Media.schema.indexes();
      const createdAtIndex = indexes.find(
        (idx) => idx[0].createdAt !== undefined
      );
      
      expect(createdAtIndex).toBeDefined();
      expect(createdAtIndex![0]).toEqual({ createdAt: -1 });
    });

    it('should have compound index for type and createdAt', () => {
      const indexes = Media.schema.indexes();
      const compoundIndex = indexes.find(
        (idx) => idx[0].type !== undefined && idx[0].createdAt !== undefined
      );
      
      expect(compoundIndex).toBeDefined();
      expect(compoundIndex![0]).toEqual({ type: 1, createdAt: -1 });
    });
  });

  describe('Timestamps', () => {
    it('should have timestamps enabled with createdAt only', () => {
      const schema = Media.schema;
      
      expect(schema.options.timestamps).toBeDefined();
      expect((schema.options.timestamps as any).createdAt).toBe(true);
      expect((schema.options.timestamps as any).updatedAt).toBe(false);
    });
  });

  describe('Static Methods', () => {
    it('should have getByType static method', () => {
      expect(Media.getByType).toBeDefined();
      expect(typeof Media.getByType).toBe('function');
    });

    it('should have findByCloudinaryId static method', () => {
      expect(Media.findByCloudinaryId).toBeDefined();
      expect(typeof Media.findByCloudinaryId).toBe('function');
    });
  });

  describe('Instance Methods', () => {
    it('should have isHeroImage instance method', () => {
      const media = new Media({
        cloudinaryId: 'test-id',
        url: 'http://example.com/image.jpg',
        secureUrl: 'https://example.com/image.jpg',
        type: 'hero',
        altText: 'Test image',
        width: 800,
        height: 600,
        format: 'jpg',
      });
      
      expect(media.isHeroImage).toBeDefined();
      expect(typeof media.isHeroImage).toBe('function');
    });

    it('should have isCarouselImage instance method', () => {
      const media = new Media({
        cloudinaryId: 'test-id',
        url: 'http://example.com/image.jpg',
        secureUrl: 'https://example.com/image.jpg',
        type: 'carousel',
        altText: 'Test image',
        width: 800,
        height: 600,
        format: 'jpg',
      });
      
      expect(media.isCarouselImage).toBeDefined();
      expect(typeof media.isCarouselImage).toBe('function');
    });

    it('should have isProductImage instance method', () => {
      const media = new Media({
        cloudinaryId: 'test-id',
        url: 'http://example.com/image.jpg',
        secureUrl: 'https://example.com/image.jpg',
        type: 'product',
        altText: 'Test image',
        width: 800,
        height: 600,
        format: 'jpg',
      });
      
      expect(media.isProductImage).toBeDefined();
      expect(typeof media.isProductImage).toBe('function');
    });

    it('should have isCategoryImage instance method', () => {
      const media = new Media({
        cloudinaryId: 'test-id',
        url: 'http://example.com/image.jpg',
        secureUrl: 'https://example.com/image.jpg',
        type: 'category',
        altText: 'Test image',
        width: 800,
        height: 600,
        format: 'jpg',
      });
      
      expect(media.isCategoryImage).toBeDefined();
      expect(typeof media.isCategoryImage).toBe('function');
    });

    it('isHeroImage should return correct value based on type', () => {
      const heroMedia = new Media({
        cloudinaryId: 'test-id',
        url: 'http://example.com/image.jpg',
        secureUrl: 'https://example.com/image.jpg',
        type: 'hero',
        altText: 'Test image',
        width: 800,
        height: 600,
        format: 'jpg',
      });
      
      const productMedia = new Media({
        cloudinaryId: 'test-id-2',
        url: 'http://example.com/image2.jpg',
        secureUrl: 'https://example.com/image2.jpg',
        type: 'product',
        altText: 'Test image 2',
        width: 800,
        height: 600,
        format: 'jpg',
      });
      
      expect(heroMedia.isHeroImage()).toBe(true);
      expect(productMedia.isHeroImage()).toBe(false);
    });

    it('isCarouselImage should return correct value based on type', () => {
      const carouselMedia = new Media({
        cloudinaryId: 'test-id',
        url: 'http://example.com/image.jpg',
        secureUrl: 'https://example.com/image.jpg',
        type: 'carousel',
        altText: 'Test image',
        width: 800,
        height: 600,
        format: 'jpg',
      });
      
      const heroMedia = new Media({
        cloudinaryId: 'test-id-2',
        url: 'http://example.com/image2.jpg',
        secureUrl: 'https://example.com/image2.jpg',
        type: 'hero',
        altText: 'Test image 2',
        width: 800,
        height: 600,
        format: 'jpg',
      });
      
      expect(carouselMedia.isCarouselImage()).toBe(true);
      expect(heroMedia.isCarouselImage()).toBe(false);
    });

    it('isProductImage should return correct value based on type', () => {
      const productMedia = new Media({
        cloudinaryId: 'test-id',
        url: 'http://example.com/image.jpg',
        secureUrl: 'https://example.com/image.jpg',
        type: 'product',
        altText: 'Test image',
        width: 800,
        height: 600,
        format: 'jpg',
      });
      
      const categoryMedia = new Media({
        cloudinaryId: 'test-id-2',
        url: 'http://example.com/image2.jpg',
        secureUrl: 'https://example.com/image2.jpg',
        type: 'category',
        altText: 'Test image 2',
        width: 800,
        height: 600,
        format: 'jpg',
      });
      
      expect(productMedia.isProductImage()).toBe(true);
      expect(categoryMedia.isProductImage()).toBe(false);
    });

    it('isCategoryImage should return correct value based on type', () => {
      const categoryMedia = new Media({
        cloudinaryId: 'test-id',
        url: 'http://example.com/image.jpg',
        secureUrl: 'https://example.com/image.jpg',
        type: 'category',
        altText: 'Test image',
        width: 800,
        height: 600,
        format: 'jpg',
      });
      
      const carouselMedia = new Media({
        cloudinaryId: 'test-id-2',
        url: 'http://example.com/image2.jpg',
        secureUrl: 'https://example.com/image2.jpg',
        type: 'carousel',
        altText: 'Test image 2',
        width: 800,
        height: 600,
        format: 'jpg',
      });
      
      expect(categoryMedia.isCategoryImage()).toBe(true);
      expect(carouselMedia.isCategoryImage()).toBe(false);
    });
  });

  describe('Validation Rules', () => {
    it('should have custom validator for URL format', () => {
      const schema = Media.schema;
      const urlPath = schema.path('url') as any;
      
      const urlValidator = urlPath.validators.find((v: any) => 
        v.validator && typeof v.validator === 'function'
      );
      
      expect(urlValidator).toBeDefined();
    });

    it('should have custom validator for HTTPS secure URL', () => {
      const schema = Media.schema;
      const secureUrlPath = schema.path('secureUrl') as any;
      
      const httpsValidator = secureUrlPath.validators.find((v: any) => 
        v.validator && typeof v.validator === 'function'
      );
      
      expect(httpsValidator).toBeDefined();
    });
  });
});
