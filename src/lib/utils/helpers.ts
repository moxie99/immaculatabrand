/**
 * General utility helper functions for the Confectionary Platform
 */

/**
 * Generate a URL-friendly slug from a string
 * @param text - The text to convert to a slug
 * @returns A lowercase, hyphenated slug
 * @example
 * generateSlug("Nigerian Chin Chin") // "nigerian-chin-chin"
 * generateSlug("Smoked Fish & Crayfish") // "smoked-fish-crayfish"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Format a price with currency symbol
 * @param price - The price in smallest currency unit (e.g., pence, cents)
 * @param currency - The currency code (GBP, USD, EUR)
 * @returns Formatted price string
 * @example
 * formatPrice(1250, "GBP") // "£12.50"
 * formatPrice(2000, "USD") // "$20.00"
 */
export function formatPrice(price: number, currency: string = 'GBP'): string {
  const amount = price / 100; // Convert from smallest unit to main unit
  
  const currencySymbols: Record<string, string> = {
    GBP: '£',
    USD: '$',
    EUR: '€',
  };

  const symbol = currencySymbols[currency] || currency;
  
  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Format a date to a readable string
 * @param date - The date to format
 * @returns Formatted date string
 * @example
 * formatDate(new Date("2024-01-15")) // "15 Jan 2024"
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Truncate text to a specified length with ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 * @example
 * truncateText("This is a long description", 10) // "This is a..."
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Validate email format
 * @param email - The email to validate
 * @returns True if email format is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate a unique order number
 * @param sequenceNumber - The sequence number for the day
 * @returns Formatted order number (e.g., "ORD-20240115-001")
 */
export function generateOrderNumber(sequenceNumber: number): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const sequence = String(sequenceNumber).padStart(3, '0');
  
  return `ORD-${year}${month}${day}-${sequence}`;
}

/**
 * Get category display name
 * @param category - The category slug
 * @returns Formatted category name
 */
export function getCategoryDisplayName(category: string): string {
  const categoryNames: Record<string, string> = {
    confectionary: 'Confectionary',
    fish: 'Fish Products',
    foodstuffs: 'African Foodstuffs',
  };
  
  return categoryNames[category] || category;
}

/**
 * Get order status display name and color
 * @param status - The order status
 * @returns Object with display name and color class
 */
export function getOrderStatusDisplay(status: string): {
  label: string;
  color: string;
} {
  const statusMap: Record<string, { label: string; color: string }> = {
    new: { label: 'New', color: 'bg-blue-100 text-blue-800' },
    contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  };
  
  return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
}
