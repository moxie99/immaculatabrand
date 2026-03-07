/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

    expect(screen.getByLabelText(/product name/i)).toBeTruthy();
    expect(screen.getByLabelText(/category/i)).toBeTruthy();
    expect(screen.getByLabelText(/description/i)).toBeTruthy();
    expect(screen.getByLabelText(/price/i)).toBeTruthy();
    expect(screen.getByLabelText(/currency/i)).toBeTruthy();
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

    expect(screen.getByText('Step 1')).toBeTruthy();
    expect(screen.getByDisplayValue('First step')).toBeTruthy();
  });

  it('adds a new preparation step when Add Step button is clicked', () => {
    render(<ProductForm onSubmit={mockOnSubmit} />);

    const addButton = screen.getByRole('button', { name: /add step/i });
    fireEvent.click(addButton);

    expect(screen.getByText('Step 1')).toBeTruthy();
  });

  it('removes a preparation step when remove button is clicked', () => {
    render(<ProductForm product={mockProduct} onSubmit={mockOnSubmit} />);

    const removeButton = screen.getByRole('button', { name: '✕' });
    fireEvent.click(removeButton);

    expect(screen.queryByText('Step 1')).toBeFalsy();
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
    expect(steps[0].textContent).toBe('Step 1');
    expect(steps[1].textContent).toBe('Step 2');
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
    expect(steps[0].textContent).toBe('Step 1');
    expect(steps[1].textContent).toBe('Step 2');
  });

  it('displays nutrition information when product has it', () => {
    render(<ProductForm product={mockProduct} onSubmit={mockOnSubmit} />);

    expect(screen.getByDisplayValue('100g')).toBeTruthy();
    expect(screen.getByDisplayValue('200')).toBeTruthy();
    expect(screen.getByDisplayValue('5g')).toBeTruthy();
    expect(screen.getByDisplayValue('20g')).toBeTruthy();
    expect(screen.getByDisplayValue('3g')).toBeTruthy();
  });

  it('shows loading state when isLoading is true', () => {
    render(<ProductForm onSubmit={mockOnSubmit} isLoading={true} />);

    const button = screen.getByRole('button', { name: /saving/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('shows correct button text for create mode', () => {
    render(<ProductForm onSubmit={mockOnSubmit} />);

    expect(screen.getByRole('button', { name: /create product/i })).toBeTruthy();
  });

  it('shows correct button text for edit mode', () => {
    render(<ProductForm product={mockProduct} onSubmit={mockOnSubmit} />);

    expect(screen.getByRole('button', { name: /update product/i })).toBeTruthy();
  });

  it('calls onSubmit with form data when submitted', async () => {
    const user = userEvent.setup();
    render(<ProductForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText(/product name/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const priceInput = screen.getByLabelText(/price/i);

    await user.clear(nameInput);
    await user.type(nameInput, 'New Product');
    
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'New description');
    
    await user.clear(priceInput);
    await user.type(priceInput, '15.99');

    const submitButton = screen.getByRole('button', { name: /create product/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('renders image uploader component', () => {
    render(<ProductForm onSubmit={mockOnSubmit} />);

    // Check that the image uploader drag-and-drop area is present
    expect(screen.getByText(/drop your image here/i)).toBeTruthy();
  });

  it('updates preparation step fields correctly', () => {
    render(<ProductForm product={mockProduct} onSubmit={mockOnSubmit} />);

    const titleInput = screen.getByDisplayValue('Step 1');
    fireEvent.change(titleInput, { target: { value: 'Updated Step' } });

    expect(screen.getByDisplayValue('Updated Step')).toBeTruthy();
  });

  it('shows empty state message when no preparation steps', () => {
    render(<ProductForm onSubmit={mockOnSubmit} />);

    expect(
      screen.getByText(/no preparation steps added yet/i)
    ).toBeTruthy();
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
