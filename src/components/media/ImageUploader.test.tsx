/**
 * ImageUploader Component Tests
 * @vitest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { ImageUploader } from './ImageUploader';
import { useMediaUpload } from '@/lib/hooks/useMediaUpload';
import { Media } from '@/types/media.types';

// Mock the useMediaUpload hook
vi.mock('@/lib/hooks/useMediaUpload');

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Upload: () => <div data-testid="upload-icon">Upload</div>,
  X: () => <div data-testid="x-icon">X</div>,
  CheckCircle: () => <div data-testid="check-icon">Check</div>,
  AlertCircle: () => <div data-testid="alert-icon">Alert</div>,
  Image: () => <div data-testid="image-icon">Image</div>,
}));

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('ImageUploader', () => {
  const mockUpload = vi.fn();
  const mockCancel = vi.fn();
  const mockReset = vi.fn();
  const mockOnUploadComplete = vi.fn();

  const defaultHookReturn = {
    upload: mockUpload,
    cancel: mockCancel,
    reset: mockReset,
    isUploading: false,
    progress: 0,
    error: null,
    uploadedMedia: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useMediaUpload as Mock).mockReturnValue(defaultHookReturn);
  });

  describe('Initial Render', () => {
    it('should render upload area with instructions', () => {
      render(<ImageUploader mediaType="product" />);

      expect(screen.getByText(/Drop your image here/i)).toBeTruthy();
      expect(screen.getByText(/Supports: JPG, PNG, WebP, GIF/i)).toBeTruthy();
    });

    it('should render with custom className', () => {
      const { container } = render(
        <ImageUploader mediaType="product" className="custom-class" />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('custom-class');
    });
  });

  describe('File Selection', () => {
    it('should handle file selection via input', () => {
      render(<ImageUploader mediaType="product" />);

      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      expect(screen.getByText('test.jpg')).toBeTruthy();
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
    });

    it('should handle file selection via drag and drop', () => {
      render(<ImageUploader mediaType="product" />);

      const file = new File(['image'], 'dropped.png', { type: 'image/png' });
      const dropZone = screen.getByText(/Drop your image here/i).closest('div');

      fireEvent.drop(dropZone!, {
        dataTransfer: { files: [file] },
      });

      expect(screen.getByText('dropped.png')).toBeTruthy();
    });

    it('should show preview after file selection', () => {
      render(<ImageUploader mediaType="product" />);

      const file = new File(['image'], 'preview.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      const preview = screen.getByAltText('Preview');
      expect(preview).toBeTruthy();
      expect(preview.getAttribute('src')).toBe('blob:mock-url');
    });

    it('should display file size', () => {
      render(<ImageUploader mediaType="product" />);

      const file = new File(['x'.repeat(1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      expect(screen.getByText(/MB/)).toBeTruthy();
    });
  });

  describe('Drag and Drop', () => {
    it('should handle drag over event', () => {
      render(<ImageUploader mediaType="product" />);

      const dropZone = screen.getByText(/Drop your image here/i).parentElement?.parentElement?.parentElement;

      // Should not throw error
      expect(() => fireEvent.dragOver(dropZone!)).not.toThrow();
    });

    it('should handle drag leave event', () => {
      render(<ImageUploader mediaType="product" />);

      const dropZone = screen.getByText(/Drop your image here/i).parentElement?.parentElement?.parentElement;

      fireEvent.dragOver(dropZone!);
      
      // Should not throw error
      expect(() => fireEvent.dragLeave(dropZone!)).not.toThrow();
    });
  });

  describe('Upload Process', () => {
    it('should call upload with correct parameters', async () => {
      const mockMedia: Media = {
        _id: 'media-123',
        cloudinaryId: 'cloud-123',
        url: 'http://example.com/image.jpg',
        secureUrl: 'https://example.com/image.jpg',
        type: 'product',
        altText: 'product image',
        width: 800,
        height: 600,
        format: 'jpg',
        createdAt: new Date(),
      };

      (mockUpload as Mock).mockResolvedValue(mockMedia);

      render(<ImageUploader mediaType="product" altText="Test product" />);

      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      const uploadButton = screen.getByRole('button', { name: /Upload Image/i });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalledWith({
          file,
          type: 'product',
          altText: 'Test product',
        });
      });
    });

    it('should use default alt text if not provided', async () => {
      render(<ImageUploader mediaType="carousel" />);

      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      const uploadButton = screen.getByRole('button', { name: /Upload Image/i });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalledWith({
          file,
          type: 'carousel',
          altText: 'carousel image',
        });
      });
    });

    it('should show progress during upload', () => {
      (useMediaUpload as Mock).mockReturnValue({
        ...defaultHookReturn,
        isUploading: true,
        progress: 45,
      });

      render(<ImageUploader mediaType="product" />);

      expect(screen.getByText('Uploading...')).toBeTruthy();
      expect(screen.getByText('45%')).toBeTruthy();
    });

    it('should call onUploadComplete callback on success', async () => {
      const mockMedia: Media = {
        _id: 'media-123',
        cloudinaryId: 'cloud-123',
        url: 'http://example.com/image.jpg',
        secureUrl: 'https://example.com/image.jpg',
        type: 'product',
        altText: 'product image',
        width: 800,
        height: 600,
        format: 'jpg',
        createdAt: new Date(),
      };

      (mockUpload as Mock).mockResolvedValue(mockMedia);

      render(
        <ImageUploader
          mediaType="product"
          onUploadComplete={mockOnUploadComplete}
        />
      );

      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      const uploadButton = screen.getByRole('button', { name: /Upload Image/i });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(mockOnUploadComplete).toHaveBeenCalledWith(
          'https://example.com/image.jpg',
          'media-123'
        );
      });
    });

    it('should show success state after upload', () => {
      const mockMedia: Media = {
        _id: 'media-123',
        cloudinaryId: 'cloud-123',
        url: 'http://example.com/image.jpg',
        secureUrl: 'https://example.com/image.jpg',
        type: 'product',
        altText: 'product image',
        width: 800,
        height: 600,
        format: 'jpg',
        createdAt: new Date(),
      };

      (useMediaUpload as Mock).mockReturnValue({
        ...defaultHookReturn,
        uploadedMedia: mockMedia,
      });

      render(<ImageUploader mediaType="product" />);

      expect(screen.getByText('Upload Successful!')).toBeTruthy();
      const uploadedImage = screen.getByAltText('product image');
      expect(uploadedImage.getAttribute('src')).toBe('https://example.com/image.jpg');
    });
  });

  describe('Error Handling', () => {
    it('should display error message on upload failure', () => {
      (useMediaUpload as Mock).mockReturnValue({
        ...defaultHookReturn,
        error: 'File size exceeds maximum allowed size',
      });

      render(<ImageUploader mediaType="product" />);

      expect(screen.getByText('Upload Failed')).toBeTruthy();
      expect(screen.getByText('File size exceeds maximum allowed size')).toBeTruthy();
    });
  });

  describe('Cancel and Reset', () => {
    it('should cancel upload when cancel button is clicked', () => {
      (useMediaUpload as Mock).mockReturnValue({
        ...defaultHookReturn,
        isUploading: true,
      });

      render(<ImageUploader mediaType="product" />);

      const cancelButton = screen.getByRole('button', { name: /Cancel Upload/i });
      fireEvent.click(cancelButton);

      expect(mockCancel).toHaveBeenCalled();
    });

    it('should reset state when reset button is clicked', () => {
      render(<ImageUploader mediaType="product" />);

      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(mockReset).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should allow uploading another image after success', () => {
      const mockMedia: Media = {
        _id: 'media-123',
        cloudinaryId: 'cloud-123',
        url: 'http://example.com/image.jpg',
        secureUrl: 'https://example.com/image.jpg',
        type: 'product',
        altText: 'product image',
        width: 800,
        height: 600,
        format: 'jpg',
        createdAt: new Date(),
      };

      (useMediaUpload as Mock).mockReturnValue({
        ...defaultHookReturn,
        uploadedMedia: mockMedia,
      });

      render(<ImageUploader mediaType="product" />);

      const uploadAnotherButton = screen.getByRole('button', {
        name: /Upload Another Image/i,
      });
      fireEvent.click(uploadAnotherButton);

      expect(mockReset).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper file input with accept attribute', () => {
      render(<ImageUploader mediaType="product" />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.getAttribute('accept')).toBe('image/jpeg,image/jpg,image/png,image/webp,image/gif');
    });

    it('should disable input during upload', () => {
      (useMediaUpload as Mock).mockReturnValue({
        ...defaultHookReturn,
        isUploading: true,
      });

      render(<ImageUploader mediaType="product" />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });
  });
});
