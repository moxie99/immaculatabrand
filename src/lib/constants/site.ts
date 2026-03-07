/**
 * Site Configuration Constants
 * 
 * Centralized configuration for site-wide settings like brand name, tagline, etc.
 * Update these values to change them across the entire application.
 */

export const SITE_CONFIG = {
  // Brand Information
  name: 'Immaculate Brand',
  tagline: 'Premium Quality Confectioneries & Delicacies',
  
  // SEO
  description: 'Discover premium confectioneries and delicacies delivered to your doorstep. Browse our curated selection of traditional treats and sweets.',
  keywords: ['confectionery', 'sweets', 'traditional delicacies', 'treats', 'authentic food'],
  
  // Contact
  email: 'info@immaculatebrand.com',
  phone: '+44 (0) 123 456 7890',
  
  // Social Media (optional - add your links)
  social: {
    facebook: '',
    instagram: '',
    twitter: '',
  },
  
  // Business Info
  currentYear: new Date().getFullYear(),
};

// Export individual constants for convenience
export const BRAND_NAME = SITE_CONFIG.name;
export const BRAND_TAGLINE = SITE_CONFIG.tagline;
export const SITE_DESCRIPTION = SITE_CONFIG.description;
export const SITE_KEYWORDS = SITE_CONFIG.keywords;
