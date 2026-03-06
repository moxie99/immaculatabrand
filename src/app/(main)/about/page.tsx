import React from 'react';
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getContentByKey } from '@/lib/services/content.service';

/**
 * About Page
 * 
 * Route: /about
 * 
 * Features:
 * - Fetch content from Content collection (key=about_page)
 * - Display company story, mission, values
 * - Server-side rendering for SEO
 * - SEO metadata
 * 
 * Requirements: Design - Main Application Pages (Task 23.5)
 */

export const metadata: Metadata = {
  title: 'About Us | Confectionary Platform',
  description: 'Learn about our mission to bring authentic African delicacies to your doorstep. Discover our story, values, and commitment to quality.',
  keywords: ['about us', 'African food', 'company story', 'mission', 'values'],
  openGraph: {
    title: 'About Us | Confectionary Platform',
    description: 'Learn about our mission to bring authentic African delicacies to your doorstep.',
    type: 'website',
  },
};

/**
 * About Page Component
 */
export default async function AboutPage() {
  let content;

  try {
    content = await getContentByKey('about_page');
  } catch (error) {
    console.error('Failed to fetch about page content:', error);
    // Use default content if fetch fails
    content = {
      data: {
        story: 'We are passionate about bringing authentic African food products to your table. Our journey began with a simple mission: to make traditional African delicacies accessible to everyone.',
        mission: 'Our mission is to preserve and share the rich culinary heritage of Africa by providing high-quality, authentic food products with detailed preparation guides.',
        values: ['Quality', 'Authenticity', 'Customer Service', 'Cultural Heritage'],
      },
    };
  }

  const { story, mission, values } = content.data;

  return (
    <main className="min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            About Us
          </h1>
          <p className="text-lg text-muted-foreground">
            Bringing authentic African delicacies to your doorstep
          </p>
        </div>

        {/* Our Story Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Our Story</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {story}
            </p>
          </CardContent>
        </Card>

        {/* Our Mission Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {mission}
            </p>
          </CardContent>
        </Card>

        {/* Our Values Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Our Values</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Array.isArray(values) && values.map((value: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{value}</h3>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Ready to explore our products?
          </h2>
          <p className="text-muted-foreground mb-6">
            Browse our selection of authentic African confectioneries, fish products, and foodstuffs
          </p>
          <a
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            Browse Products
          </a>
        </div>
      </div>
    </main>
  );
}
