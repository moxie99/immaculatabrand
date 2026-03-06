import { describe, it, expect } from 'vitest';
import Product from './Product';

describe('Product Model - Unit Tests (No DB)', () => {
  describe('Schema Structure', () => {
    it('should have correct schema paths defined', () => {
      const schema = Product.schema;
      
      // Check required fields exist
      expect(schema.path('name')).toBeDefined();
      expect(schema.path('slug')).toBeDefined();
      expect(schema.path('category')).toBeDefined();
      expect(schema.path('description')).toBeDefined();
      expect(schema.path('price')).toBeDefined();
      expect(schema.path('currency')).toBeDefined();
      expect(schema.path('images')).toBeDefined();
      expect(schema.path('preparationSteps')).toBeDefined();
      // nutritionInfo is a nested object, check its sub-paths instead
      expect(schema.path('nutritionInfo.servingSize')).toBeDefined();
      expect(schema.path('isFeatured')).toBeDefined();
      expect(schema.path('isActive')).toBeDefined();
    });

    it('should have correct field types', () => {
      const schema = Product.schema;
      
      expect(schema.path('name').instance).toBe('String');
      expect(schema.path('slug').instance).toBe('String');
      expect(schema.path('category').instance).toBe('String');
      expect(schema.path('description').instance).toBe('String');
      expect(schema.path('price').instance).toBe('Number');
      expect(schema.path('currency').instance).toBe('String');
      expect(schema.path('images').instance).toBe('Array');
      expect(schema.path('isFeatured').instance).toBe('Boolean');
      expect(schema.path('isActive').instance).toBe('Boolean');
    });

    it('should have required validators on mandatory fields', () => {
      const schema = Product.schema;
      
      expect(schema.path('name').isRequired).toBe(true);
      expect(schema.path('slug').isRequired).toBe(true);
      expect(schema.path('category').isRequired).toBe(true);
      expect(schema.path('description').isRequired).toBe(true);
      expect(schema.path('price').isRequired).toBe(true);
      expect(schema.path('currency').isRequired).toBe(true);
    });

    it('should have enum validator on category field', () => {
      const schema = Product.schema;
      const categoryPath = schema.path('category') as any;
      
      expect(categoryPath.enumValues).toContain('confectionary');
      expect(categoryPath.enumValues).toContain('fish');
      expect(categoryPath.enumValues).toContain('foodstuffs');
      expect(categoryPath.enumValues).toHaveLength(3);
    });

    it('should have enum validator on currency field', () => {
      const schema = Product.schema;
      const currencyPath = schema.path('currency') as any;
      
      expect(currencyPath.enumValues).toContain('GBP');
      expect(currencyPath.enumValues).toContain('USD');
      expect(currencyPath.enumValues).toContain('EUR');
    });

    it('should have min validator on price field', () => {
      const schema = Product.schema;
      const pricePath = schema.path('price') as any;
      
      expect(pricePath.validators).toBeDefined();
      const minValidator = pricePath.validators.find((v: any) => 
        v.type === 'min'
      );
      expect(minValidator).toBeDefined();
      expect(minValidator.min).toBe(0);
    });

    it('should have default values for boolean fields', () => {
      const schema = Product.schema;
      
      expect(schema.path('isFeatured').defaultValue).toBe(false);
      expect(schema.path('isActive').defaultValue).toBe(true);
    });

    it('should have default value for currency', () => {
      const schema = Product.schema;
      
      expect(schema.path('currency').defaultValue).toBe('GBP');
    });
  });

  describe('Indexes', () => {
    it('should have unique index on slug', () => {
      const schema = Product.schema;
      const slugPath = schema.path('slug') as any;
      
      expect(slugPath.options.unique).toBe(true);
      expect(slugPath.options.index).toBe(true);
    });

    it('should have index on category', () => {
      const schema = Product.schema;
      const categoryPath = schema.path('category') as any;
      
      expect(categoryPath.options.index).toBe(true);
    });

    it('should have indexes on isFeatured and isActive', () => {
      const schema = Product.schema;
      
      expect((schema.path('isFeatured') as any).options.index).toBe(true);
      expect((schema.path('isActive') as any).options.index).toBe(true);
    });

    it('should have compound index for isFeatured and isActive', () => {
      const indexes = Product.schema.indexes();
      const compoundIndex = indexes.find(
        (idx) => idx[0].isFeatured !== undefined && idx[0].isActive !== undefined
      );
      
      expect(compoundIndex).toBeDefined();
      expect(compoundIndex![0]).toEqual({ isFeatured: 1, isActive: 1 });
    });

    it('should have text index on name field', () => {
      const indexes = Product.schema.indexes();
      const textIndex = indexes.find((idx) => idx[0].name === 'text');
      
      expect(textIndex).toBeDefined();
    });
  });

  describe('Preparation Steps Schema', () => {
    it('should have preparation steps subdocument schema', () => {
      const schema = Product.schema;
      const prepStepsPath = schema.path('preparationSteps') as any;
      
      expect(prepStepsPath).toBeDefined();
      expect(prepStepsPath.schema).toBeDefined();
    });

    it('should have required fields in preparation steps', () => {
      const schema = Product.schema;
      const prepStepsPath = schema.path('preparationSteps') as any;
      const subSchema = prepStepsPath.schema;
      
      expect(subSchema.path('stepNumber').isRequired).toBe(true);
      expect(subSchema.path('title').isRequired).toBe(true);
      expect(subSchema.path('description').isRequired).toBe(true);
    });

    it('should have optional fields in preparation steps', () => {
      const schema = Product.schema;
      const prepStepsPath = schema.path('preparationSteps') as any;
      const subSchema = prepStepsPath.schema;
      
      expect(subSchema.path('imageUrl')).toBeDefined();
      expect(subSchema.path('duration')).toBeDefined();
      // Optional fields don't have isRequired set to false, they just don't have it set to true
      expect(subSchema.path('imageUrl').isRequired).not.toBe(true);
      expect(subSchema.path('duration').isRequired).not.toBe(true);
    });
  });

  describe('Nutrition Info Schema', () => {
    it('should have nutrition info subdocument schema', () => {
      const schema = Product.schema;
      
      // nutritionInfo is a nested object, check its sub-paths
      expect(schema.path('nutritionInfo.servingSize')).toBeDefined();
      expect(schema.path('nutritionInfo.calories')).toBeDefined();
    });

    it('should have all nutrition fields defined', () => {
      const schema = Product.schema;
      
      expect(schema.path('nutritionInfo.servingSize')).toBeDefined();
      expect(schema.path('nutritionInfo.calories')).toBeDefined();
      expect(schema.path('nutritionInfo.protein')).toBeDefined();
      expect(schema.path('nutritionInfo.carbs')).toBeDefined();
      expect(schema.path('nutritionInfo.fat')).toBeDefined();
    });

    it('should have correct types for nutrition fields', () => {
      const schema = Product.schema;
      
      expect(schema.path('nutritionInfo.servingSize').instance).toBe('String');
      expect(schema.path('nutritionInfo.calories').instance).toBe('Number');
      expect(schema.path('nutritionInfo.protein').instance).toBe('String');
      expect(schema.path('nutritionInfo.carbs').instance).toBe('String');
      expect(schema.path('nutritionInfo.fat').instance).toBe('String');
    });
  });

  describe('Timestamps', () => {
    it('should have timestamps enabled', () => {
      const schema = Product.schema;
      
      expect(schema.options.timestamps).toBe(true);
    });
  });

  describe('Static Methods', () => {
    it('should have generateUniqueSlug static method', () => {
      expect(Product.generateUniqueSlug).toBeDefined();
      expect(typeof Product.generateUniqueSlug).toBe('function');
    });
  });

  describe('Instance Methods', () => {
    it('should have isVisibleToPublic instance method', () => {
      const product = new Product({
        name: 'Test',
        slug: 'test',
        category: 'confectionary',
        description: 'Test',
        price: 10,
      });
      
      expect(product.isVisibleToPublic).toBeDefined();
      expect(typeof product.isVisibleToPublic).toBe('function');
    });

    it('should have shouldShowOnHomepage instance method', () => {
      const product = new Product({
        name: 'Test',
        slug: 'test',
        category: 'confectionary',
        description: 'Test',
        price: 10,
      });
      
      expect(product.shouldShowOnHomepage).toBeDefined();
      expect(typeof product.shouldShowOnHomepage).toBe('function');
    });

    it('isVisibleToPublic should return correct value based on isActive', () => {
      const activeProduct = new Product({
        name: 'Test',
        slug: 'test',
        category: 'confectionary',
        description: 'Test',
        price: 10,
        isActive: true,
      });
      
      const inactiveProduct = new Product({
        name: 'Test',
        slug: 'test',
        category: 'confectionary',
        description: 'Test',
        price: 10,
        isActive: false,
      });
      
      expect(activeProduct.isVisibleToPublic()).toBe(true);
      expect(inactiveProduct.isVisibleToPublic()).toBe(false);
    });

    it('shouldShowOnHomepage should return correct value based on isFeatured and isActive', () => {
      const homepageProduct = new Product({
        name: 'Test',
        slug: 'test',
        category: 'confectionary',
        description: 'Test',
        price: 10,
        isFeatured: true,
        isActive: true,
      });
      
      const notFeatured = new Product({
        name: 'Test',
        slug: 'test',
        category: 'confectionary',
        description: 'Test',
        price: 10,
        isFeatured: false,
        isActive: true,
      });
      
      const inactive = new Product({
        name: 'Test',
        slug: 'test',
        category: 'confectionary',
        description: 'Test',
        price: 10,
        isFeatured: true,
        isActive: false,
      });
      
      expect(homepageProduct.shouldShowOnHomepage()).toBe(true);
      expect(notFeatured.shouldShowOnHomepage()).toBe(false);
      expect(inactive.shouldShowOnHomepage()).toBe(false);
    });
  });

  describe('Slug Generation Logic', () => {
    it('should have pre-save hook for slug generation', () => {
      const schema = Product.schema;
      const preSaveHooks = schema.s.hooks._pres.get('save');
      
      expect(preSaveHooks).toBeDefined();
      expect(preSaveHooks.length).toBeGreaterThan(0);
    });
  });

  describe('Validation Rules', () => {
    it('should have custom validator for price greater than zero', () => {
      const schema = Product.schema;
      const pricePath = schema.path('price') as any;
      
      const customValidator = pricePath.validators.find((v: any) => 
        v.validator && v.validator.name === 'validator'
      );
      
      expect(customValidator).toBeDefined();
    });

    it('should have custom validator for HTTPS image URLs', () => {
      const schema = Product.schema;
      const imagesPath = schema.path('images') as any;
      
      const httpsValidator = imagesPath.validators.find((v: any) => 
        v.validator && typeof v.validator === 'function'
      );
      
      expect(httpsValidator).toBeDefined();
    });
  });
});
