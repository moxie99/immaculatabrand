'use client';

import React, { useState } from 'react';
import { ContentEditor } from '@/components/admin/ContentEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Content Management Page
 * 
 * Route: /admin/content
 * 
 * Features:
 * - Render ContentEditor component
 * - Add tabs for different content sections (Homepage Hero, About Page)
 * 
 * Requirements: Design - Dashboard Pages (Task 24.8)
 */

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState('homepage_hero');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Content Management</h1>
        <p className="text-muted-foreground mt-2">
          Edit site content, messaging, and carousel images
        </p>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="homepage_hero">Homepage Hero</TabsTrigger>
          <TabsTrigger value="carousel">Carousel Images</TabsTrigger>
          <TabsTrigger value="about_page">About Page</TabsTrigger>
        </TabsList>

        <TabsContent value="homepage_hero" className="mt-6">
          <ContentEditor contentKey="homepage_hero" />
        </TabsContent>

        <TabsContent value="carousel" className="mt-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold">Carousel Images</h2>
              <p className="text-muted-foreground mt-1">
                Manage images that appear in the homepage carousel. Upload carousel images from the Media page.
              </p>
            </div>
            <div className="p-6 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-4">
                To add or manage carousel images:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to the <a href="/admin/media" className="text-primary hover:underline font-medium">Media page</a></li>
                <li>Select "Carousel" as the image type</li>
                <li>Upload your images</li>
                <li>Images will automatically appear in the homepage carousel</li>
              </ol>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="about_page" className="mt-6">
          <ContentEditor contentKey="about_page" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
