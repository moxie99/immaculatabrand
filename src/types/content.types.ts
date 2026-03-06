/**
 * Content type definitions
 * These types align with the Content Mongoose schema
 */

/**
 * Content interface
 * Represents editable site content (homepage hero, about page, etc.)
 */
export interface Content {
  _id: string;
  key: string;
  title: string;
  description?: string;
  data: Record<string, any>;
  updatedAt: Date;
}

/**
 * Content creation/update input
 */
export interface ContentInput {
  key: string;
  title: string;
  description?: string;
  data: Record<string, any>;
}

/**
 * Homepage hero content data structure
 */
export interface HomepageHeroData {
  heading: string;
  subheading: string;
  ctaText: string;
  ctaLink: string;
}

/**
 * About page content data structure
 */
export interface AboutPageData {
  story: string;
  mission: string;
  values: string[];
}
