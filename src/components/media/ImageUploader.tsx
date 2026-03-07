/**
 * ImageUploader Component
 * 
 * Drag-and-drop image uploader with validation, progress tracking, and preview.
 * Uses useMediaUpload hook for upload functionality.
 */

'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MediaType } from '@/types/media.types';
import { useMediaUpload } from '@/lib/hooks/useMediaUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

export interface ImageUploaderProps {
  /**
   * Media type for the upload
   */
  mediaType: MediaType;
  
  /**
   * Callback when upload completes successfully
   */
  onUploadComplete?: (url: string, mediaId: string) => void;
  
  /**
   * Optional alt text for the image
   */
  altText?: string;
  
  /**
   * Optional CSS class name
   */
  className?: string;
}

/**
 * ImageUploader Component
 * 
 * Features:
 * - Drag-and-drop file upload
 * - File type validation (jpg, jpeg, png, webp, gif)
 * - File size validation (max 5MB)
 * - Upload progress indicator
 * - Preview of uploaded image
 * - Success/error messages
 * - Responsive design
 */
export function ImageUploader({
  mediaType,
  onUploadComplete,
  altText,
  className = '',
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    upload,
    cancel,
    isUploading,
    progress,
    error,
    uploadedMedia,
    reset,
  } = useMediaUpload();

  /**
   * Clean up preview URL on unmount
   */
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback((file: File) => {
    // Clean up previous preview URL if it exists
    setPreviewUrl((prevUrl) => {
      if (prevUrl) {
        URL.revokeObjectURL(prevUrl);
      }
      return null;
    });
    
    setSelectedFile(file);
    
    // Create new preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  /**
   * Handle file input change
   */
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /**
   * Handle drag over
   */
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  /**
   * Handle drag leave
   */
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  /**
   * Handle drop
   */
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /**
   * Handle upload button click
   */
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      const media = await upload({
        file: selectedFile,
        type: mediaType,
        altText: altText || `${mediaType} image`,
      });
      
      // Call callback with uploaded media info
      onUploadComplete?.(media.secureUrl, media._id);
    } catch (err) {
      // Error is handled by the hook
      console.error('Upload failed:', err);
    }
  };

  /**
   * Handle cancel upload
   */
  const handleCancel = () => {
    cancel();
  };

  /**
   * Handle reset
   */
  const handleReset = () => {
    reset();
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Open file picker
   */
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      {!uploadedMedia && (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center
            transition-colors duration-200
            ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'}
            ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-primary'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFilePicker}
        >
          {/* Hidden file input */}
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isUploading}
          />

          {/* Upload Icon and Text */}
          {!selectedFile && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700">
                  Drop your image here, or click to browse
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Supports: JPG, PNG, WebP, GIF (max 5MB)
                </p>
              </div>
            </div>
          )}

          {/* Preview */}
          {selectedFile && previewUrl && !isUploading && (
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-full max-w-md">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-auto rounded-lg shadow-md"
                  onError={(e) => {
                    console.error('Failed to load preview image');
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage Preview%3C/text%3E%3C/svg%3E';
                  }}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <div className="w-full max-w-md">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Success State */}
      {uploadedMedia && (
        <div className="border-2 border-green-500 rounded-lg p-8 text-center bg-green-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-green-700">
                Upload Successful!
              </p>
              <p className="text-sm text-green-600 mt-1">
                Your image has been uploaded
              </p>
            </div>
            
            {/* Uploaded Image Preview */}
            <div className="w-full max-w-md mt-4">
              <img
                src={uploadedMedia.secureUrl}
                alt={uploadedMedia.altText}
                className="w-full h-auto rounded-lg shadow-md"
              />
              <div className="mt-2 text-xs text-gray-600 break-all">
                <p className="font-medium">URL:</p>
                <p className="text-gray-500">{uploadedMedia.secureUrl}</p>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="mt-4"
            >
              Upload Another Image
            </Button>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isUploading && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Upload Failed</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {selectedFile && !uploadedMedia && !isUploading && (
        <div className="flex gap-3 mt-4">
          <Button
            type="button"
            onClick={handleUpload}
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      )}

      {/* Cancel Upload Button */}
      {isUploading && (
        <div className="flex justify-center mt-4">
          <Button
            type="button"
            variant="destructive"
            onClick={handleCancel}
          >
            Cancel Upload
          </Button>
        </div>
      )}
    </div>
  );
}
