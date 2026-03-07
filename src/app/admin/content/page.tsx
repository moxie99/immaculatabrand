'use client';

import React, { useState } from 'react';
import { ContentEditor } from '@/components/admin/ContentEditor';
import { SimpleContentEditor } from '@/components/admin/SimpleContentEditor';
import { ContactInfoEditor } from '@/components/admin/ContactInfoEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

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
  const [activeTab, setActiveTab] = useState('contact_info');

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
          <TabsTrigger value="contact_info">Contact Info</TabsTrigger>
          <TabsTrigger value="homepage_hero">Homepage Hero</TabsTrigger>
          <TabsTrigger value="about_section">About Section</TabsTrigger>
          <TabsTrigger value="featured_section">Featured Section</TabsTrigger>
          <TabsTrigger value="cakes_section">Cakes Section</TabsTrigger>
          <TabsTrigger value="foodstuffs_section">Foodstuffs Section</TabsTrigger>
          <TabsTrigger value="fish_section">Fish Section</TabsTrigger>
          <TabsTrigger value="carousel">Carousel Images</TabsTrigger>
          <TabsTrigger value="about_page">About Page</TabsTrigger>
        </TabsList>

        <TabsContent value="contact_info" className="mt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Contact Information</h2>
              <p className="text-muted-foreground mt-1">
                Manage business address, email, and phone numbers used across the site
              </p>
            </div>
            <ContactInfoEditor />
          </div>
        </TabsContent>

        <TabsContent value="homepage_hero" className="mt-6">
          <ContentEditor contentKey="homepage_hero" />
        </TabsContent>

        <TabsContent value="about_section" className="mt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">About Us Section</h2>
              <p className="text-muted-foreground mt-1">
                Edit the title, subtitle, and content for the About Us section on the homepage (with carousel)
              </p>
            </div>
            <div className="grid gap-6">
              <Card className="p-6">
                <SimpleContentEditor 
                  contentKey="about_section_title" 
                  label="Section Title"
                  placeholder="e.g., A Taste of Tradition"
                />
              </Card>
              <Card className="p-6">
                <SimpleContentEditor 
                  contentKey="about_section_subtitle" 
                  label="Section Subtitle"
                  placeholder="e.g., Our Story"
                />
              </Card>
              <Card className="p-6">
                <SimpleContentEditor 
                  contentKey="about_section_content" 
                  label="Section Content"
                  multiline
                  placeholder="Enter the company history and biography..."
                />
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="featured_section" className="mt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Featured Products Section</h2>
              <p className="text-muted-foreground mt-1">
                Edit the title and subtitle for the Featured Products section on the homepage
              </p>
            </div>
            <div className="grid gap-6">
              <Card className="p-6">
                <SimpleContentEditor 
                  contentKey="featured_section_title" 
                  label="Section Title"
                  placeholder="e.g., Featured Products"
                />
              </Card>
              <Card className="p-6">
                <SimpleContentEditor 
                  contentKey="featured_section_subtitle" 
                  label="Section Subtitle"
                  multiline
                  placeholder="e.g., Discover our handpicked selection..."
                />
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cakes_section" className="mt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Cakes & Pastries Section</h2>
              <p className="text-muted-foreground mt-1">
                Edit the title and subtitle for the Cakes and Pastries section on the homepage
              </p>
            </div>
            <div className="grid gap-6">
              <Card className="p-6">
                <SimpleContentEditor 
                  contentKey="cakes_section_title" 
                  label="Section Title"
                  placeholder="e.g., Our Cakes and Pastries"
                />
              </Card>
              <Card className="p-6">
                <SimpleContentEditor 
                  contentKey="cakes_section_subtitle" 
                  label="Section Subtitle"
                  multiline
                  placeholder="e.g., Discover our authentic African confectioneries..."
                />
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="foodstuffs_section" className="mt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Foodstuffs Section</h2>
              <p className="text-muted-foreground mt-1">
                Edit the title and subtitle for the Foodstuffs section on the homepage
              </p>
            </div>
            <div className="grid gap-6">
              <Card className="p-6">
                <SimpleContentEditor 
                  contentKey="foodstuffs_section_title" 
                  label="Section Title"
                  placeholder="e.g., Premium Foodstuffs"
                />
              </Card>
              <Card className="p-6">
                <SimpleContentEditor 
                  contentKey="foodstuffs_section_subtitle" 
                  label="Section Subtitle"
                  multiline
                  placeholder="e.g., Explore our selection of authentic African foodstuffs..."
                />
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="fish_section" className="mt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Fish Section</h2>
              <p className="text-muted-foreground mt-1">
                Edit the title and subtitle for the Fish section on the homepage
              </p>
            </div>
            <div className="grid gap-6">
              <Card className="p-6">
                <SimpleContentEditor 
                  contentKey="fish_section_title" 
                  label="Section Title"
                  placeholder="e.g., Fresh Fish Selection"
                />
              </Card>
              <Card className="p-6">
                <SimpleContentEditor 
                  contentKey="fish_section_subtitle" 
                  label="Section Subtitle"
                  multiline
                  placeholder="e.g., Discover our premium selection of fresh and preserved fish..."
                />
              </Card>
            </div>
          </div>
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
