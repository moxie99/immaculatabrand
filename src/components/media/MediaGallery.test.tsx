/**
 * MediaGallery Component Tests
 * @vitest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MediaGallery from './MediaGallery';
import { Media } from '@/types/media.types';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_ADMIN_USERNAME', 'admin');
vi.stubEnv('NEXT_PUBLIC_ADMIN_PASSWORD', 'password');

const mockMedia: Media[] = [
  {
    _id: '1',
    cloudinaryId: 'test-id-1',
    url: 'http://example.com/image1.jpg',
    secureUrl: 'https://example.com/image1.jpg',
    type: 'product',
    altText: 'Test Product Image',
    width: 800,
    height: 600,
    format: 'jpg',
    createdAt: new Date('2024-01-01'),
  },
  {
    _id: '2',
    cloudinaryId: 'test-id-2',
    url: 'http://example.com/image2.png',
    secureUrl: 'https://example.com/image2.png',
    type: 'hero',
    altText: 'Test Hero Image',
    width: 1200,
    height: 800,
    format: 'png',
    createdAt: new Date('2024-01-02'),
  },
];

describe('MediaGallery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('renders loading state initially', () => {
    (global.fetch as any).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<MediaGallery />);

    expect(screen.getByText('Loading media...')).toBeTruthy();
  });

  it('fetches and displays media on mount', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockMedia,
      }),
    });

    render(<MediaGallery />);

    await waitFor(() => {
      expect(screen.getByText('Test Product Image')).toBeTruthy();
      expect(screen.getByText('Test Hero Image')).toBeTruthy();
    });

    expect(screen.getByText('800 × 600 • JPG')).toBeTruthy();
    expect(screen.getByText('1200 × 800 • PNG')).toBeTruthy();
  });

  it('filters media by type', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [mockMedia[0]], // Only product media
      }),
    });

    render(<MediaGallery mediaType="product" />);

    await waitFor(() => {
      expect(screen.getByText('Test Product Image')).toBeTruthy();
    });

    expect(screen.queryByText('Test Hero Image')).not.toBeTruthy();
  });

  it('displays error state when fetch fails', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: { message: 'Failed to fetch media' },
      }),
    });

    render(<MediaGallery />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch media')).toBeTruthy();
    });

    expect(screen.getByText('Try Again')).toBeTruthy();
  });

  it('displays empty state when no media', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [],
      }),
    });

    render(<MediaGallery />);

    await waitFor(() => {
      expect(screen.getByText('No media found')).toBeTruthy();
    });

    expect(
      screen.getByText('Upload images to see them here')
    ).toBeTruthy();
  });

  it('opens delete confirmation dialog when delete button clicked', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockMedia,
      }),
    });

    render(<MediaGallery />);

    await waitFor(() => {
      expect(screen.getByText('Test Product Image')).toBeTruthy();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete Media')).toBeTruthy();
      expect(
        screen.getByText(/are you sure you want to delete this media/i)
      ).toBeTruthy();
    });
  });

  it('deletes media when confirmed', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockMedia,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { message: 'Media deleted successfully' },
        }),
      });

    render(<MediaGallery />);

    await waitFor(() => {
      expect(screen.getByText('Test Product Image')).toBeTruthy();
    });

    // Click delete button
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    // Wait for dialog
    await waitFor(() => {
      expect(screen.getByText('Delete Media')).toBeTruthy();
    });

    // Click confirm delete
    const confirmButton = screen.getByRole('button', { name: /^delete$/i });
    fireEvent.click(confirmButton);

    // Wait for media to be removed
    await waitFor(() => {
      expect(screen.queryByText('Test Product Image')).not.toBeTruthy();
    });

    // Verify DELETE request was made
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/media/delete/test-id-1',
      expect.objectContaining({
        method: 'DELETE',
      })
    );
  });

  it('cancels delete when cancel button clicked', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockMedia,
      }),
    });

    render(<MediaGallery />);

    await waitFor(() => {
      expect(screen.getByText('Test Product Image')).toBeTruthy();
    });

    // Click delete button
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    // Wait for dialog
    await waitFor(() => {
      expect(screen.getByText('Delete Media')).toBeTruthy();
    });

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText('Delete Media')).not.toBeTruthy();
    });

    // Media should still be there
    expect(screen.getByText('Test Product Image')).toBeTruthy();
  });

  it('uses Basic Auth for API requests', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockMedia,
      }),
    });

    render(<MediaGallery />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const expectedAuth = btoa('admin:password');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/media/all',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Basic ${expectedAuth}`,
        }),
      })
    );
  });

  it('retries fetch when Try Again button clicked', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: { message: 'Failed to fetch media' },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockMedia,
        }),
      });

    render(<MediaGallery />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch media')).toBeTruthy();
    });

    const tryAgainButton = screen.getByText('Try Again');
    fireEvent.click(tryAgainButton);

    await waitFor(() => {
      expect(screen.getByText('Test Product Image')).toBeTruthy();
    });
  });
});
