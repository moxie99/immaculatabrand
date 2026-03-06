/**
 * Content Service Tests
 * Unit tests for content service layer
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as contentService from './content.service';
import Content from '../db/models/Content';
import { NotFoundError, ValidationError } from '../utils/errors';
import { ContentInput } from '../../types/content.types';

// Mock dependencies
vi.mock('../db/mongodb', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../db/models/Content');

describe('Content Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getContentByKey', () => {
    it('should return content when found', async () => {
      const mockContent = {
        _id: '507f1f77bcf86cd799439011',
        key: 'homepage_hero',
        title: 'Homepage Hero Section',
        data: {
          heading: 'Authentic African Delicacies',
          subheading: 'Delivered to Your Doorstep',
        },
      };

      vi.mocked(Content.findByKey).mockResolvedValue(mockContent as any);

      const result = await contentService.getContentByKey('homepage_hero');

      expect(result.key).toBe('homepage_hero');
      expect(result.title).toBe('Homepage Hero Section');
      expect(Content.findByKey).toHaveBeenCalledWith('homepage_hero');
    });

    it('should throw NotFoundError when content not found', async () => {
      vi.mocked(Content.findByKey).mockResolvedValue(null);

      await expect(
        contentService.getContentByKey('nonexistent_key')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateContent', () => {
    it('should update existing content', async () => {
      const input: ContentInput = {
        key: 'homepage_hero',
        title: 'Updated Hero Section',
        data: {
          heading: 'New Heading',
          subheading: 'New Subheading',
        },
        description: 'Updated description',
      };

      const mockContent = {
        _id: '507f1f77bcf86cd799439011',
        ...input,
        updatedAt: new Date(),
      };

      vi.mocked(Content.upsertByKey).mockResolvedValue(mockContent as any);

      const result = await contentService.updateContent(input);

      expect(result.key).toBe('homepage_hero');
      expect(result.title).toBe('Updated Hero Section');
      expect(Content.upsertByKey).toHaveBeenCalledWith(
        input.key,
        input.title,
        input.data,
        input.description
      );
    });

    it('should create new content if it does not exist', async () => {
      const input: ContentInput = {
        key: 'new_content',
        title: 'New Content',
        data: { text: 'Some content' },
      };

      const mockContent = {
        _id: '507f1f77bcf86cd799439012',
        ...input,
        updatedAt: new Date(),
      };

      vi.mocked(Content.upsertByKey).mockResolvedValue(mockContent as any);

      const result = await contentService.updateContent(input);

      expect(result.key).toBe('new_content');
      expect(result.title).toBe('New Content');
    });

    it('should throw ValidationError for invalid content data', async () => {
      const input: ContentInput = {
        key: 'invalid key with spaces',
        title: 'Invalid Content',
        data: {},
      };

      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      vi.mocked(Content.upsertByKey).mockRejectedValue(validationError);

      await expect(contentService.updateContent(input)).rejects.toThrow(
        ValidationError
      );
    });
  });

  describe('getAllContent', () => {
    it('should return all content records', async () => {
      const mockContent = [
        { key: 'homepage_hero', title: 'Homepage Hero' },
        { key: 'about_page', title: 'About Page' },
      ];

      vi.mocked(Content.find).mockReturnValue({
        sort: vi.fn().mockResolvedValue(mockContent),
      } as any);

      const result = await contentService.getAllContent();

      expect(result).toHaveLength(2);
      expect(result[0].key).toBe('homepage_hero');
      expect(result[1].key).toBe('about_page');
    });

    it('should return empty array when no content exists', async () => {
      vi.mocked(Content.find).mockReturnValue({
        sort: vi.fn().mockResolvedValue([]),
      } as any);

      const result = await contentService.getAllContent();

      expect(result).toHaveLength(0);
    });
  });

  describe('getAllContentKeys', () => {
    it('should return all content keys', async () => {
      const mockKeys = ['homepage_hero', 'about_page', 'contact_page'];

      vi.mocked(Content.getAllKeys).mockResolvedValue(mockKeys);

      const result = await contentService.getAllContentKeys();

      expect(result).toHaveLength(3);
      expect(result).toContain('homepage_hero');
      expect(result).toContain('about_page');
    });

    it('should return empty array when no content exists', async () => {
      vi.mocked(Content.getAllKeys).mockResolvedValue([]);

      const result = await contentService.getAllContentKeys();

      expect(result).toHaveLength(0);
    });
  });

  describe('initializeDefaultContent', () => {
    it('should create default content when it does not exist', async () => {
      vi.mocked(Content.findByKey).mockResolvedValue(null);
      vi.mocked(Content.upsertByKey).mockResolvedValue({} as any);

      await contentService.initializeDefaultContent();

      expect(Content.upsertByKey).toHaveBeenCalledTimes(2);
      expect(Content.upsertByKey).toHaveBeenCalledWith(
        'homepage_hero',
        'Homepage Hero Section',
        expect.objectContaining({
          heading: 'Authentic African Delicacies',
        }),
        expect.any(String)
      );
      expect(Content.upsertByKey).toHaveBeenCalledWith(
        'about_page',
        'About Us Content',
        expect.objectContaining({
          story: expect.any(String),
          mission: expect.any(String),
          values: expect.any(Array),
        }),
        expect.any(String)
      );
    });

    it('should not create content if it already exists', async () => {
      const mockContent = { key: 'homepage_hero', title: 'Existing' };
      vi.mocked(Content.findByKey).mockResolvedValue(mockContent as any);

      await contentService.initializeDefaultContent();

      expect(Content.upsertByKey).not.toHaveBeenCalled();
    });
  });

  describe('deleteContent', () => {
    it('should delete content successfully', async () => {
      vi.mocked(Content.deleteOne).mockResolvedValue({
        deletedCount: 1,
      } as any);

      const result = await contentService.deleteContent('homepage_hero');

      expect(result).toBe(true);
      expect(Content.deleteOne).toHaveBeenCalledWith({
        key: 'homepage_hero',
      });
    });

    it('should throw NotFoundError when content does not exist', async () => {
      vi.mocked(Content.deleteOne).mockResolvedValue({
        deletedCount: 0,
      } as any);

      await expect(
        contentService.deleteContent('nonexistent_key')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('contentExists', () => {
    it('should return true when content exists', async () => {
      const mockContent = { key: 'homepage_hero', title: 'Hero' };
      vi.mocked(Content.findByKey).mockResolvedValue(mockContent as any);

      const result = await contentService.contentExists('homepage_hero');

      expect(result).toBe(true);
    });

    it('should return false when content does not exist', async () => {
      vi.mocked(Content.findByKey).mockResolvedValue(null);

      const result = await contentService.contentExists('nonexistent_key');

      expect(result).toBe(false);
    });
  });
});
