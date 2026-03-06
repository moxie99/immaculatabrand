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
          Edit site content and messaging
        </p>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="homepage_hero">Homepage Hero</TabsTrigger>
          <TabsTrigger value="about_page">About Page</TabsTrigger>
        </TabsList>

        <TabsContent value="homepage_hero" className="mt-6">
          <ContentEditor contentKey="homepage_hero" />
        </TabsContent>

        <TabsContent value="about_page" className="mt-6">
          <ContentEditor contentKey="about_page" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
