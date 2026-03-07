'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, Search, Star } from 'lucide-react';
import { Product, Category } from '@/types/product.types';
import { DeleteConfirmationModal } from '@/components/admin/DeleteConfirmationModal';
import { useToast } from '@/lib/hooks/useToast';

/**
 * Products Management Page
 * 
 * Route: /admin/products
 * 
 * Features:
 * - Display all products in table format
 * - Add New Product button
 * - Edit and delete actions for each product
 * - Search and category filter
 * - Uses Shadcn Table component
 * 
 * Requirements: Design - Dashboard Pages (Task 24.2)
 */

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; product: Product | null }>({
    isOpen: false,
    product: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingFeatured, setTogglingFeatured] = useState<string | null>(null);
  const { success, error } = useToast();

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }

      const response = await fetch(`/api/products?${params.toString()}`);
      const result = await response.json();

      if (response.ok && result.data) {
        setProducts(result.data || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      // Get admin credentials from environment or use default
      const username = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin';
      const password = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
      const credentials = btoa(`${username}:${password}`);

      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${credentials}`,
        },
      });

      if (response.ok) {
        // Close modal and refresh products list
        setDeleteModal({ isOpen: false, product: null });
        success('Product deleted', 'The product has been successfully deleted.');
        fetchProducts();
      } else {
        const result = await response.json();
        error('Delete failed', result.error?.message || 'Failed to delete the product. Please try again.');
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
      error('Delete failed', 'An error occurred while deleting the product.');
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (product: Product) => {
    setDeleteModal({ isOpen: true, product });
  };

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setDeleteModal({ isOpen: false, product: null });
    }
  };

  const confirmDelete = () => {
    if (deleteModal.product) {
      handleDelete(deleteModal.product._id);
    }
  };

  const toggleFeatured = async (product: Product) => {
    setTogglingFeatured(product._id);
    try {
      const username = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin';
      const password = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin';
      const credentials = btoa(`${username}:${password}`);

      const response = await fetch(`/api/products/${product._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`,
        },
        body: JSON.stringify({
          isFeatured: !product.isFeatured,
        }),
      });

      if (response.ok) {
        const newStatus = !product.isFeatured;
        success(
          newStatus ? 'Added to Featured' : 'Removed from Featured',
          newStatus 
            ? `${product.name} has been added to featured products.`
            : `${product.name} has been removed from featured products.`
        );
        fetchProducts();
      } else {
        const result = await response.json();
        error('Update failed', result.error?.message || 'Failed to update featured status.');
      }
    } catch (err) {
      console.error('Failed to toggle featured:', err);
      error('Update failed', 'An error occurred while updating featured status.');
    } finally {
      setTogglingFeatured(null);
    }
  };

  // Filter products by search query
  const filteredProducts = (products || []).filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'GBP',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-2">
            Manage your product catalog
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(value) => setCategoryFilter(value as Category | 'all')}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="confectionary">Confectionary</SelectItem>
            <SelectItem value="fish">Fish</SelectItem>
            <SelectItem value="foodstuffs">Foodstuffs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading products...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="capitalize">{product.category}</TableCell>
                  <TableCell>
                    {formatPrice(product.price, product.currency)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFeatured(product)}
                      disabled={togglingFeatured === product._id}
                      className="p-0 h-8 w-8"
                      title={product.isFeatured ? 'Remove from featured' : 'Add to featured'}
                    >
                      {togglingFeatured === product._id ? (
                        <span className="animate-spin">⏳</span>
                      ) : product.isFeatured ? (
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ) : (
                        <Star className="h-5 w-5 text-gray-300" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/products/${product._id}/edit`}>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-destructive hover:text-destructive"
                        onClick={() => openDeleteModal(product)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        itemName={deleteModal.product?.name}
        isDeleting={isDeleting}
      />
    </div>
  );
}
