/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ProductForm } from './ProductForm';
import { Product } from '@/types/product.types';

describe('ProductForm', () => {
  const mockOnSubmit = vi.fn();

  const mockProduct: Product = {
    _id: '1',
    name: 'Test Product',
    slug: 'test-product',
    category: 'confectionary',
    description: 'Test description',
    price: 10.99,
    currency: 'GBP',
    images: ['https://example.com/image.jpg'],
    preparationSteps: [
      {
        stepNumber: 1,
        title: 'Step 1',
        description: 'First step',
      },
    ],
    nutritionInfo: {
      servingSize: '100g',
      calories: 200,
      protein: '5g',
      carbs: '20g',
      fat: '3g',
    },
    isFeatured: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders form with all required fields', () => {
    render(<ProductForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/product name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/currency/i)).toBeInTheDocument();
  });

  it('renders with default values when no product provided', () => {
    render(<ProductForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText(/product name/i) as HTMLInputElement;
    const priceInput = screen.getByLabelText(/price/i) as HTMLInputElement;

    expect(nameInput.value).toBe('');
    expect(priceInput.value).toBe('0');
  });

  it('renders with product data when editing', () => {
    render(<ProductForm product={mockProduct} onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText(/product name/i) as HTMLInputElement;
    const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
    const priceInput = screen.getByLabelText(/price/i) as HTMLInputElement;

    expect(nameInput.value).toBe('Test Product');
    expect(descriptionInput.value).toBe('Test description');
    expect(priceInput.value).toBe('10.99');
  });

  it('displays preparation steps when product has them', () => {
    render(<ProductForm product={mockProduct} onSubmit={mockOnSubmit} />);

    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('First step')).toBeInTheDocument();
  });

  it('adds a new preparation step when Add Step button is clicked', () => {
    render(<ProductForm onSubmit={mockOnSubmit} />);

    const addButton = screen.getByRole('button', { name: /add step/i });
    fireEvent.click(addButton);

    expect(screen.getByText('Step 1')).toBeInTheDocument();
  });

  it('removes a preparation step when remove button is clicked', () => {
    render(<ProductForm product={mockProduct} onSubmit={mockOnSubmit} />);

    const removeButton = screen.getByRole('button', { name: '✕' });
    fireEvent.click(removeButton);

    expect(screen.queryByText('Step 1')).not.toBeInTheDocument();
  });

  it('moves preparation step up', () => {
    const productWithSteps: Product = {
      ...mockProduct,
      preparationSteps: [
        { stepNumber: 1, title: 'Step 1', description: 'First' },
        { stepNumber: 2, title: 'Step 2', description: 'Second' },
      ],
    };

    render(<ProductForm product={productWithSteps} onSubmit={mockOnSubmit} />);

    const upButtons = screen.getAllByRole('button', { name: '↑' });
    fireEvent.click(upButtons[1]); // Click up on second step

    const steps = screen.getAllByText(/Step \d/);
    expect(steps[0]).toHaveTextContent('Step 1');
    expect(steps[1]).toHaveTextContent('Step 2');
  });

  it('moves preparation step down', () => {
    const productWithSteps: Product = {
      ...mockProduct,
      preparationSteps: [
        { stepNumber: 1, title: 'Step 1', description: 'First' },
        { stepNumber: 2, title: 'Step 2', description: 'Second' },
      ],
    };

    render(<ProductForm product={productWithSteps} onSubmit={mockOnSubmit} />);

    const downButtons = screen.getAllByRole('button', { name: '↓' });
    fireEvent.click(downButtons[0]); // Click down on first step

    const steps = screen.getAllByText(/Step \d/);
    expect(steps[0]).toHaveTextContent('Step 1');
    expect(steps[1]).toHaveTextContent('Step 2');
  });

  it('displays nutrition information when product has it', () => {
    render(<ProductForm product={mockProduct} onSubmit={mockOnSubmit} />);

    expect(screen.getByDisplayValue('100g')).toBeInTheDocument();
    expect(screen.getByDisplayValue('200')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5g')).toBeInTheDocument();
    expect(screen.getByDisplayValue('20g')).toBeInTheDocument();
    expect(screen.getByDisplayValue('3g')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(<ProductForm onSubmit={mockOnSubmit} isLoading={true} />);

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
  });

  it('shows correct button text for create mode', () => {
    render(<ProductForm onSubmit={mockOnSubmit} />);

    expect(screen.getByRole('button', { name: /create product/i })).toBeInTheDocument();
  });

  it('shows correct button text for edit mode', () => {
    render(<ProductForm product={mockProduct} onSubmit={mockOnSubmit} />);

    expect(screen.getByRole('button', { name: /update product/i })).toBeInTheDocument();
  });

  it('calls onSubmit with form data when submitted', async () => {
    render(<ProductForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText(/product name/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const priceInput = screen.getByLabelText(/price/i);

    fireEvent.change(nameInput, { target: { value: 'New Product' } });
    fireEvent.change(descriptionInput, { target: { value: 'New description' } });
    fireEvent.change(priceInput, { target: { value: '15.99' } });

    const submitButton = screen.getByRole('button', { name: /create product/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('displays image preview when file is selected', async () => {
    render(<ProductForm onSubmit={mockOnSubmit} />);

    const fileInput = screen.getByLabelText(/upload image/i) as HTMLInputElement;
    
    // Create a mock file
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    
    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: vi.fn(),
      onloadend: null as any,
      result: 'data:image/png;base64,test',
    };
    
    vi.spyOn(global, 'FileReader').mockImplementation(() => mockFileReader as any);

    fireEvent.change(fileInput, { target: { files: [file] } });

    // Trigger the onloadend callback
    if (mockFileReader.onloadend) {
      mockFileReader.onloadend();
    }

    await waitFor(() => {
      const preview = screen.getByAltText(/product preview/i);
      expect(preview).toBeInTheDocument();
    });
  });

  it('updates preparation step fields correctly', () => {
    render(<ProductForm product={mockProduct} onSubmit={mockOnSubmit} />);

    const titleInput = screen.getByDisplayValue('Step 1');
    fireEvent.change(titleInput, { target: { value: 'Updated Step' } });

    expect(screen.getByDisplayValue('Updated Step')).toBeInTheDocument();
  });

  it('shows empty state message when no preparation steps', () => {
    render(<ProductForm onSubmit={mockOnSubmit} />);

    expect(
      screen.getByText(/no preparation steps added yet/i)
    ).toBeInTheDocument();
  });

  it('disables move up button for first step', () => {
    render(<ProductForm product={mockProduct} onSubmit={mockOnSubmit} />);

    const upButtons = screen.getAllByRole('button', { name: '↑' });
    expect(upButtons[0].disabled).toBe(true);
  });

  it('disables move down button for last step', () => {
    render(<ProductForm product={mockProduct} onSubmit={mockOnSubmit} />);

    const downButtons = screen.getAllByRole('button', { name: '↓' });
    expect(downButtons[0].disabled).toBe(true);
  });
});
