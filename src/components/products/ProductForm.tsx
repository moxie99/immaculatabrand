'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Product, PreparationStep } from '@/types/product.types';
import { productCreateSchema } from '@/lib/utils/validation';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/lib/hooks/useToast';
import { useMediaUpload } from '@/lib/hooks/useMediaUpload';

// Form schema based on productCreateSchema
const formSchema = productCreateSchema;

type FormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: FormValues) => Promise<void>;
  isLoading?: boolean;
}

export function ProductForm({ product, onSubmit, isLoading = false }: ProductFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.images?.[0] || null
  );
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [preparationSteps, setPreparationSteps] = useState<PreparationStep[]>(
    product?.preparationSteps || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { error: showError } = useToast();
  const { upload: uploadImage } = useMediaUpload();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      category: product?.category || 'confectionary',
      description: product?.description || '',
      price: product?.price || 0,
      currency: product?.currency || 'GBP',
      images: product?.images || [],
      preparationSteps: product?.preparationSteps || [],
      nutritionInfo: product?.nutritionInfo || undefined,
      isFeatured: product?.isFeatured || false,
      isActive: product?.isActive ?? true,
    },
  });

  const addPreparationStep = () => {
    const newStep: PreparationStep = {
      stepNumber: preparationSteps.length + 1,
      title: '',
      description: '',
    };
    const updatedSteps = [...preparationSteps, newStep];
    setPreparationSteps(updatedSteps);
    form.setValue('preparationSteps', updatedSteps);
  };

  const removePreparationStep = (index: number) => {
    const updatedSteps = preparationSteps
      .filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, stepNumber: i + 1 }));
    setPreparationSteps(updatedSteps);
    form.setValue('preparationSteps', updatedSteps);
  };

  const updatePreparationStep = (
    index: number,
    field: keyof PreparationStep,
    value: string
  ) => {
    const updatedSteps = preparationSteps.map((step, i) =>
      i === index ? { ...step, [field]: value } : step
    );
    setPreparationSteps(updatedSteps);
    form.setValue('preparationSteps', updatedSteps);
  };

  const movePreparationStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === preparationSteps.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedSteps = [...preparationSteps];
    [updatedSteps[index], updatedSteps[newIndex]] = [
      updatedSteps[newIndex],
      updatedSteps[index],
    ];

    // Renumber steps
    const renumberedSteps = updatedSteps.map((step, i) => ({
      ...step,
      stepNumber: i + 1,
    }));

    setPreparationSteps(renumberedSteps);
    form.setValue('preparationSteps', renumberedSteps);
  };

  const handleImageSelect = (file: File) => {
    setSelectedImageFile(file);
    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleFormSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);

      // If there's a new image file selected, upload it first
      if (selectedImageFile) {
        try {
          const media = await uploadImage({
            file: selectedImageFile,
            type: 'product',
            altText: `${data.name} product image`,
          });
          
          // Update form data with uploaded image URL
          data.images = [media.secureUrl];
        } catch (uploadError) {
          showError('Image upload failed', 'Please try again or continue without an image.');
          console.error('Image upload error:', uploadError);
          // Continue with product creation even if image upload fails
          data.images = [];
        }
      }

      // Submit the product with image URL
      await onSubmit(data);
      
      setIsSubmitting(false);
    } catch (error) {
      console.error('Form submission error:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="confectionary">Confectionary</SelectItem>
                      <SelectItem value="fish">Fish</SelectItem>
                      <SelectItem value="foodstuffs">Foodstuffs</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter product description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Card>

        {/* Image Upload */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Product Image</h2>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
              <Input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageSelect(file);
                  }
                }}
                className="hidden"
                id="product-image-input"
              />
              
              {!imagePreview ? (
                <label htmlFor="product-image-input" className="cursor-pointer block">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Click to upload product image</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP, GIF (max 5MB)</p>
                    </div>
                  </div>
                </label>
              ) : (
                <div className="space-y-3">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-48 h-48 object-cover rounded-md border mx-auto"
                  />
                  <label htmlFor="product-image-input" className="inline-block">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span className="cursor-pointer">Change Image</span>
                    </Button>
                  </label>
                </div>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground">
              Image will be uploaded automatically when you save the product
            </p>
          </div>
        </Card>

        {/* Preparation Steps */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Preparation Steps</h2>
            <Button type="button" onClick={addPreparationStep} variant="outline">
              Add Step
            </Button>
          </div>

          <div className="space-y-4">
            {preparationSteps.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No preparation steps added yet. Click "Add Step" to create one.
              </p>
            ) : (
              preparationSteps.map((step, index) => (
                <Card key={index} className="p-4 bg-muted/50">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-medium">Step {step.stepNumber}</span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => movePreparationStep(index, 'up')}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => movePreparationStep(index, 'down')}
                        disabled={index === preparationSteps.length - 1}
                      >
                        ↓
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removePreparationStep(index)}
                      >
                        ✕
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={step.title}
                        onChange={(e) =>
                          updatePreparationStep(index, 'title', e.target.value)
                        }
                        placeholder="Step title"
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={step.description}
                        onChange={(e) =>
                          updatePreparationStep(index, 'description', e.target.value)
                        }
                        placeholder="Step description"
                        className="min-h-[80px]"
                      />
                    </div>

                    <div>
                      <Label>Duration (optional)</Label>
                      <Input
                        value={step.duration || ''}
                        onChange={(e) =>
                          updatePreparationStep(index, 'duration', e.target.value)
                        }
                        placeholder="e.g., 10 minutes"
                      />
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>

        {/* Nutrition Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Nutrition Information (Optional)</h2>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="nutritionInfo.servingSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serving Size</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 100g" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nutritionInfo.calories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calories</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="nutritionInfo.protein"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protein</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 5g" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nutritionInfo.carbs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carbs</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 20g" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nutritionInfo.fat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fat</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 3g" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading || isSubmitting}>
            {isSubmitting ? 'Saving...' : isLoading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
