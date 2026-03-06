// @ts-nocheck
/**
 * Example usage of the useToast hook
 * 
 * This file demonstrates how to use the enhanced toast hook
 * with convenience methods for common toast types.
 */

'use client';

import { useToast } from './useToast';

export function ToastExample() {
  const { success, error, warning, info, toast } = useToast();

  const handleSuccess = () => {
    success('Product Created', 'Your product has been successfully created.');
  };

  const handleError = () => {
    error('Failed to Save', 'There was an error saving your changes. Please try again.');
  };

  const handleWarning = () => {
    warning('Unsaved Changes', 'You have unsaved changes that will be lost.');
  };

  const handleInfo = () => {
    info('New Feature', 'Check out our new product catalog!');
  };

  const handleCustomToast = () => {
    // You can still use the original toast function for custom options
    toast({
      title: 'Custom Toast',
      description: 'This is a custom toast with specific options.',
      variant: 'default',
      duration: 10000,
    });
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold">Toast Examples</h2>
      
      <div className="space-x-2">
        <button 
          onClick={handleSuccess}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Show Success Toast
        </button>
        
        <button 
          onClick={handleError}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Show Error Toast
        </button>
        
        <button 
          onClick={handleWarning}
          className="px-4 py-2 bg-yellow-500 text-white rounded"
        >
          Show Warning Toast
        </button>
        
        <button 
          onClick={handleInfo}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Show Info Toast
        </button>
        
        <button 
          onClick={handleCustomToast}
          className="px-4 py-2 bg-purple-500 text-white rounded"
        >
          Show Custom Toast
        </button>
      </div>
    </div>
  );
}

/**
 * Usage in a form submission:
 */
export function ProductFormExample() {
  const { success, error } = useToast();

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      success('Product Created', 'Your product has been added to the catalog.');
    } catch (err) {
      error('Creation Failed', 'Unable to create product. Please try again.');
    }
  };

  return null; // Form implementation
}

/**
 * Usage in an order submission:
 */
export function OrderFormExample() {
  const { success, error } = useToast();

  const handleOrderSubmit = async (orderData: any) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit order');
      }

      const { orderNumber } = await response.json();
      success(
        'Order Submitted', 
        `Your inquiry has been received. Order number: ${orderNumber}`
      );
    } catch (err) {
      error(
        'Submission Failed', 
        'Unable to submit your inquiry. Please check your information and try again.'
      );
    }
  };

  return null; // Form implementation
}
