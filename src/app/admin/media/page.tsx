'use client';

import React, { useState } from 'react';
import { ImageTypeSelector } from '@/components/media/ImageTypeSelector';
import { ImageUploader } from '@/components/media/ImageUploader';
import MediaGallery from '@/components/media/MediaGallery';
import { MediaType } from '@/types/media.types';

/**
 * Media Management Page
 * 
 * Route: /admin/media
 * 
 * Features:
 * - Render ImageTypeSelector component
 * - Render ImageUploader component
 * - Render MediaGallery component
 * 
 * Requirements: Design - Dashboard Pages (Task 24.7)
 */

export default function MediaManagementPage() {
  const [selectedType, setSelectedType] = useState<MediaType>('product');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    // Trigger gallery refresh after successful upload
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Media Management</h1>
        <p className="text-muted-foreground mt-2">
          Upload and manage images for your website
        </p>
      </div>

      {/* Image Type Selector */}
      <div>
        <ImageTypeSelector
          value={selectedType}
          onChange={setSelectedType}
          label="Image Type"
        />
      </div>

      {/* Image Uploader */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Upload New Image</h2>
        <ImageUploader
          mediaType={selectedType}
          onUploadComplete={handleUploadSuccess}
        />
      </div>

      {/* Media Gallery */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Images
        </h2>
        <MediaGallery key={refreshKey} mediaType={selectedType} />
      </div>
    </div>
  );
}
