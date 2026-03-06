import { describe, it, expect } from 'vitest';
import {
  generateSlug,
  formatPrice,
  formatDate,
  truncateText,
  isValidEmail,
  generateOrderNumber,
  getCategoryDisplayName,
  getOrderStatusDisplay,
} from './helpers';

describe('generateSlug', () => {
  it('should convert text to lowercase slug', () => {
    expect(generateSlug('Nigerian Chin Chin')).toBe('nigerian-chin-chin');
  });

  it('should remove special characters', () => {
    expect(generateSlug('Smoked Fish & Crayfish')).toBe('smoked-fish-crayfish');
  });

  it('should replace spaces with hyphens', () => {
    expect(generateSlug('Plantain Flour Product')).toBe('plantain-flour-product');
  });

  it('should handle multiple spaces', () => {
    expect(generateSlug('Product   With   Spaces')).toBe('product-with-spaces');
  });

  it('should remove leading and trailing hyphens', () => {
    expect(generateSlug('  -Product-  ')).toBe('product');
  });

  it('should handle empty string', () => {
    expect(generateSlug('')).toBe('');
  });
});

describe('formatPrice', () => {
  it('should format GBP price correctly', () => {
    expect(formatPrice(1250, 'GBP')).toBe('£12.50');
  });

  it('should format USD price correctly', () => {
    expect(formatPrice(2000, 'USD')).toBe('$20.00');
  });

  it('should format EUR price correctly', () => {
    expect(formatPrice(1599, 'EUR')).toBe('€15.99');
  });

  it('should default to GBP when no currency specified', () => {
    expect(formatPrice(1000)).toBe('£10.00');
  });

  it('should handle zero price', () => {
    expect(formatPrice(0, 'GBP')).toBe('£0.00');
  });

  it('should handle unknown currency code', () => {
    expect(formatPrice(1000, 'XYZ')).toBe('XYZ10.00');
  });
});

describe('formatDate', () => {
  it('should format Date object correctly', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toBe('15 Jan 2024');
  });

  it('should format date string correctly', () => {
    expect(formatDate('2024-03-20')).toBe('20 Mar 2024');
  });

  it('should handle different months', () => {
    expect(formatDate('2024-12-25')).toBe('25 Dec 2024');
  });
});

describe('truncateText', () => {
  it('should truncate text longer than maxLength', () => {
    expect(truncateText('This is a long description', 10)).toBe('This is a...');
  });

  it('should not truncate text shorter than maxLength', () => {
    expect(truncateText('Short text', 20)).toBe('Short text');
  });

  it('should handle text exactly at maxLength', () => {
    expect(truncateText('Exact', 5)).toBe('Exact');
  });

  it('should handle empty string', () => {
    expect(truncateText('', 10)).toBe('');
  });
});

describe('isValidEmail', () => {
  it('should validate correct email format', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });

  it('should validate email with subdomain', () => {
    expect(isValidEmail('user@mail.example.com')).toBe(true);
  });

  it('should reject email without @', () => {
    expect(isValidEmail('testexample.com')).toBe(false);
  });

  it('should reject email without domain', () => {
    expect(isValidEmail('test@')).toBe(false);
  });

  it('should reject email without local part', () => {
    expect(isValidEmail('@example.com')).toBe(false);
  });

  it('should reject email with spaces', () => {
    expect(isValidEmail('test @example.com')).toBe(false);
  });

  it('should reject empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });
});

describe('generateOrderNumber', () => {
  it('should generate order number with correct format', () => {
    const orderNumber = generateOrderNumber(1);
    expect(orderNumber).toMatch(/^ORD-\d{8}-\d{3}$/);
  });

  it('should pad sequence number with zeros', () => {
    const orderNumber = generateOrderNumber(5);
    expect(orderNumber).toMatch(/^ORD-\d{8}-005$/);
  });

  it('should handle large sequence numbers', () => {
    const orderNumber = generateOrderNumber(123);
    expect(orderNumber).toMatch(/^ORD-\d{8}-123$/);
  });

  it('should generate different order numbers for different sequences', () => {
    const order1 = generateOrderNumber(1);
    const order2 = generateOrderNumber(2);
    expect(order1).not.toBe(order2);
  });
});

describe('getCategoryDisplayName', () => {
  it('should return display name for confectionary', () => {
    expect(getCategoryDisplayName('confectionary')).toBe('Confectionary');
  });

  it('should return display name for fish', () => {
    expect(getCategoryDisplayName('fish')).toBe('Fish Products');
  });

  it('should return display name for foodstuffs', () => {
    expect(getCategoryDisplayName('foodstuffs')).toBe('African Foodstuffs');
  });

  it('should return original value for unknown category', () => {
    expect(getCategoryDisplayName('unknown')).toBe('unknown');
  });
});

describe('getOrderStatusDisplay', () => {
  it('should return correct display for new status', () => {
    const result = getOrderStatusDisplay('new');
    expect(result.label).toBe('New');
    expect(result.color).toBe('bg-blue-100 text-blue-800');
  });

  it('should return correct display for contacted status', () => {
    const result = getOrderStatusDisplay('contacted');
    expect(result.label).toBe('Contacted');
    expect(result.color).toBe('bg-yellow-100 text-yellow-800');
  });

  it('should return correct display for completed status', () => {
    const result = getOrderStatusDisplay('completed');
    expect(result.label).toBe('Completed');
    expect(result.color).toBe('bg-green-100 text-green-800');
  });

  it('should return correct display for cancelled status', () => {
    const result = getOrderStatusDisplay('cancelled');
    expect(result.label).toBe('Cancelled');
    expect(result.color).toBe('bg-red-100 text-red-800');
  });

  it('should return default display for unknown status', () => {
    const result = getOrderStatusDisplay('unknown');
    expect(result.label).toBe('unknown');
    expect(result.color).toBe('bg-gray-100 text-gray-800');
  });
});
