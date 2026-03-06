# Requirements Document: Confectionary Platform

## Introduction

The Confectionary Platform is a simplified MVP web application designed to showcase African food products (confectionary items, fish products, and diverse African foodstuffs) and collect customer inquiries. The platform enables visitors to browse products with detailed preparation guides and submit inquiry forms, while administrators manage products, orders, and site content through a protected dashboard. This is an inquiry-based system without payment processing - orders represent customer interest for manual follow-up.

## Glossary

- **System**: The Confectionary Platform web application
- **Public_User**: A visitor browsing the public-facing website without authentication
- **Admin**: An authenticated user with access to the admin dashboard
- **Product**: A food item (confectionary, fish, or foodstuff) displayed on the platform
- **Order**: A customer inquiry containing contact information and product interests
- **Media**: Images stored in Cloudinary (hero, carousel, product, or category images)
- **Content**: Editable site content managed through the admin dashboard
- **Preparation_Guide**: Step-by-step instructions for preparing a product
- **Featured_Product**: A product marked to appear on the homepage
- **Active_Product**: A product visible to public users
- **Order_Status**: The state of an order (new, contacted, completed, cancelled)
- **Cloudinary**: External CDN service for image storage and delivery
- **MongoDB**: Database system storing all application data
- **Basic_Auth**: Simple username/password authentication for admin access

## Requirements

### Requirement 1: Product Display and Discovery

**User Story:** As a public user, I want to browse African food products with detailed information and images, so that I can learn about products and decide what interests me.

#### Acceptance Criteria

1. WHEN a public user visits the homepage, THE System SHALL display featured products with images, names, and prices
2. WHEN a public user navigates to the products page, THE System SHALL display all active products organized by category
3. WHEN a public user selects a product, THE System SHALL display the product detail page with description, images, price, and preparation guide
4. WHEN a product has multiple images, THE System SHALL display all images in a viewable gallery
5. WHERE a product has preparation steps, THE System SHALL display them in sequential order with step numbers, titles, descriptions, and optional images
6. WHERE a product has nutrition information, THE System SHALL display serving size, calories, protein, carbs, and fat content
7. THE System SHALL load all product images from Cloudinary CDN with automatic format optimization
8. THE System SHALL display products in three categories: confectionary, fish, and foodstuffs

### Requirement 2: Customer Inquiry Submission

**User Story:** As a public user, I want to submit an inquiry about products I'm interested in, so that the business can contact me to complete the order.

#### Acceptance Criteria

1. WHEN a public user views a product detail page, THE System SHALL display an inquiry form
2. THE System SHALL require customer name, email, and phone number in the inquiry form
3. THE System SHALL allow customers to specify product quantities in their inquiry
4. WHERE a customer wants to add a message, THE System SHALL provide a message text field
5. WHERE a customer wants to provide shipping information, THE System SHALL provide address fields
6. WHEN a customer submits a valid inquiry form, THE System SHALL create an order record in MongoDB
7. WHEN an order is created, THE System SHALL generate a unique order number
8. WHEN an order is created, THE System SHALL display a confirmation message with the order number
9. IF a customer submits an inquiry with invalid email format, THEN THE System SHALL reject the submission and display an error message
10. IF a customer submits an inquiry with missing required fields, THEN THE System SHALL reject the submission and display field-specific error messages

### Requirement 3: Homepage Content Display

**User Story:** As a public user, I want to see an engaging homepage with hero content, image carousel, and featured products, so that I can quickly understand what the platform offers.

#### Acceptance Criteria

1. WHEN a public user visits the homepage, THE System SHALL display a hero section with heading, subheading, and call-to-action button
2. WHEN a public user visits the homepage, THE System SHALL display an image carousel with multiple images
3. WHEN a public user visits the homepage, THE System SHALL display up to 12 featured products
4. THE System SHALL load hero images from Cloudinary with type "hero"
5. THE System SHALL load carousel images from Cloudinary with type "carousel"
6. THE System SHALL only display products marked as both featured and active on the homepage
7. WHEN a public user clicks the hero call-to-action button, THE System SHALL navigate to the products page

### Requirement 4: Product Search and Filtering

**User Story:** As a public user, I want to filter products by category, so that I can find specific types of products quickly.

#### Acceptance Criteria

1. WHEN a public user is on the products page, THE System SHALL display category filter options
2. WHEN a public user selects a category filter, THE System SHALL display only products in that category
3. THE System SHALL support filtering by confectionary, fish, and foodstuffs categories
4. WHEN no products match the selected filter, THE System SHALL display a message indicating no products found
5. THE System SHALL maintain the selected filter when navigating between pages

### Requirement 5: Admin Authentication

**User Story:** As an admin, I want to securely access the admin dashboard, so that only authorized users can manage the platform.

#### Acceptance Criteria

1. WHEN a user attempts to access any admin route, THE System SHALL require Basic Auth credentials
2. IF a user provides invalid credentials, THEN THE System SHALL return a 401 Unauthorized response
3. IF a user provides valid credentials, THEN THE System SHALL grant access to the admin dashboard
4. THE System SHALL validate credentials against environment variables ADMIN_USERNAME and ADMIN_PASSWORD
5. THE System SHALL protect all routes under /admin/* with authentication middleware
6. THE System SHALL allow public access to all non-admin routes without authentication

### Requirement 6: Admin Product Management

**User Story:** As an admin, I want to create, edit, and delete products, so that I can maintain an up-to-date product catalog.

#### Acceptance Criteria

1. WHEN an admin accesses the products management page, THE System SHALL display all products with their status
2. WHEN an admin creates a new product, THE System SHALL require name, category, description, and price
3. WHEN an admin creates a new product, THE System SHALL generate a unique URL slug from the product name
4. WHEN an admin adds images to a product, THE System SHALL store Cloudinary URLs in the product record
5. WHEN an admin adds preparation steps, THE System SHALL store them with step number, title, description, optional image, and optional duration
6. WHERE an admin provides nutrition information, THE System SHALL store serving size, calories, protein, carbs, and fat
7. WHEN an admin marks a product as featured, THE System SHALL make it eligible for homepage display
8. WHEN an admin marks a product as inactive, THE System SHALL hide it from public pages
9. WHEN an admin updates a product, THE System SHALL save changes to MongoDB
10. WHEN an admin deletes a product, THE System SHALL remove it from MongoDB
11. IF an admin attempts to create a product with a duplicate slug, THEN THE System SHALL reject the creation and display an error message

### Requirement 7: Admin Order Management

**User Story:** As an admin, I want to view and manage customer inquiries, so that I can follow up with customers and track order status.

#### Acceptance Criteria

1. WHEN an admin accesses the orders page, THE System SHALL display all orders with order number, customer name, date, and status
2. WHEN an admin selects an order, THE System SHALL display full order details including customer contact information, items, message, and shipping address
3. WHEN an admin updates an order status, THE System SHALL save the new status to MongoDB
4. THE System SHALL support order status values: new, contacted, completed, cancelled
5. THE System SHALL allow status transitions from new to contacted or cancelled
6. THE System SHALL allow status transitions from contacted to completed or cancelled
7. THE System SHALL prevent status changes from completed or cancelled states
8. WHEN displaying orders, THE System SHALL sort them by creation date in descending order
9. WHERE an admin wants to filter orders, THE System SHALL support filtering by status

### Requirement 8: Admin Media Management

**User Story:** As an admin, I want to upload and manage images for the website, so that I can control the visual presentation of the platform.

#### Acceptance Criteria

1. WHEN an admin uploads an image, THE System SHALL send it to Cloudinary for storage
2. WHEN uploading an image, THE System SHALL require the admin to specify the image type (hero, carousel, product, or category)
3. WHEN an image is uploaded to Cloudinary, THE System SHALL store the media record in MongoDB with cloudinaryId, URLs, type, dimensions, and format
4. THE System SHALL apply automatic transformations: maximum 1200x800 dimensions, automatic quality, automatic format
5. IF an admin uploads a file larger than 5MB, THEN THE System SHALL reject the upload and display an error message
6. IF an admin uploads a non-image file, THEN THE System SHALL reject the upload and display an error message
7. WHEN an admin views the media gallery, THE System SHALL display all uploaded images organized by type
8. THE System SHALL store both HTTP and HTTPS URLs for each image
9. THE System SHALL use HTTPS URLs for all image display

### Requirement 9: Admin Content Management

**User Story:** As an admin, I want to edit site content like homepage hero text and about page content, so that I can update messaging without code changes.

#### Acceptance Criteria

1. WHEN an admin accesses the content management page, THE System SHALL display all editable content sections
2. WHEN an admin updates content, THE System SHALL save changes to MongoDB
3. THE System SHALL store content with a unique key identifier
4. THE System SHALL support flexible JSON data structure for different content types
5. WHEN public pages load, THE System SHALL fetch current content from MongoDB
6. THE System SHALL support content for homepage hero section with heading, subheading, CTA text, and CTA link
7. WHERE content includes structured data, THE System SHALL preserve the data structure when saving

### Requirement 10: Admin Dashboard Overview

**User Story:** As an admin, I want to see a dashboard with key metrics and recent activity, so that I can quickly understand platform status.

#### Acceptance Criteria

1. WHEN an admin accesses the admin dashboard home, THE System SHALL display total number of products
2. WHEN an admin accesses the admin dashboard home, THE System SHALL display total number of orders
3. WHEN an admin accesses the admin dashboard home, THE System SHALL display number of new orders
4. WHEN an admin accesses the admin dashboard home, THE System SHALL display recent orders (last 10)
5. THE System SHALL calculate dashboard statistics from current MongoDB data

### Requirement 11: Responsive Design and Accessibility

**User Story:** As a public user, I want the website to work well on my mobile device and be accessible, so that I can browse products regardless of my device or abilities.

#### Acceptance Criteria

1. THE System SHALL display correctly on mobile devices (320px minimum width)
2. THE System SHALL display correctly on tablet devices (768px minimum width)
3. THE System SHALL display correctly on desktop devices (1024px minimum width)
4. THE System SHALL provide alt text for all images
5. THE System SHALL use semantic HTML elements for proper screen reader support
6. THE System SHALL ensure sufficient color contrast for text readability
7. THE System SHALL support keyboard navigation for all interactive elements
8. THE System SHALL use Shadcn UI components built on Radix UI primitives for accessibility compliance

### Requirement 12: Performance and Optimization

**User Story:** As a public user, I want pages to load quickly, so that I can browse products without delays.

#### Acceptance Criteria

1. THE System SHALL use Next.js Image component for automatic image optimization
2. THE System SHALL implement lazy loading for below-the-fold images
3. THE System SHALL serve images in WebP format for browsers that support it
4. THE System SHALL use Cloudinary CDN for global image delivery
5. THE System SHALL implement Incremental Static Regeneration for product pages with 60-second revalidation
6. THE System SHALL use MongoDB indexes on slug, category, isFeatured, isActive, orderNumber, customerEmail, status, and createdAt fields
7. THE System SHALL cache static pages at Vercel CDN edge locations
8. THE System SHALL use Server Components to reduce client-side JavaScript bundle size

### Requirement 13: Data Validation and Security

**User Story:** As a system administrator, I want all user inputs validated and secured, so that the platform is protected from malicious activity.

#### Acceptance Criteria

1. THE System SHALL validate all API inputs using Zod schemas
2. THE System SHALL sanitize user inputs to prevent XSS attacks
3. THE System SHALL validate email format using standard email regex
4. THE System SHALL validate phone number is non-empty
5. THE System SHALL validate product prices are positive numbers
6. THE System SHALL validate product categories are one of: confectionary, fish, foodstuffs
7. THE System SHALL validate order status is one of: new, contacted, completed, cancelled
8. THE System SHALL validate media type is one of: hero, carousel, product, category
9. THE System SHALL set security headers: X-Frame-Options, X-Content-Type-Options
10. THE System SHALL implement Content Security Policy headers for XSS protection
11. THE System SHALL store MongoDB connection string in environment variables
12. THE System SHALL store Cloudinary credentials in environment variables
13. THE System SHALL store admin credentials in environment variables

### Requirement 14: Database Integrity

**User Story:** As a system administrator, I want data integrity constraints enforced, so that the database remains consistent and reliable.

#### Acceptance Criteria

1. THE System SHALL enforce unique constraint on product slug field
2. THE System SHALL enforce unique constraint on order orderNumber field
3. THE System SHALL enforce unique constraint on media cloudinaryId field
4. THE System SHALL enforce unique constraint on content key field
5. WHEN creating an order, THE System SHALL verify all referenced product IDs exist in the products collection
6. THE System SHALL automatically generate timestamps for createdAt and updatedAt fields
7. THE System SHALL use ObjectId type for all document _id fields
8. THE System SHALL validate all required fields are present before saving documents

### Requirement 15: Error Handling and User Feedback

**User Story:** As a user, I want clear error messages when something goes wrong, so that I understand what happened and what to do next.

#### Acceptance Criteria

1. WHEN an API request fails, THE System SHALL return appropriate HTTP status codes
2. WHEN validation fails, THE System SHALL return 400 Bad Request with field-specific error messages
3. WHEN authentication fails, THE System SHALL return 401 Unauthorized
4. WHEN a resource is not found, THE System SHALL return 404 Not Found
5. WHEN a server error occurs, THE System SHALL return 500 Internal Server Error
6. THE System SHALL display user-friendly error messages in the UI using toast notifications
7. WHEN a form submission succeeds, THE System SHALL display a success message
8. WHEN an image upload fails, THE System SHALL display the specific error reason
9. THE System SHALL log errors to console for debugging purposes

### Requirement 16: SEO and Discoverability

**User Story:** As a business owner, I want the website to be discoverable by search engines, so that potential customers can find our products.

#### Acceptance Criteria

1. THE System SHALL generate unique page titles for each product page
2. THE System SHALL generate meta descriptions for each product page
3. THE System SHALL use semantic HTML with proper heading hierarchy
4. THE System SHALL generate a sitemap for search engine crawlers
5. THE System SHALL use descriptive URLs with product slugs
6. THE System SHALL implement Open Graph tags for social media sharing
7. THE System SHALL use Server-Side Rendering for all public pages to ensure content is crawlable

### Requirement 17: Deployment and Environment Configuration

**User Story:** As a developer, I want clear environment configuration and deployment process, so that the application can be deployed reliably.

#### Acceptance Criteria

1. THE System SHALL use environment variables for all configuration values
2. THE System SHALL require MONGODB_URI environment variable for database connection
3. THE System SHALL require CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET for image management
4. THE System SHALL require ADMIN_USERNAME and ADMIN_PASSWORD for admin authentication
5. THE System SHALL require NEXT_PUBLIC_SITE_URL for absolute URL generation
6. THE System SHALL support different environment configurations for development and production
7. THE System SHALL deploy to Vercel with automatic HTTPS certificate provisioning
8. THE System SHALL use Vercel's global CDN for content delivery
9. THE System SHALL configure MongoDB Atlas network access to allow Vercel connections
10. THE System SHALL use Node.js runtime version 18 or higher
