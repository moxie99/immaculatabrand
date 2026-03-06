// @ts-nocheck
/**
 * Example usage of useMediaUpload hook
 * 
 * This file demonstrates how to use the useMediaUpload hook
 * in a React component for uploading images to Cloudinary.
 */

import React, { useState } from 'react';
import { useMediaUpload } from './useMediaUpload';
import { MediaType } from '@/types/media.types';

/**
 * Example component showing basic usage
 */
export function BasicUploadExample() {
  const { upload, isUploading, progress, error, uploadedMedia, reset } = useMediaUpload();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      reset(); // Reset previous upload state
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const media = await upload({
        file: selectedFile,
        type: 'product',
        altText: 'Product image',
      });
      console.log('Upload successful:', media);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!selectedFile || isUploading}>
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>

      {isUploading && (
        <div>
          <p>Progress: {progress}%</p>
          <progress value={progress} max={100} />
        </div>
      )}

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {uploadedMedia && (
        <div>
          <p>Upload successful!</p>
          <img src={uploadedMedia.secureUrl} alt={uploadedMedia.altText} width={200} />
        </div>
      )}
    </div>
  );
}

/**
 * Example component with progress tracking
 */
export function UploadWithProgressExample() {
  const { upload, isUploading, progress, error, cancel } = useMediaUpload();

  // Example upload handler (commented out to avoid unused variable warning)
  // const handleUpload = async (file: File, type: MediaType) => {
  //   try {
  //     await upload({
  //       file,
  //       type,
  //       altText: `${type} image`,
  //       onProgress: (p) => {
  //         console.log(`Upload progress: ${p}%`);
  //       },
  //     });
  //   } catch (err) {
  //     console.error('Upload failed:', err);
  //   }
  // };

  return (
    <div>
      {isUploading && (
        <div>
          <p>Uploading: {progress}%</p>
          <button onClick={cancel}>Cancel Upload</button>
        </div>
      )}
      {error && <p>Error: {error}</p>}
    </div>
  );
}

/**
 * Example component for multiple media types
 */
export function MultiTypeUploadExample() {
  const { upload, isUploading, uploadedMedia, reset } = useMediaUpload();
  const [mediaType, setMediaType] = useState<MediaType>('product');

  const handleUpload = async (file: File) => {
    reset();
    try {
      await upload({
        file,
        type: mediaType,
        altText: `${mediaType} image`,
      });
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div>
      <select value={mediaType} onChange={(e) => setMediaType(e.target.value as MediaType)}>
        <option value="hero">Hero</option>
        <option value="carousel">Carousel</option>
        <option value="product">Product</option>
        <option value="category">Category</option>
      </select>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
        disabled={isUploading}
      />

      {uploadedMedia && (
        <div>
          <p>Uploaded {uploadedMedia.type} image</p>
          <img src={uploadedMedia.secureUrl} alt={uploadedMedia.altText} width={200} />
        </div>
      )}
    </div>
  );
}

/**
 * Example component with drag and drop
 */
export function DragDropUploadExample() {
  const { upload, isUploading, progress, error, uploadedMedia } = useMediaUpload();
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (!file) return;

    try {
      await upload({
        file,
        type: 'product',
        altText: file.name,
        onProgress: (p) => console.log(`Progress: ${p}%`),
      });
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      style={{
        border: `2px dashed ${isDragging ? 'blue' : 'gray'}`,
        padding: '20px',
        textAlign: 'center',
      }}
    >
      {isUploading ? (
        <div>
          <p>Uploading... {progress}%</p>
          <progress value={progress} max={100} style={{ width: '100%' }} />
        </div>
      ) : uploadedMedia ? (
        <div>
          <p>Upload successful!</p>
          <img src={uploadedMedia.secureUrl} alt={uploadedMedia.altText} width={200} />
        </div>
      ) : (
        <p>Drag and drop an image here</p>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
