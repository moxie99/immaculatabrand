'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MediaType, Media } from '@/types/media.types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';

interface MediaGalleryProps {
  mediaType?: MediaType | 'all';
}

export default function MediaGallery({ mediaType = 'all' }: MediaGalleryProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<Media | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch media on mount and when mediaType changes
  useEffect(() => {
    fetchMedia();
  }, [mediaType]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError(null);

      const credentials = btoa(
        `${process.env.NEXT_PUBLIC_ADMIN_USERNAME}:${process.env.NEXT_PUBLIC_ADMIN_PASSWORD}`
      );

      const response = await fetch(`/api/media/${mediaType}`, {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch media');
      }

      const data = await response.json();

      if (data.success) {
        setMedia(data.data);
      } else {
        throw new Error(data.error?.message || 'Failed to fetch media');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (mediaItem: Media) => {
    setMediaToDelete(mediaItem);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!mediaToDelete) return;

    try {
      setDeleting(true);

      const credentials = btoa(
        `${process.env.NEXT_PUBLIC_ADMIN_USERNAME}:${process.env.NEXT_PUBLIC_ADMIN_PASSWORD}`
      );

      const response = await fetch(
        `/api/media/delete/${encodeURIComponent(mediaToDelete.cloudinaryId)}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Basic ${credentials}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete media');
      }

      const data = await response.json();

      if (data.success) {
        // Remove deleted media from state
        setMedia((prev) => prev.filter((m) => m._id !== mediaToDelete._id));
        setDeleteDialogOpen(false);
        setMediaToDelete(null);
      } else {
        throw new Error(data.error?.message || 'Failed to delete media');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete media');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setMediaToDelete(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading media...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchMedia}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (media.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No media found</p>
          <p className="text-sm text-muted-foreground">
            Upload images to see them here
          </p>
        </div>
      </div>
    );
  }

  // Gallery grid
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {media.map((item) => (
          <Card key={item._id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-square">
                <Image
                  src={item.secureUrl}
                  alt={item.altText}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2 p-4">
              <div className="w-full">
                <p className="text-sm font-medium truncate">{item.altText}</p>
                <p className="text-xs text-muted-foreground">
                  {item.width} × {item.height} • {item.format.toUpperCase()}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  Type: {item.type}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => handleDeleteClick(item)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Media</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this media? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {mediaToDelete && (
            <div className="py-4">
              <div className="relative aspect-video w-full max-w-sm mx-auto">
                <Image
                  src={mediaToDelete.secureUrl}
                  alt={mediaToDelete.altText}
                  fill
                  className="object-cover rounded-md"
                  sizes="400px"
                />
              </div>
              <p className="text-sm text-center mt-2">{mediaToDelete.altText}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
