'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/lib/hooks/useToast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const simpleContentSchema = z.object({
  value: z.string().min(1, 'Value is required'),
});

type FormValues = z.infer<typeof simpleContentSchema>;

interface SimpleContentEditorProps {
  contentKey: string;
  label: string;
  multiline?: boolean;
  placeholder?: string;
}

export function SimpleContentEditor({ 
  contentKey, 
  label, 
  multiline = false,
  placeholder 
}: SimpleContentEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { success, error: showError } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(simpleContentSchema),
    defaultValues: {
      value: '',
    },
  });

  // Fetch content on mount
  useEffect(() => {
    const fetchContent = async () => {
      setIsFetching(true);

      try {
        const response = await fetch(`/api/content?key=${contentKey}`);
        const result = await response.json();

        if (response.ok && result.success && result.data) {
          // Extract value from data object
          const value = result.data.data?.value || '';
          form.reset({
            value: value,
          });
        }
      } catch (err) {
        console.error('Failed to fetch content:', err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchContent();
  }, [contentKey, form]);

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);

    try {
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
          key: contentKey,
          title: label,
          data: { value: values.value },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to save content');
      }

      success('Content Saved', `${label} has been updated successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save content';
      showError('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{label}</FormLabel>
              <FormControl>
                {multiline ? (
                  <Textarea
                    placeholder={placeholder || `Enter ${label.toLowerCase()}`}
                    className="min-h-[100px]"
                    {...field}
                  />
                ) : (
                  <Input
                    placeholder={placeholder || `Enter ${label.toLowerCase()}`}
                    {...field}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
}
