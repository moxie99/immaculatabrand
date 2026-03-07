'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/products/ProductForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/lib/hooks/useToast';

/**
 * New Product Page
 * 
 * Route: /admin/products/new
 * 
 * Features:
 * - Render ProductForm component
 * - Implement product creation
 * - Redirect to products list after save
 * 
 * Requirements: Design - Dashboard Pages (Task 24.3)
 */

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        success('Product created', 'The product has been successfully created.');
        // Redirect to products list after successful creation
        router.push('/admin/products');
      } else {
        const result = await response.json();
        error('Creation failed', result.error?.message || 'Failed to create product');
      }
    } catch (err) {
      console.error('Failed to create product:', err);
      error('Creation failed', 'An error occurred while creating the product.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Product</h1>
          <p className="text-muted-foreground mt-2">
            Create a new product in your catalog
          </p>
        </div>
      </div>

      {/* Product Form */}
      <div className="max-w-4xl">
        <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
