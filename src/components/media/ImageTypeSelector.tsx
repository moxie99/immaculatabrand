'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MediaType } from '@/types/media.types';

interface ImageTypeSelectorProps {
  value: MediaType;
  onChange: (value: MediaType) => void;
  label?: string;
  className?: string;
}

interface ImageTypeOption {
  value: MediaType;
  label: string;
  description: string;
}

const imageTypeOptions: ImageTypeOption[] = [
  {
    value: 'hero',
    label: 'Hero Image',
    description: 'Large banner image for homepage hero section',
  },
  {
    value: 'carousel',
    label: 'Carousel Image',
    description: 'Image for homepage carousel/slideshow',
  },
  {
    value: 'product',
    label: 'Product Image',
    description: 'Product photo for product pages and listings',
  },
  {
    value: 'category',
    label: 'Category Image',
    description: 'Image representing a product category',
  },
];

export function ImageTypeSelector({
  value,
  onChange,
  label = 'Image Type',
  className,
}: ImageTypeSelectorProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium mb-2">{label}</label>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select image type" />
        </SelectTrigger>
        <SelectContent>
          {imageTypeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex flex-col">
                <span className="font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground">
                  {option.description}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
