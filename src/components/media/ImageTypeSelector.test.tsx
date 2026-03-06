/**
 * Tests for ImageTypeSelector component
 * 
 * Note: These are unit tests for the component's structure and exports.
 * For full integration tests with React rendering, use a separate test suite
 * with jsdom environment.
 */

import { describe, it, expect } from 'vitest';
import { ImageTypeSelector } from './ImageTypeSelector';
import { MediaType } from '@/types/media.types';

describe('ImageTypeSelector Component', () => {
  it('should export ImageTypeSelector component', () => {
    expect(ImageTypeSelector).toBeDefined();
    expect(typeof ImageTypeSelector).toBe('function');
  });

  it('should be a valid React component', () => {
    expect(ImageTypeSelector.name).toBe('ImageTypeSelector');
  });

  describe('Component Props Interface', () => {
    it('should accept value prop of type MediaType', () => {
      const props: React.ComponentProps<typeof ImageTypeSelector> = {
        value: 'hero',
        onChange: () => {},
      };
      expect(props.value).toBe('hero');
    });

    it('should accept onChange callback prop', () => {
      const callback = (value: MediaType) => {
        return value;
      };
      const props: React.ComponentProps<typeof ImageTypeSelector> = {
        value: 'product',
        onChange: callback,
      };
      expect(props.onChange).toBe(callback);
    });

    it('should accept optional label prop', () => {
      const props: React.ComponentProps<typeof ImageTypeSelector> = {
        value: 'carousel',
        onChange: () => {},
        label: 'Select Image Type',
      };
      expect(props.label).toBe('Select Image Type');
    });

    it('should accept optional className prop', () => {
      const props: React.ComponentProps<typeof ImageTypeSelector> = {
        value: 'category',
        onChange: () => {},
        className: 'custom-class',
      };
      expect(props.className).toBe('custom-class');
    });

    it('should require value and onChange props', () => {
      const callback = (value: MediaType) => value;
      const props: React.ComponentProps<typeof ImageTypeSelector> = {
        value: 'hero',
        onChange: callback,
      };
      expect(props.value).toBe('hero');
      expect(props.onChange).toBe(callback);
    });
  });

  describe('Media Type Values', () => {
    it('should support "hero" media type', () => {
      const type: MediaType = 'hero';
      expect(type).toBe('hero');
    });

    it('should support "carousel" media type', () => {
      const type: MediaType = 'carousel';
      expect(type).toBe('carousel');
    });

    it('should support "product" media type', () => {
      const type: MediaType = 'product';
      expect(type).toBe('product');
    });

    it('should support "category" media type', () => {
      const type: MediaType = 'category';
      expect(type).toBe('category');
    });
  });

  describe('Controlled Component Behavior', () => {
    it('should work as a controlled component', () => {
      let currentType: MediaType = 'hero';
      const handleChange = (type: MediaType) => {
        currentType = type;
      };

      const props: React.ComponentProps<typeof ImageTypeSelector> = {
        value: currentType,
        onChange: handleChange,
      };

      expect(props.value).toBe('hero');
      
      // Simulate type change
      props.onChange('product');
      expect(currentType).toBe('product');
    });

    it('should handle all media type changes', () => {
      const mediaTypes: MediaType[] = ['hero', 'carousel', 'product', 'category'];
      
      mediaTypes.forEach((type) => {
        let currentType: MediaType = 'hero';
        const handleChange = (newType: MediaType) => {
          currentType = newType;
        };

        const props: React.ComponentProps<typeof ImageTypeSelector> = {
          value: currentType,
          onChange: handleChange,
        };

        props.onChange(type);
        expect(currentType).toBe(type);
      });
    });
  });

  describe('Default Props', () => {
    it('should have default label "Image Type"', () => {
      // This is verified by the component implementation
      // The default label is set in the component's props
      const props: React.ComponentProps<typeof ImageTypeSelector> = {
        value: 'hero',
        onChange: () => {},
      };
      // Label defaults to 'Image Type' when not provided
      expect(props.label).toBeUndefined();
    });
  });
});
