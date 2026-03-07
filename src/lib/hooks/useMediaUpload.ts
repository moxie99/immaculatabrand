/**
 * useMediaUpload Hook
 * 
 * Custom React hook for uploading images to Cloudinary via the API
 * with progress tracking, validation, and error handling.
 */

import { useState, useCallback, useRef } from 'react';
import { MediaType } from '@/types/media.types';
import { ApiResponse } from '@/types/api.types';
import { Media } from '@/types/media.types';

/**
 * Upload options
 */
export interface UploadOptions {
  file: File;
  type: MediaType;
  altText?: string;
  onProgress?: (progress: number) => void;
}

/**
 * Hook return type
 */
export interface UseMediaUploadReturn {
  upload: (options: UploadOptions) => Promise<Media>;
  cancel: () => void;
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedMedia: Media | null;
  reset: () => void;
}

/**
 * Maximum file size (5MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Allowed image MIME types
 */
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

/**
 * Validate file before upload
 */
function validateFile(file: File): string | null {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `Invalid file type. Allowed types: JPEG, PNG, WebP, GIF`;
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`;
  }

  return null;
}

/**
 * useMediaUpload Hook
 * 
 * Handles file uploads to the /api/media/upload endpoint with:
 * - File validation (type and size)
 * - Upload progress tracking
 * - Error handling
 * - Cancellation support
 * 
 * @example
 * ```tsx
 * const { upload, isUploading, progress, error } = useMediaUpload();
 * 
 * const handleUpload = async (file: File) => {
 *   try {
 *     const media = await upload({
 *       file,
 *       type: 'product',
 *       altText: 'Product image',
 *       onProgress: (p) => console.log(`Progress: ${p}%`)
 *     });
 *     console.log('Uploaded:', media);
 *   } catch (err) {
 *     console.error('Upload failed:', err);
 *   }
 * };
 * ```
 */
export function useMediaUpload(): UseMediaUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedMedia, setUploadedMedia] = useState<Media | null>(null);
  
  // Store abort controller for cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Upload file to API
   */
  const upload = useCallback(async (options: UploadOptions): Promise<Media> => {
    const { file, type, altText, onProgress } = options;

    // Reset state
    setError(null);
    setProgress(0);
    setUploadedMedia(null);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      throw new Error(validationError);
    }

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      setIsUploading(true);

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('altText', altText || `${type} image`);

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
          onProgress?.(percentComplete);
        }
      });

      // Handle abort
      abortControllerRef.current.signal.addEventListener('abort', () => {
        xhr.abort();
      });

      // Create promise for XHR
      const uploadPromise = new Promise<Media>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response: ApiResponse<Media> = JSON.parse(xhr.responseText);
              if (response.success && response.data) {
                resolve(response.data);
              } else {
                reject(new Error(response.error?.message || 'Upload failed'));
              }
            } catch (parseError) {
              reject(new Error('Failed to parse response'));
            }
          } else {
            try {
              const response: ApiResponse = JSON.parse(xhr.responseText);
              reject(new Error(response.error?.message || `Upload failed with status ${xhr.status}`));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred during upload'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'));
        });
      });

      // Send request with Basic Auth
      xhr.open('POST', '/api/media/upload');
      
      // Add admin authentication header
      const adminUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin';
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
      xhr.setRequestHeader('Authorization', `Basic ${btoa(`${adminUsername}:${adminPassword}`)}`);
      
      xhr.send(formData);

      // Wait for upload to complete
      const media = await uploadPromise;

      // Update state
      setUploadedMedia(media);
      setProgress(100);
      setIsUploading(false);

      return media;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      setIsUploading(false);
      setProgress(0);
      throw err;
    } finally {
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Cancel ongoing upload
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsUploading(false);
      setProgress(0);
      setError('Upload cancelled');
    }
  }, []);

  /**
   * Reset hook state
   */
  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
    setUploadedMedia(null);
    abortControllerRef.current = null;
  }, []);

  return {
    upload,
    cancel,
    isUploading,
    progress,
    error,
    uploadedMedia,
    reset,
  };
}
