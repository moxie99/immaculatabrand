/**
 * ImageCarousel Example
 * 
 * This example demonstrates the ImageCarousel component usage.
 * The component fetches carousel images from the API and displays them
 * in an auto-playing carousel with navigation controls.
 */

import React from 'react';
import ImageCarousel from './ImageCarousel';

export default function ImageCarouselExample() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Image Carousel Example</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Default Carousel</h2>
        <p className="text-muted-foreground mb-4">
          The carousel automatically fetches images from /api/media/carousel and displays them
          with auto-play functionality. Hover over the carousel to pause auto-play.
        </p>
        <ImageCarousel />
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Features:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Fetches carousel images from Media collection (type=carousel)</li>
          <li>Auto-play with 4-second delay</li>
          <li>Pause on hover</li>
          <li>Previous/Next navigation buttons</li>
          <li>Dot indicators showing current slide</li>
          <li>Responsive design (adjusts for mobile/tablet/desktop)</li>
          <li>Loading, error, and empty states</li>
          <li>Uses HTTPS URLs for all images</li>
        </ul>
      </div>
    </div>
  );
}
