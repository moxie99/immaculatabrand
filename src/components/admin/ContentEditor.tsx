'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Content } from '@/types/content.types';
import { useToast } from '@/lib/hooks/useToast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Homepage Hero form schema
const homepageHeroSchema = z.object({
  key: z.string().min(1, 'Content key is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  heading: z.string().min(1, 'Heading is required'),
  subheading: z.string().min(1, 'Subheading is required'),
  ctaText: z.string().min(1, 'CTA text is required'),
});

// About Page form schema
const aboutPageSchema = z.object({
  key: z.string().min(1, 'Content key is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  story: z.string().min(1, 'Story is required'),
  mission: z.string().min(1, 'Mission is required'),
  values: z.string().min(1, 'Values are required'),
});

type HomepageHeroFormValues = z.infer<typeof homepageHeroSchema>;
type AboutPageFormValues = z.infer<typeof aboutPageSchema>;
type FormValues = HomepageHeroFormValues | AboutPageFormValues;

interface ContentEditorProps {
  contentKey: string;
}

export function ContentEditor({ contentKey }: ContentEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError } = useToast();

  // Determine schema based on content key
  const isHomepageHero = contentKey === 'homepage_hero';
  const schema = isHomepageHero ? homepageHeroSchema : aboutPageSchema;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: isHomepageHero
      ? {
          key: contentKey,
          title: '',
          description: '',
          heading: '',
          subheading: '',
          ctaText: '',
        }
      : {
          key: contentKey,
          title: '',
          description: '',
          story: '',
          mission: '',
          values: '',
        },
  });

  // Fetch content on mount
  useEffect(() => {
    const fetchContent = async () => {
      setIsFetching(true);
      setError(null);

      try {
        const response = await fetch(`/api/content?key=${contentKey}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error?.message || 'Failed to fetch content');
        }

        if (result.success && result.data) {
          const content = result.data as Content;
          
          // Parse data based on content type
          if (contentKey === 'homepage_hero') {
            const data = content.data as any;
            form.reset({
              key: content.key,
              title: content.title,
              description: content.description || '',
              heading: data.heading || '',
              subheading: data.subheading || '',
              ctaText: data.ctaText || '',
            });
          } else if (contentKey === 'about_page') {
            const data = content.data as any;
            form.reset({
              key: content.key,
              title: content.title,
              description: content.description || '',
              story: data.story || '',
              mission: data.mission || '',
              values: Array.isArray(data.values) ? data.values.join('\n') : '',
            });
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch content';
        setError(errorMessage);
        showError('Error', errorMessage);
      } finally {
        setIsFetching(false);
      }
    };

    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentKey]);

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // Convert form values to API format
      let parsedData: Record<string, any>;
      
      if (contentKey === 'homepage_hero') {
        const heroValues = values as HomepageHeroFormValues;
        parsedData = {
          heading: heroValues.heading,
          subheading: heroValues.subheading,
          ctaText: heroValues.ctaText,
          ctaLink: '/products', // Fixed link to products page
        };
      } else if (contentKey === 'about_page') {
        const aboutValues = values as AboutPageFormValues;
        parsedData = {
          story: aboutValues.story,
          mission: aboutValues.mission,
          values: aboutValues.values.split('\n').filter(v => v.trim() !== ''),
        };
      } else {
        throw new Error('Unknown content type');
      }

      // Get Basic Auth credentials from environment
      const username = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin';
      const password = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin';
      const credentials = btoa(`${username}:${password}`);

      const response = await fetch('/api/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`,
        },
        body: JSON.stringify({
          key: values.key,
          title: values.title,
          description: values.description,
          data: parsedData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to update content');
      }

      success('Success', 'Content updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update content';
      setError(errorMessage);
      showError('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading content...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error && !form.formState.isDirty) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Edit Content</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content Key</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormDescription>
                  Unique identifier for this content (cannot be changed)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter content title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter content description"
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Homepage Hero Fields */}
          {contentKey === 'homepage_hero' && (
            <>
              <FormField
                control={form.control}
                name="heading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heading</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter main heading" {...field} />
                    </FormControl>
                    <FormDescription>
                      The main headline displayed on the homepage
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subheading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subheading</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter subheading text"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Supporting text below the main heading
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ctaText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Call-to-Action Text</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Shop Now" {...field} />
                    </FormControl>
                    <FormDescription>
                      Text displayed on the button (links to products page)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {/* About Page Fields */}
          {contentKey === 'about_page' && (
            <>
              <FormField
                control={form.control}
                name="story"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Our Story</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell your bakery's story"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Share the history and background of your bakery
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Our Mission</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your mission"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      What drives your bakery and what you aim to achieve
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="values"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Our Values</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter one value per line"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      List your core values, one per line (e.g., Quality, Authenticity, Community)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isLoading || !form.formState.isDirty}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
