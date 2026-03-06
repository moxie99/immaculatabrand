import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  uploadImage,
  deleteImage,
  getMediaByType,
  getAllMedia,
  getMediaByCloudinaryId,
} from './media.service';
import Media from '@/lib/db/models/Media';
import cloudinary from '@/config/cloudinary';
import { AppError } from '@/lib/utils/errors';

// Mock dependencies
vi.mock('@/config/cloudinary', () => ({
  default: {
    uploader: {
      upload: vi.fn(),
      destroy: vi.fn(),
    },
  },
}));

vi.mock('@/lib/db/models/Media');
vi.mock('@/lib/utils/logger');

describe('media.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadImage', () => {
    it('should upload image and create media record', async () => {
      // Mock file
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 }); // 1MB

      // Mock Cloudinary response
      const mockCloudinaryResult = {
        public_id: 'confectionary/hero/test123',
        url: 'http://res.cloudinary.com/test/image/upload/test123.jpg',
        secure_url: 'https://res.cloudinary.com/test/image/upload/test123.jpg',
        width: 800,
        height: 600,
        format: 'jpg',
      };

      vi.mocked(cloudinary.uploader.upload).mockResolvedValue(
        mockCloudinaryResult as any
      );

      // Mock Media.create
      const mockMedia = {
        _id: 'media123',
        cloudinaryId: mockCloudinaryResult.public_id,
        url: mockCloudinaryResult.url,
        secureUrl: mockCloudinaryResult.secure_url,
        type: 'hero',
        altText: 'Test image',
        width: mockCloudinaryResult.width,
        height: mockCloudinaryResult.height,
        format: mockCloudinaryResult.format,
        createdAt: new Date(),
      };

      vi.mocked(Media.create).mockResolvedValue(mockMedia as any);

      // Execute
      const result = await uploadImage(mockFile, 'hero', 'Test image');

      // Verify
      expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
        expect.stringContaining('data:image/jpeg;base64,'),
        expect.objectContaining({
          folder: 'confectionary/hero',
          transformation: expect.any(Array),
          resource_type: 'image',
        })
      );

      expect(Media.create).toHaveBeenCalledWith({
        cloudinaryId: mockCloudinaryResult.public_id,
        url: mockCloudinaryResult.url,
        secureUrl: mockCloudinaryResult.secure_url,
        type: 'hero',
        altText: 'Test image',
        width: mockCloudinaryResult.width,
        height: mockCloudinaryResult.height,
        format: mockCloudinaryResult.format,
      });

      expect(result).toEqual(mockMedia);
    });

    it('should reject files larger than 5MB', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(mockFile, 'size', { value: 6 * 1024 * 1024 }); // 6MB

      await expect(
        uploadImage(mockFile, 'hero', 'Test image')
      ).rejects.toThrow(AppError);
    });

    it('should reject non-image files', async () => {
      const mockFile = new File(['test'], 'test.pdf', {
        type: 'application/pdf',
      });
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 }); // 1MB

      await expect(
        uploadImage(mockFile, 'hero', 'Test image')
      ).rejects.toThrow(AppError);
    });
  });

  describe('deleteImage', () => {
    it('should delete image from Cloudinary and database', async () => {
      const cloudinaryId = 'confectionary/hero/test123';

      // Mock Media.findByCloudinaryId
      const mockMedia = {
        _id: 'media123',
        cloudinaryId,
        type: 'hero',
      };

      vi.mocked(Media.findByCloudinaryId).mockResolvedValue(mockMedia as any);

      // Mock Cloudinary destroy
      vi.mocked(cloudinary.uploader.destroy).mockResolvedValue({
        result: 'ok',
      } as any);

      // Mock Media.deleteOne
      vi.mocked(Media.deleteOne).mockResolvedValue({ deletedCount: 1 } as any);

      // Execute
      const result = await deleteImage(cloudinaryId);

      // Verify
      expect(Media.findByCloudinaryId).toHaveBeenCalledWith(cloudinaryId);
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(cloudinaryId);
      expect(Media.deleteOne).toHaveBeenCalledWith({ cloudinaryId });
      expect(result).toBe(true);
    });

    it('should throw error if media not found', async () => {
      const cloudinaryId = 'nonexistent';

      vi.mocked(Media.findByCloudinaryId).mockResolvedValue(null);

      await expect(deleteImage(cloudinaryId)).rejects.toThrow(AppError);
    });
  });

  describe('getMediaByType', () => {
    it('should fetch media by type', async () => {
      const mockMedia = [
        {
          _id: 'media1',
          cloudinaryId: 'test1',
          type: 'hero',
          createdAt: new Date(),
        },
        {
          _id: 'media2',
          cloudinaryId: 'test2',
          type: 'hero',
          createdAt: new Date(),
        },
      ];

      vi.mocked(Media.getByType).mockResolvedValue(mockMedia as any);

      const result = await getMediaByType('hero');

      expect(Media.getByType).toHaveBeenCalledWith('hero', undefined);
      expect(result).toEqual(mockMedia);
    });

    it('should fetch media by type with limit', async () => {
      const mockMedia = [
        {
          _id: 'media1',
          cloudinaryId: 'test1',
          type: 'carousel',
          createdAt: new Date(),
        },
      ];

      vi.mocked(Media.getByType).mockResolvedValue(mockMedia as any);

      const result = await getMediaByType('carousel', 5);

      expect(Media.getByType).toHaveBeenCalledWith('carousel', 5);
      expect(result).toEqual(mockMedia);
    });
  });

  describe('getAllMedia', () => {
    it('should fetch all media sorted by creation date', async () => {
      const mockMedia = [
        {
          _id: 'media1',
          cloudinaryId: 'test1',
          type: 'hero',
          createdAt: new Date('2024-01-02'),
        },
        {
          _id: 'media2',
          cloudinaryId: 'test2',
          type: 'carousel',
          createdAt: new Date('2024-01-01'),
        },
      ];

      const mockQuery = {
        sort: vi.fn().mockReturnValue(mockMedia),
      };

      vi.mocked(Media.find).mockReturnValue(mockQuery as any);

      const result = await getAllMedia();

      expect(Media.find).toHaveBeenCalled();
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toEqual(mockMedia);
    });
  });

  describe('getMediaByCloudinaryId', () => {
    it('should fetch media by Cloudinary ID', async () => {
      const cloudinaryId = 'confectionary/hero/test123';
      const mockMedia = {
        _id: 'media123',
        cloudinaryId,
        type: 'hero',
      };

      vi.mocked(Media.findByCloudinaryId).mockResolvedValue(mockMedia as any);

      const result = await getMediaByCloudinaryId(cloudinaryId);

      expect(Media.findByCloudinaryId).toHaveBeenCalledWith(cloudinaryId);
      expect(result).toEqual(mockMedia);
    });

    it('should return null if media not found', async () => {
      const cloudinaryId = 'nonexistent';

      vi.mocked(Media.findByCloudinaryId).mockResolvedValue(null);

      const result = await getMediaByCloudinaryId(cloudinaryId);

      expect(result).toBeNull();
    });
  });
});
