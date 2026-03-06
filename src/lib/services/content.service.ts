/**
 * Content Service Layer
 * Handles all content-related business logic and database operations
 */

import Content, { IContent } from '../db/models/Content';
import connectDB from '../db/mongodb';
import { ContentInput } from '../../types/content.types';
import { NotFoundError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Get content by key
 * @param key - Unique content key (e.g., "homepage_hero", "about_page")
 * @returns Content document
 * @throws NotFoundError if content doesn't exist
 */
export async function getContentByKey(key: string): Promise<IContent> {
  try {
    await connectDB();
    
    logger.info('Fetching content by key', { key });
    
    const content = await Content.findByKey(key);
    
    if (!content) {
      throw new NotFoundError(`Content with key '${key}' not found`);
    }
    
    logger.info('Content fetched successfully', { key, title: content.title });
    
    return content;
  } catch (error) {
    logger.error('Failed to fetch content by key', { error, key });
    
    if (error instanceof NotFoundError) {
      throw error;
    }
    
    throw error;
  }
}

/**
 * Update or create content (upsert)
 * @param input - Content data
 * @returns Updated or created content document
 * @throws ValidationError if content data is invalid
 */
export async function updateContent(input: ContentInput): Promise<IContent> {
  try {
    await connectDB();
    
    logger.info('Updating content', { key: input.key, title: input.title });
    
    // Use the model's upsert method
    const content = await Content.upsertByKey(
      input.key,
      input.title,
      input.data,
      input.description
    );
    
    logger.info('Content updated successfully', { 
      key: content.key, 
      title: content.title 
    });
    
    return content;
  } catch (error) {
    logger.error('Failed to update content', { error, input });
    
    if (error instanceof Error && error.name === 'ValidationError') {
      throw new ValidationError('Content validation failed', { general: [error.message] });
    }
    
    throw error;
  }
}

/**
 * Get all content records
 * @returns Array of all content documents
 */
export async function getAllContent(): Promise<IContent[]> {
  try {
    await connectDB();
    
    logger.info('Fetching all content');
    
    const content = await Content.find().sort({ key: 1 });
    
    logger.info('All content fetched successfully', { count: content.length });
    
    return content;
  } catch (error) {
    logger.error('Failed to fetch all content', { error });
    throw error;
  }
}

/**
 * Get all content keys
 * @returns Array of content keys
 */
export async function getAllContentKeys(): Promise<string[]> {
  try {
    await connectDB();
    
    logger.info('Fetching all content keys');
    
    const keys = await Content.getAllKeys();
    
    logger.info('Content keys fetched successfully', { count: keys.length });
    
    return keys;
  } catch (error) {
    logger.error('Failed to fetch content keys', { error });
    throw error;
  }
}

/**
 * Initialize default content if it doesn't exist
 * Creates homepage_hero and about_page content with default values
 */
export async function initializeDefaultContent(): Promise<void> {
  try {
    await connectDB();
    
    logger.info('Initializing default content');
    
    // Initialize homepage hero content
    const homepageHeroExists = await Content.findByKey('homepage_hero');
    if (!homepageHeroExists) {
      await Content.upsertByKey(
        'homepage_hero',
        'Homepage Hero Section',
        {
          heading: 'Authentic African Delicacies',
          subheading: 'Delivered to Your Doorstep',
          ctaText: 'Browse Products',
          ctaLink: '/products',
        },
        'Hero section content for the homepage'
      );
      logger.info('Created default homepage_hero content');
    }
    
    // Initialize about page content
    const aboutPageExists = await Content.findByKey('about_page');
    if (!aboutPageExists) {
      await Content.upsertByKey(
        'about_page',
        'About Us Content',
        {
          story: 'We are passionate about bringing authentic African food products to your table. Our journey began with a simple mission: to make traditional African delicacies accessible to everyone.',
          mission: 'Our mission is to preserve and share the rich culinary heritage of Africa by providing high-quality, authentic food products with detailed preparation guides.',
          values: ['Quality', 'Authenticity', 'Customer Service', 'Cultural Heritage'],
        },
        'About page content including story, mission, and values'
      );
      logger.info('Created default about_page content');
    }
    
    logger.info('Default content initialization complete');
  } catch (error) {
    logger.error('Failed to initialize default content', { error });
    throw error;
  }
}

/**
 * Delete content by key
 * @param key - Content key to delete
 * @returns True if deletion was successful
 * @throws NotFoundError if content doesn't exist
 */
export async function deleteContent(key: string): Promise<boolean> {
  try {
    await connectDB();
    
    logger.info('Deleting content', { key });
    
    const result = await Content.deleteOne({ key: key.toLowerCase() });
    
    if (result.deletedCount === 0) {
      throw new NotFoundError(`Content with key '${key}' not found`);
    }
    
    logger.info('Content deleted successfully', { key });
    
    return true;
  } catch (error) {
    logger.error('Failed to delete content', { error, key });
    
    if (error instanceof NotFoundError) {
      throw error;
    }
    
    throw error;
  }
}

/**
 * Check if content exists by key
 * @param key - Content key to check
 * @returns True if content exists, false otherwise
 */
export async function contentExists(key: string): Promise<boolean> {
  try {
    await connectDB();
    
    const content = await Content.findByKey(key);
    
    return content !== null;
  } catch (error) {
    logger.error('Failed to check content existence', { error, key });
    throw error;
  }
}
