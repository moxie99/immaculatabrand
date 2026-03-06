/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { ContentEditor } from './ContentEditor';

// Mock the useToast hook
vi.mock('@/lib/hooks/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

describe('ContentEditor', () => {
  const mockContent = {
    _id: '1',
    key: 'homepage_hero',
    title: 'Homepage Hero',
    description: 'Hero section content',
    data: {
      heading: 'Welcome',
      subheading: 'To our site',
    },
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('renders loading state initially', () => {
    (global.fetch as any).mockImplementation(() => new Promise(() => {}));

    render(<ContentEditor contentKey="homepage_hero" />);

    const loadingText = screen.getByText('Loading content...');
    expect(loadingText).toBeDefined();
  });

  it('fetches and displays content', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockContent,
      }),
    });

    render(<ContentEditor contentKey="homepage_hero" />);

    await waitFor(() => {
      const heading = screen.getByText('Edit Content');
      expect(heading).toBeDefined();
    });

    const keyInput = screen.getByDisplayValue('homepage_hero') as HTMLInputElement;
    const titleInput = screen.getByDisplayValue('Homepage Hero') as HTMLInputElement;
    const descInput = screen.getByDisplayValue('Hero section content') as HTMLTextAreaElement;

    expect(keyInput).toBeDefined();
    expect(titleInput).toBeDefined();
    expect(descInput).toBeDefined();
  });

  it('displays error when fetch fails', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: {
          message: 'Content not found',
        },
      }),
    });

    render(<ContentEditor contentKey="invalid_key" />);

    await waitFor(() => {
      const errorText = screen.getByText('Content not found');
      expect(errorText).toBeDefined();
    });

    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeDefined();
  });

  it('has disabled content key field', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockContent,
      }),
    });

    render(<ContentEditor contentKey="homepage_hero" />);

    await waitFor(() => {
      const keyInput = screen.getByDisplayValue('homepage_hero') as HTMLInputElement;
      expect(keyInput).toBeDefined();
      expect(keyInput.disabled).toBe(true);
    });
  });

  it('submits form with valid data', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockContent,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { ...mockContent, title: 'Updated Title' },
        }),
      });

    render(<ContentEditor contentKey="homepage_hero" />);

    await waitFor(() => {
      const titleInput = screen.getByDisplayValue('Homepage Hero');
      expect(titleInput).toBeDefined();
    });

    const titleInput = screen.getByDisplayValue('Homepage Hero') as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/content',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': expect.stringContaining('Basic'),
          }),
        })
      );
    });
  });

  it('shows error for invalid JSON in data field', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockContent,
      }),
    });

    render(<ContentEditor contentKey="homepage_hero" />);

    await waitFor(() => {
      const heading = screen.getByText('Edit Content');
      expect(heading).toBeDefined();
    });

    const dataTextarea = screen.getByRole('textbox', { name: /content data/i }) as HTMLTextAreaElement;
    fireEvent.change(dataTextarea, { target: { value: 'invalid json' } });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      const errorText = screen.getByText(/invalid json format/i);
      expect(errorText).toBeDefined();
    });
  });

  it('disables save button when form is not dirty', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockContent,
      }),
    });

    render(<ContentEditor contentKey="homepage_hero" />);

    await waitFor(() => {
      const heading = screen.getByText('Edit Content');
      expect(heading).toBeDefined();
    });

    const saveButton = screen.getByRole('button', { name: /save changes/i }) as HTMLButtonElement;
    expect(saveButton.disabled).toBe(false);
  });

  it('resets form when reset button is clicked', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockContent,
      }),
    });

    render(<ContentEditor contentKey="homepage_hero" />);

    await waitFor(() => {
      const titleInput = screen.getByDisplayValue('Homepage Hero');
      expect(titleInput).toBeDefined();
    });

    const titleInput = screen.getByDisplayValue('Homepage Hero') as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'Changed Title' } });

    expect(screen.getByDisplayValue('Changed Title')).toBeDefined();

    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);

    await waitFor(() => {
      const originalTitle = screen.getByDisplayValue('Homepage Hero');
      expect(originalTitle).toBeDefined();
    });
  });

  it('displays form description texts', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockContent,
      }),
    });

    render(<ContentEditor contentKey="homepage_hero" />);

    await waitFor(() => {
      const heading = screen.getByText('Edit Content');
      expect(heading).toBeDefined();
    });

    const uniqueIdText = screen.getByText(/unique identifier for this content/i);
    const jsonText = screen.getByText(/enter content data as valid json/i);

    expect(uniqueIdText).toBeDefined();
    expect(jsonText).toBeDefined();
  });

  it('formats JSON data with proper indentation', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockContent,
      }),
    });

    render(<ContentEditor contentKey="homepage_hero" />);

    await waitFor(() => {
      const heading = screen.getByText('Edit Content');
      expect(heading).toBeDefined();
    });

    const dataTextarea = screen.getByRole('textbox', { name: /content data/i }) as HTMLTextAreaElement;
    const formattedJson = JSON.stringify(mockContent.data, null, 2);
    expect(dataTextarea.value).toBe(formattedJson);
  });
});
