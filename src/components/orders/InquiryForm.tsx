'use client';

/**
 * InquiryForm Component
 * 
 * Form for customers to submit product inquiries/orders.
 * Includes customer details, product selection, quantity, and optional shipping address.
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProducts } from '@/lib/hooks/useProducts';
import { useToast } from '@/lib/hooks/useToast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Form validation schema
 */
const inquiryFormSchema = z.object({
  customerName: z.string().min(1, 'Name is required').trim(),
  customerEmail: z.string().email('Invalid email format').min(1, 'Email is required'),
  customerPhone: z.string().min(1, 'Phone number is required').trim(),
  productId: z.string().min(1, 'Please select a product'),
  quantity: z.coerce.number().int().positive('Quantity must be at least 1').min(1),
  message: z.string().trim().optional(),
  // Optional shipping address fields
  shippingAddress: z.object({
    street: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    postalCode: z.string().trim().optional(),
    country: z.string().trim().optional(),
  }).optional(),
}).refine(
  (data) => {
    // If any shipping field is filled, all required fields must be filled
    const address = data.shippingAddress;
    if (!address) return true;
    
    const hasAnyField = address.street || address.city || address.state || address.postalCode || address.country;
    if (!hasAnyField) return true;
    
    return !!(address.street && address.city && address.state && address.postalCode && address.country);
  },
  {
    message: 'If providing shipping address, all fields are required',
    path: ['shippingAddress'],
  }
);

type InquiryFormValues = z.infer<typeof inquiryFormSchema>;

/**
 * Component props
 */
interface InquiryFormProps {
  productId?: string;
  onSuccess?: (orderNumber: string) => void;
}

/**
 * InquiryForm Component
 */
export function InquiryForm({ productId, onSuccess }: InquiryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { products, isLoading: productsLoading } = useProducts({ pagination: { limit: 100 } });
  const { success, error } = useToast();

  // Initialize form with react-hook-form
  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      productId: productId || '',
      quantity: 1,
      message: '',
      shippingAddress: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
    },
  });

  /**
   * Handle form submission
   */
  const onSubmit = async (values: InquiryFormValues) => {
    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      // Prepare order data
      const orderData = {
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        customerPhone: values.customerPhone,
        items: [
          {
            productId: values.productId,
            quantity: values.quantity,
          },
        ],
        message: values.message,
        // Only include shipping address if at least one field is filled
        ...(values.shippingAddress?.street && {
          shippingAddress: values.shippingAddress,
        }),
      };

      // Submit to API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to submit inquiry');
      }

      // Show success message
      const orderNumber = result.data.orderNumber;
      setSuccessMessage(`Thank you! Your inquiry has been submitted. Order number: ${orderNumber}`);
      success('Inquiry Submitted', `Order number: ${orderNumber}`);
      
      // Reset form
      form.reset();
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(orderNumber);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit inquiry';
      error('Submission Failed', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success message if order was submitted
  if (successMessage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inquiry Submitted Successfully!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-600 mb-4">{successMessage}</p>
          <Button onClick={() => setSuccessMessage(null)}>Submit Another Inquiry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Inquiry</CardTitle>
        <CardDescription>
          Fill out the form below to inquire about our products. We'll get back to you as soon as possible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Customer Information</h3>
              
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone *</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+44 20 1234 5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Product Selection Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Product Details</h3>
              
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={productsLoading || !!productId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product._id} value={product._id}>
                            {product.name} - {product.currency} {product.price.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity *</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Details</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Please specify weight needed, special requests, or any questions about your order..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include details like weight needed (e.g., 2kg), special requests, or questions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Shipping Address Section (Optional) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Shipping Address (Optional)</h3>
              <p className="text-sm text-muted-foreground">
                If you need delivery, please provide your shipping address
              </p>
              
              <FormField
                control={form.control}
                name="shippingAddress.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="shippingAddress.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="London" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shippingAddress.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/County</FormLabel>
                      <FormControl>
                        <Input placeholder="Greater London" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="shippingAddress.postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="SW1A 1AA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shippingAddress.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="United Kingdom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || productsLoading}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
