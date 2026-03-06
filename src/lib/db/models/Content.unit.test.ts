import { describe, it, expect } from 'vitest';
import Content from './Content';

describe('Content Model - Unit Tests (No DB)', () => {
  describe('Schema Structure', () => {
    it('should have correct schema paths defined', () => {
      const schema = Content.schema;
      
      // Check required fields exist
      expect(schema.path('key')).toBeDefined();
      expect(schema.path('title')).toBeDefined();
      expect(schema.path('description')).toBeDefined();
      expect(schema.path('data')).toBeDefined();
    });

    it('should have correct field types', () => {
      const schema = Content.schema;
      
      expect(schema.path('key').instance).toBe('String');
      expect(schema.path('title').instance).toBe('String');
      expect(schema.path('description').instance).toBe('String');
      expect(schema.path('data').instance).toBe('Mixed');
    });

    it('should have required validators on mandatory fields', () => {
      const schema = Content.schema;
      
      expect(schema.path('key').isRequired).toBe(true);
      expect(schema.path('title').isRequired).toBe(true);
      expect(schema.path('description').isRequired).toBeFalsy();
      expect(schema.path('data').isRequired).toBe(true);
    });

    it('should have maxlength validator on title field', () => {
      const schema = Content.schema;
      const titlePath = schema.path('title') as any;
      
      expect(titlePath.validators).toBeDefined();
      const maxLengthValidator = titlePath.validators.find((v: any) => 
        v.type === 'maxlength'
      );
      expect(maxLengthValidator).toBeDefined();
      expect(maxLengthValidator.maxlength).toBe(200);
    });

    it('should have maxlength validator on description field', () => {
      const schema = Content.schema;
      const descriptionPath = schema.path('description') as any;
      
      expect(descriptionPath.validators).toBeDefined();
      const maxLengthValidator = descriptionPath.validators.find((v: any) => 
        v.type === 'maxlength'
      );
      expect(maxLengthValidator).toBeDefined();
      expect(maxLengthValidator.maxlength).toBe(500);
    });

    it('should have custom validator for key format', () => {
      const schema = Content.schema;
      const keyPath = schema.path('key') as any;
      
      const keyValidator = keyPath.validators.find((v: any) => 
        v.validator && typeof v.validator === 'function'
      );
      
      expect(keyValidator).toBeDefined();
    });
  });

  describe('Indexes', () => {
    it('should have unique index on key', () => {
      const schema = Content.schema;
      const keyPath = schema.path('key') as any;
      
      expect(keyPath.options.unique).toBe(true);
      expect(keyPath.options.index).toBe(true);
    });
  });

  describe('Timestamps', () => {
    it('should have timestamps enabled with updatedAt only', () => {
      const schema = Content.schema;
      
      expect(schema.options.timestamps).toBeDefined();
      expect((schema.options.timestamps as any).createdAt).toBe(false);
      expect((schema.options.timestamps as any).updatedAt).toBe(true);
    });
  });

  describe('Static Methods', () => {
    it('should have findByKey static method', () => {
      expect(Content.findByKey).toBeDefined();
      expect(typeof Content.findByKey).toBe('function');
    });

    it('should have upsertByKey static method', () => {
      expect(Content.upsertByKey).toBeDefined();
      expect(typeof Content.upsertByKey).toBe('function');
    });

    it('should have getAllKeys static method', () => {
      expect(Content.getAllKeys).toBeDefined();
      expect(typeof Content.getAllKeys).toBe('function');
    });
  });

  describe('Instance Methods', () => {
    it('should have getData instance method', () => {
      const content = new Content({
        key: 'homepage_hero',
        title: 'Homepage Hero',
        data: { heading: 'Welcome' },
      });
      
      expect(content.getData).toBeDefined();
      expect(typeof content.getData).toBe('function');
    });

    it('should have updateData instance method', () => {
      const content = new Content({
        key: 'homepage_hero',
        title: 'Homepage Hero',
        data: { heading: 'Welcome' },
      });
      
      expect(content.updateData).toBeDefined();
      expect(typeof content.updateData).toBe('function');
    });

    it('getData should return the data object', () => {
      const testData = { heading: 'Welcome', subheading: 'To our site' };
      const content = new Content({
        key: 'homepage_hero',
        title: 'Homepage Hero',
        data: testData,
      });
      
      expect(content.getData()).toEqual(testData);
    });

    it('updateData should merge new data with existing data', () => {
      const content = new Content({
        key: 'homepage_hero',
        title: 'Homepage Hero',
        data: { heading: 'Welcome', subheading: 'To our site' },
      });
      
      content.updateData({ heading: 'Hello' });
      
      expect(content.data.heading).toBe('Hello');
      expect(content.data.subheading).toBe('To our site');
    });
  });

  describe('Field Options', () => {
    it('should have lowercase option on key field', () => {
      const schema = Content.schema;
      const keyPath = schema.path('key') as any;
      
      expect(keyPath.options.lowercase).toBe(true);
    });

    it('should have trim option on key field', () => {
      const schema = Content.schema;
      const keyPath = schema.path('key') as any;
      
      expect(keyPath.options.trim).toBe(true);
    });

    it('should have trim option on title field', () => {
      const schema = Content.schema;
      const titlePath = schema.path('title') as any;
      
      expect(titlePath.options.trim).toBe(true);
    });

    it('should have trim option on description field', () => {
      const schema = Content.schema;
      const descriptionPath = schema.path('description') as any;
      
      expect(descriptionPath.options.trim).toBe(true);
    });

    it('should have default empty object for data field', () => {
      const schema = Content.schema;
      const dataPath = schema.path('data') as any;
      
      expect(dataPath.defaultValue).toBeDefined();
    });
  });

  describe('Data Field Flexibility', () => {
    it('should accept various data structures', () => {
      const content1 = new Content({
        key: 'homepage_hero',
        title: 'Homepage Hero',
        data: { heading: 'Welcome', subheading: 'To our site' },
      });
      
      const content2 = new Content({
        key: 'about_page',
        title: 'About Page',
        data: { story: 'Our story', values: ['Quality', 'Service'] },
      });
      
      expect(content1.data).toEqual({ heading: 'Welcome', subheading: 'To our site' });
      expect(content2.data).toEqual({ story: 'Our story', values: ['Quality', 'Service'] });
    });

    it('should handle nested objects in data field', () => {
      const content = new Content({
        key: 'complex_content',
        title: 'Complex Content',
        data: {
          section1: { title: 'Section 1', items: ['a', 'b'] },
          section2: { title: 'Section 2', count: 5 },
        },
      });
      
      expect(content.data.section1.title).toBe('Section 1');
      expect(content.data.section2.count).toBe(5);
    });
  });
});
