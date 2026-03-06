/**
 * @vitest-environment jsdom
 */

/**
 * InquiryForm Component Tests
 * 
 * Tests for the product inquiry form component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InquiryForm } from './InquiryForm';
import { useProducts } from '@/lib/hooks/useProducts';
import { useToast } from '@/lib/hooks/useToast';

// Mock hooks
vi.mock('@/lib/hooks/useProducts');
vi.mock('@/lib/hooks/useToast');

// Mock fetch
global.fetch = vi.fn();

const mockProducts = [
  {
    _id: 'prod1',
    name: 'Test Product 1',
    price: 10.99,
    currency: 'GBP',
    category: 'confectionary' as const,
    description: 'Test description',
    images: [],
    preparationSteps: [],
    isFeatured: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('InquiryForm', () => {
  const mockSuccess = vi.fn();
  const mockError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useProducts as any).mockReturnValue({
      products: mockProducts,
      isLoading: false,
      isError: false,
      error: undefined,
    });
    
    (useToast as any).mockReturnValue({
      success: mockSuccess,
      error: mockError,
    });
    
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          orderNumber: 'ORD-12345',
        },
      }),
    });
  });

  it('renders the inquiry form', () => {
    render(<InquiryForm />);
    
    expect(screen.getByText(/product inquiry/i)).toBeTruthy();
  });

  it('accepts productId prop', () => {
    render(<InquiryForm productId="prod1" />);
    
    expect(screen.getByText(/product inquiry/i)).toBeTruthy();
  });
});

