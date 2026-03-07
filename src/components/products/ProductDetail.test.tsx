/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProductDetail from './ProductDetail';
import type { Product } from '@/types/product.types';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock PreparationGuide component
vi.mock('./PreparationGuide', () => ({
  __esModule: true,
  default: ({ steps }: any) => (
    <div>
      <h2>Preparation Guide</h2>
      {steps.map((step: any) => (
        <div key={step.stepNumber}>
          <h3>{step.title}</h3>
          <p>{step.description}</p>
        </div>
      ))}
    </div>
  ),
}));

// Mock InquiryForm component
vi.mock('@/components/orders/InquiryForm', () => ({
  InquiryForm: () => (
    <div>
      <h2>Product Inquiry</h2>
      <label htmlFor="name">Name *</label>
      <input id="name" />
      <label htmlFor="email">Email *</label>
      <input id="email" type="email" />
      <label htmlFor="phone">Phone *</label>
      <input id="phone" type="tel" />
      <label htmlFor="product">Product *</label>
      <select id="product" />
      <label htmlFor="quantity">Quantity *</label>
      <input id="quantity" type="number" />
      <label htmlFor="order-details">Order Details</label>
      <textarea id="order-details" />
      <label htmlFor="street">Street Address</label>
      <input id="street" />
      <label htmlFor="city">City</label>
      <input id="city" />
      <button type="submit">Submit Inquiry</button>
    </div>
  ),
}));

describe('ProductDetail', () => {
  const mockProduct: Product = {
    _id: '1',
    name: 'Chocolate Cake',
    slug: 'chocolate-cake',
    category: 'confectionary',
    description: 'Delicious chocolate cake with rich frosting',
    price: 2500,
    currency: 'GBP',
    images: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
      'https://example.com/image3.jpg',
    ],
    preparationSteps: [
      {
        stepNumber: 1,
        title: 'Preheat Oven',
        description: 'Preheat oven to 350°F',
        duration: '5 minutes',
      },
      {
        stepNumber: 2,
        title: 'Mix Ingredients',
        description: 'Mix all dry ingredients together',
        duration: '10 minutes',
      },
    ],
    nutritionInfo: {
      servingSize: '100g',
      calories: 350,
      protein: '5g',
      carbs: '45g',
      fat: '18g',
    },
    isFeatured: true,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  it('renders product name', () => {
    render(<ProductDetail product={mockProduct} />);
    expect(screen.getByText('Chocolate Cake')).toBeTruthy();
  });

  it('renders product category', () => {
    render(<ProductDetail product={mockProduct} />);
    expect(screen.getByText('Confectionary')).toBeTruthy();
  });

  it('renders formatted price', () => {
    render(<ProductDetail product={mockProduct} />);
    expect(screen.getByText('£25.00')).toBeTruthy();
  });

  it('renders product description', () => {
    render(<ProductDetail product={mockProduct} />);
    expect(screen.getByText('Delicious chocolate cake with rich frosting')).toBeTruthy();
  });

  it('renders main product image', () => {
    render(<ProductDetail product={mockProduct} />);
    const images = screen.getAllByAltText('Chocolate Cake');
    expect(images.length).toBeGreaterThan(0);
  });

  it('renders image thumbnails when multiple images exist', () => {
    render(<ProductDetail product={mockProduct} />);
    const thumbnails = screen.getAllByRole('button').filter(
      (button) => button.querySelector('img')
    );
    expect(thumbnails.length).toBe(3);
  });

  it('changes main image when thumbnail is clicked', () => {
    render(<ProductDetail product={mockProduct} />);
    const thumbnails = screen.getAllByRole('button').filter(
      (button) => button.querySelector('img')
    );
    
    // Click second thumbnail
    fireEvent.click(thumbnails[1]);
    
    // Check that the second thumbnail has the active border class
    expect(thumbnails[1].className).toContain('border-primary');
  });

  it('renders preparation guide when steps are provided', () => {
    render(<ProductDetail product={mockProduct} />);
    expect(screen.getByText('Preparation Guide')).toBeTruthy();
    expect(screen.getByText('Preheat Oven')).toBeTruthy();
    expect(screen.getByText('Mix Ingredients')).toBeTruthy();
  });

  it('does not render preparation guide when no steps provided', () => {
    const productWithoutSteps = { ...mockProduct, preparationSteps: [] };
    render(<ProductDetail product={productWithoutSteps} />);
    expect(screen.queryByText('Preparation Guide')).toBeNull();
  });

  it('renders nutrition information when provided', () => {
    render(<ProductDetail product={mockProduct} />);
    expect(screen.getByText('Nutrition Information')).toBeTruthy();
    expect(screen.getByText('100g')).toBeTruthy();
    expect(screen.getByText('350')).toBeTruthy();
    expect(screen.getByText('5g')).toBeTruthy();
    expect(screen.getByText('45g')).toBeTruthy();
    expect(screen.getByText('18g')).toBeTruthy();
  });

  it('does not render nutrition information when not provided', () => {
    const productWithoutNutrition = { ...mockProduct, nutritionInfo: undefined };
    render(<ProductDetail product={productWithoutNutrition} />);
    expect(screen.queryByText('Nutrition Information')).toBeNull();
  });

  it('renders inquiry button', () => {
    render(<ProductDetail product={mockProduct} />);
    expect(screen.getByText('Make an Inquiry')).toBeTruthy();
  });

  it('opens inquiry dialog when button is clicked', async () => {
    render(<ProductDetail product={mockProduct} />);
    const inquiryButton = screen.getByText('Make an Inquiry');
    fireEvent.click(inquiryButton);
    
    // Wait for the InquiryForm to render
    await waitFor(() => {
      expect(screen.getAllByText('Product Inquiry').length).toBeGreaterThan(0);
    });
    
    expect(screen.getByLabelText('Name *')).toBeTruthy();
    expect(screen.getByLabelText('Email *')).toBeTruthy();
    expect(screen.getByLabelText('Phone *')).toBeTruthy();
  });

  it('handles product with no images gracefully', () => {
    const productWithoutImages = { ...mockProduct, images: [] };
    render(<ProductDetail product={productWithoutImages} />);
    
    // Should still render with placeholder image
    expect(screen.getByText('Chocolate Cake')).toBeTruthy();
  });

  it('displays full inquiry form with all required fields', async () => {
    render(<ProductDetail product={mockProduct} />);
    const inquiryButton = screen.getByText('Make an Inquiry');
    fireEvent.click(inquiryButton);
    
    // Wait for form to render
    await waitFor(() => {
      expect(screen.getByLabelText('Name *')).toBeTruthy();
    });
    
    // Check all required fields are present
    expect(screen.getByLabelText('Email *')).toBeTruthy();
    expect(screen.getByLabelText('Phone *')).toBeTruthy();
    expect(screen.getByLabelText('Product *')).toBeTruthy();
    expect(screen.getByLabelText('Quantity *')).toBeTruthy();
    expect(screen.getByLabelText('Order Details')).toBeTruthy();
    
    // Check shipping address fields are present
    expect(screen.getByLabelText('Street Address')).toBeTruthy();
    expect(screen.getByLabelText('City')).toBeTruthy();
  });
});
