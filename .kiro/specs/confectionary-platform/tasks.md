# Implementation Plan: Confectionary Platform

## Overview

This implementation plan breaks down the simplified confectionary platform MVP into discrete, actionable coding tasks. The platform is built with Next.js 14+ (App Router), TypeScript, Shadcn UI components, MongoDB Atlas, and Cloudinary for image management. The platform is public-facing with no user authentication - visitors can browse products and submit inquiry forms. Only the admin dashboard requires authentication (Basic Auth). The implementation follows a bottom-up approach: infrastructure and data layer first, then services and API routes, followed by frontend components, and finally integration.

## Tasks

- [x] 1. Project initialization and configuration
  - Initialize Next.js 14+ project with TypeScript and App Router
  - Configure ESLint, Prettier, and TypeScript strict mode
  - Initialize Shadcn UI with `npx shadcn-ui@latest init`
  - Configure Tailwind CSS with Shadcn theme
  - Create environment variable structure (.env.local, .env.example)
  - Configure next.config.js for image optimization and security headers
  - Install core dependencies: mongoose, zod, cloudinary, next-cloudinary
  - Create folder structure as per design specification
  - _Requirements: Design - Technology Stack, Folder Structure_

- [x] 2. Install Shadcn UI components
  - Install required Shadcn components: button, input, textarea, select, card, dialog, form, label, table, toast, carousel, dropdown-menu
  - Verify components are in src/components/ui/ directory
  - Test basic component rendering
  - _Requirements: Design - Shadcn UI Integration_

- [x] 3. Database models and connections
  - [x] 3.1 Set up MongoDB connection with connection pooling
    - Create src/lib/db/mongodb.ts with singleton pattern
    - Implement connection error handling and retry logic
    - Add connection status logging
    - _Requirements: Design - Database Schema_
  
  - [x] 3.2 Create Mongoose schema for Product model
    - Define Product schema with name, slug, category, price, images, preparationSteps, nutritionInfo
    - Add indexes on slug (unique), category, and isActive
    - Implement slug auto-generation from product name
    - Add validation for price (positive number)
    - Add text index on name for search functionality
    - _Requirements: Design - Product Collection_
  
  - [x] 3.3 Create Mongoose schema for Order model
    - Define Order schema with orderNumber, customerName, customerEmail, customerPhone, items, status, shippingAddress
    - Add indexes on orderNumber (unique), customerEmail, status, and createdAt
    - Implement auto-generation of unique order numbers (format: ORD-YYYYMMDD-NNN)
    - Add validation for status transitions
    - _Requirements: Design - Order Collection_
  
  - [x] 3.4 Create Mongoose schema for Media model
    - Define Media schema with cloudinaryId, url, secureUrl, type, altText, width, height, format
    - Add indexes on cloudinaryId (unique), type, and createdAt
    - Add validation for media type (hero, carousel, product, category)
    - _Requirements: Design - Media Collection_
  
  - [x] 3.5 Create Mongoose schema for Content model
    - Define Content schema with key, title, description, data
    - Add unique index on key
    - Implement flexible JSON data field for various content types
    - _Requirements: Design - Content Collection_

- [ ] 4. TypeScript types and validation schemas
  - [x] 4.1 Define core TypeScript types
    - Create src/types/product.types.ts with Product, Category, PreparationStep, NutritionInfo
    - Create src/types/order.types.ts with Order, OrderStatus, OrderItem, ShippingAddress
    - Create src/types/media.types.ts with Media, MediaType
    - Create src/types/content.types.ts with Content
    - Create src/types/api.types.ts with ApiResponse, PaginatedResponse, ApiError
    - _Requirements: Design - Database Schema_
  
  - [x] 4.2 Create Zod validation schemas
    - Create src/lib/utils/validation.ts with schemas for all API inputs
    - Define productCreateSchema, productUpdateSchema
    - Define orderCreateSchema with customer info and items validation
    - Define mediaUploadSchema with file type and size validation
    - Define contentUpdateSchema
    - Add custom validators for email, phone, and price formats
    - _Requirements: Design - Data Validation_

- [ ] 5. Utility functions and helpers
  - [x] 5.1 Create error handling utilities
    - Create src/lib/utils/errors.ts with custom error classes
    - Define AppError, ValidationError, NotFoundError
    - Implement error response formatter for API routes
    - _Requirements: Design - API Routes_
  
  - [x] 5.2 Create logger utility
    - Create src/lib/utils/logger.ts with console-based logging
    - Configure log levels (error, warn, info, debug)
    - Add request ID tracking for debugging
    - _Requirements: Design - Utilities_
  
  - [x] 5.3 Create Shadcn utility helpers
    - Verify src/lib/utils/cn.ts exists (created by Shadcn init)
    - Create src/lib/utils/helpers.ts for general utilities (slug generation, price formatting)
    - _Requirements: Design - Utilities_

- [ ] 6. Cloudinary configuration and service
  - [x] 6.1 Configure Cloudinary client
    - Create src/config/cloudinary.ts with Cloudinary v2 configuration
    - Add environment variable validation for CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET
    - _Requirements: Design - Cloudinary Integration_
  
  - [x] 6.2 Create media service for image uploads
    - Create src/lib/services/media.service.ts
    - Implement uploadImage function with file validation and Cloudinary upload
    - Add image transformation settings (resize, quality, format)
    - Implement deleteImage function for cleanup
    - Add getMediaByType function to fetch images by type
    - _Requirements: Design - Cloudinary Integration, Media Service_

- [x] 7. Product service layer
  - Create src/lib/services/product.service.ts
  - Implement createProduct with slug generation
  - Implement updateProduct with validation
  - Implement deleteProduct (soft delete by setting isActive=false)
  - Implement getProducts with pagination and filtering (category, featured)
  - Implement getProductBySlug for detail pages
  - Implement searchProducts with MongoDB text search
  - _Requirements: Design - Product Management_

- [x] 8. Order service layer
  - Create src/lib/services/order.service.ts
  - Implement createOrder with order number generation
  - Implement getOrderById
  - Implement getAllOrders with pagination and status filtering (admin)
  - Implement updateOrderStatus (admin only)
  - Add validation for order items (check product exists)
  - _Requirements: Design - Order Management_

- [x] 9. Content service layer
  - Create src/lib/services/content.service.ts
  - Implement getContentByKey for fetching site content
  - Implement updateContent for admin content management
  - Add default content initialization for homepage_hero, about_page
  - _Requirements: Design - Content Collection_

- [x] 10. Admin authentication middleware
  - Create middleware.ts in project root
  - Implement Basic Auth check for /admin routes
  - Validate credentials against ADMIN_USERNAME and ADMIN_PASSWORD environment variables
  - Return 401 with WWW-Authenticate header if unauthorized
  - Allow all other routes to pass through
  - _Requirements: Design - Admin Authentication Middleware_

- [ ] 11. Product API routes
  - [x] 11.1 Implement products list and create API route
    - Create src/app/api/products/route.ts
    - GET: Return paginated products with filters (category, featured, active)
    - POST: Create new product (admin only - check auth header)
    - Add input validation with Zod
    - _Requirements: Design - Public API Routes, Admin API Routes_
  
  - [x] 11.2 Implement single product API route
    - Create src/app/api/products/[id]/route.ts
    - GET: Return product by ID with preparation steps
    - PUT: Update product (admin only)
    - DELETE: Soft delete product (admin only)
    - _Requirements: Design - Admin API Routes_
  
  - [x] 11.3 Implement product categories API route
    - Create src/app/api/products/categories/route.ts
    - Return list of all categories with product counts
    - _Requirements: Design - Public API Routes_
  
  - [x] 11.4 Implement featured products API route
    - Create src/app/api/products/featured/route.ts
    - Return featured products (isFeatured=true, isActive=true, limit 12)
    - _Requirements: Design - Public API Routes_

- [ ] 12. Order API routes
  - [x] 12.1 Implement orders list and create API route
    - Create src/app/api/orders/route.ts
    - GET: Return all orders with pagination (admin only)
    - POST: Create new order/inquiry (public endpoint)
    - Validate customer info and items
    - Generate unique order number
    - _Requirements: Design - Public API Routes, Admin API Routes_
  
  - [x] 12.2 Implement single order API route
    - Create src/app/api/orders/[id]/route.ts
    - GET: Return order details (admin only)
    - PUT: Update order status (admin only)
    - _Requirements: Design - Admin API Routes_

- [ ] 13. Media API routes
  - [x] 13.1 Implement media upload API route
    - Create src/app/api/media/upload/route.ts
    - POST: Upload image to Cloudinary (admin only)
    - Validate file type (images only) and size (max 5MB)
    - Accept type parameter (hero, carousel, product, category)
    - Return media object with Cloudinary URLs
    - _Requirements: Design - Admin API Routes_
  
  - [x] 13.2 Implement media list API route
    - Create src/app/api/media/[type]/route.ts
    - GET: Fetch all media by type
    - Public endpoint for display, admin for management
    - _Requirements: Design - Public API Routes_

- [x] 14. Content API routes
  - Create src/app/api/content/route.ts
  - GET: Fetch site content by key (query parameter)
  - PUT: Update site content (admin only)
  - _Requirements: Design - Admin API Routes_

- [x] 15. Checkpoint - Ensure all API routes are functional
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Custom React hooks
  - [x] 16.1 Create useProducts hook
    - Create src/lib/hooks/useProducts.ts
    - Implement data fetching for products with SWR or React Query
    - Add pagination and filtering state
    - _Requirements: Design - Components_
  
  - [x] 16.2 Create useToast hook
    - Create src/lib/hooks/useToast.ts
    - Wrap Shadcn toast functionality
    - Add helper functions for success, error, warning toasts
    - _Requirements: Design - Shadcn UI Integration_
  
  - [x] 16.3 Create useMediaUpload hook
    - Create src/lib/hooks/useMediaUpload.ts
    - Handle file upload to API with progress tracking
    - Add error handling and validation
    - _Requirements: Design - Media Management_

- [ ] 17. Layout components
  - [x] 17.1 Create Header component
    - Create src/components/layout/Header.tsx
    - Add logo and navigation links (Home, Products, About, Contact)
    - Implement mobile responsive menu with hamburger icon
    - Use Shadcn dropdown-menu for mobile navigation
    - _Requirements: Design - Layout Components_
  
  - [x] 17.2 Create Footer component
    - Create src/components/layout/Footer.tsx
    - Add links to About, Contact, Terms, Privacy
    - Add social media icons
    - _Requirements: Design - Layout Components_
  
  - [x] 17.3 Create Navigation component
    - Create src/components/layout/Navigation.tsx
    - Implement category navigation
    - Add active state highlighting
    - _Requirements: Design - Layout Components_
  
  - [x] 17.4 Create AdminSidebar component
    - Create src/components/layout/AdminSidebar.tsx
    - Add navigation items for dashboard sections (Dashboard, Products, Orders, Media, Content)
    - Implement active state highlighting
    - Use Shadcn components for styling
    - _Requirements: Design - Layout Components_

- [ ] 18. Home page components
  - [x] 18.1 Create HeroSection component
    - Create src/components/home/HeroSection.tsx
    - Display hero image from Media collection (type=hero)
    - Display hero text from Content collection (key=homepage_hero)
    - Add CTA button linking to products page
    - Use Shadcn Card and Button components
    - _Requirements: Design - Home Components_
  
  - [x] 18.2 Create ImageCarousel component
    - Create src/components/home/ImageCarousel.tsx
    - Display carousel images from Media collection (type=carousel)
    - Use Shadcn carousel component or embla-carousel-react
    - Add auto-play and navigation controls
    - _Requirements: Design - Home Components_
  
  - [x] 18.3 Create FeaturedProducts component
    - Create src/components/home/FeaturedProducts.tsx
    - Fetch and display featured products
    - Use ProductCard component for each product
    - Add "View All Products" button
    - _Requirements: Design - Home Components_

- [ ] 19. Product components
  - [x] 19.1 Create ProductCard component
    - Create src/components/products/ProductCard.tsx
    - Display product image (from Cloudinary), name, price, category
    - Add "View Details" button linking to product detail page
    - Use Shadcn Card component
    - Add hover effects
    - _Requirements: Design - Product Components_
  
  - [x] 19.2 Create ProductGrid component
    - Create src/components/products/ProductGrid.tsx
    - Display products in responsive grid layout (3-4 columns desktop, 1-2 mobile)
    - Implement loading skeleton using Shadcn Card
    - Add empty state for no products
    - _Requirements: Design - Product Components_
  
  - [x] 19.3 Create ProductDetail component
    - Create src/components/products/ProductDetail.tsx
    - Display full product information with image gallery
    - Show preparation steps with PreparationGuide component
    - Display nutrition information if available
    - Add InquiryForm component for customer inquiries
    - Use Shadcn Card and Dialog components
    - _Requirements: Design - Product Components_
  
  - [x] 19.4 Create PreparationGuide component
    - Create src/components/products/PreparationGuide.tsx
    - Display step-by-step instructions with numbering
    - Show step images if available
    - Implement expandable/collapsible steps
    - _Requirements: Design - Product Components_
  
  - [x] 19.5 Create CategoryFilter component
    - Create src/components/products/CategoryFilter.tsx
    - Display category buttons/chips (confectionary, fish, foodstuffs)
    - Implement active state
    - Add "All" option to clear filter
    - Use Shadcn Button component
    - _Requirements: Design - Product Components_
  
  - [x] 19.6 Create ProductForm component (Admin)
    - Create src/components/products/ProductForm.tsx
    - Add fields for all product attributes (name, category, description, price, currency)
    - Implement image upload with preview using ImageUploader component
    - Add preparation steps builder (add/remove/reorder steps)
    - Add nutrition info fields
    - Implement form validation with Zod and react-hook-form
    - Use Shadcn Form, Input, Textarea, Select components
    - _Requirements: Design - Product Components_

- [ ] 20. Order/Inquiry components
  - [x] 20.1 Create InquiryForm component
    - Create src/components/orders/InquiryForm.tsx
    - Add fields: customerName, customerEmail, customerPhone, message
    - Add product selection with quantity
    - Add optional shipping address fields
    - Implement form validation with Zod
    - Use Shadcn Form, Input, Textarea components
    - Show success message with order number after submission
    - _Requirements: Design - Order Components_
  
  - [x] 20.2 Create OrderTable component (Admin)
    - Create src/components/orders/OrderTable.tsx
    - Display orders in table format with columns: order number, date, customer name, email, status
    - Implement sorting by date
    - Add status filter dropdown
    - Add pagination
    - Add row click to view order details
    - Use Shadcn Table and Select components
    - _Requirements: Design - Order Components_
  
  - [x] 20.3 Create OrderDetail component (Admin)
    - Create src/components/orders/OrderDetail.tsx
    - Display full order details: customer info, items, message, shipping address
    - Add status update dropdown (new, contacted, completed, cancelled)
    - Show order creation date
    - Use Shadcn Card and Select components
    - _Requirements: Design - Order Components_

- [ ] 21. Media management components (Admin)
  - [x] 21.1 Create ImageUploader component
    - Create src/components/media/ImageUploader.tsx
    - Implement drag-and-drop file upload
    - Add file type and size validation
    - Show upload progress
    - Display preview after upload
    - Use Shadcn Button and Dialog components
    - _Requirements: Design - Media Components_
  
  - [x] 21.2 Create MediaGallery component
    - Create src/components/media/MediaGallery.tsx
    - Display uploaded images in grid layout
    - Add delete functionality
    - Filter by media type
    - Use Shadcn Card component
    - _Requirements: Design - Media Components_
  
  - [x] 21.3 Create ImageTypeSelector component
    - Create src/components/media/ImageTypeSelector.tsx
    - Dropdown to select image type (hero, carousel, product, category)
    - Use Shadcn Select component
    - _Requirements: Design - Media Components_

- [ ] 22. Admin dashboard components
  - [x] 22.1 Create DashboardStats component
    - Create src/components/admin/DashboardStats.tsx
    - Display key metrics: total orders, new orders, total products, active products
    - Use Shadcn Card component for stat cards
    - _Requirements: Design - Dashboard Components_
  
  - [x] 22.2 Create ContentEditor component
    - Create src/components/admin/ContentEditor.tsx
    - Form to edit site content (homepage hero text, about page content)
    - Use Shadcn Form, Input, Textarea components
    - Add save button with loading state
    - _Requirements: Design - Dashboard Components_

- [ ] 23. Public pages
  - [x] 23.1 Create landing page
    - Create src/app/page.tsx
    - Render HeroSection component
    - Render ImageCarousel component
    - Render FeaturedProducts component
    - Add SEO metadata
    - _Requirements: Design - Main Application Pages_
  
  - [x] 23.2 Create products listing page
    - Create src/app/products/page.tsx
    - Render CategoryFilter component
    - Render ProductGrid component
    - Implement pagination or infinite scroll
    - Add SEO metadata
    - _Requirements: Design - Main Application Pages_
  
  - [x] 23.3 Create category page
    - Create src/app/products/[category]/page.tsx
    - Filter products by category from URL parameter
    - Render ProductGrid component
    - Add category description
    - Add SEO metadata
    - _Requirements: Design - Main Application Pages_
  
  - [x] 23.4 Create product detail page
    - Create src/app/products/[id]/page.tsx
    - Fetch product by ID
    - Render ProductDetail component
    - Implement server-side rendering for SEO
    - Add structured data (JSON-LD) for rich snippets
    - _Requirements: Design - Main Application Pages_
  
  - [x] 23.5 Create about page
    - Create src/app/about/page.tsx
    - Fetch content from Content collection (key=about_page)
    - Display company story, mission, values
    - Add SEO metadata
    - _Requirements: Design - Main Application Pages_
  
  - [x] 23.6 Create contact page
    - Create src/app/contact/page.tsx
    - Render InquiryForm component (without product selection)
    - Add contact information
    - Add SEO metadata
    - _Requirements: Design - Main Application Pages_

- [ ] 24. Admin dashboard pages
  - [x] 24.1 Create admin dashboard home page
    - Create src/app/admin/page.tsx
    - Render DashboardStats component
    - Show recent orders (last 10)
    - Add quick action buttons (Add Product, View Orders)
    - _Requirements: Design - Dashboard Pages_
  
  - [x] 24.2 Create products management page
    - Create src/app/admin/products/page.tsx
    - Display all products in table format
    - Add "Add New Product" button
    - Add edit and delete actions for each product
    - Implement search and category filter
    - Use Shadcn Table component
    - _Requirements: Design - Dashboard Pages_
  
  - [x] 24.3 Create new product page
    - Create src/app/admin/products/new/page.tsx
    - Render ProductForm component
    - Implement product creation
    - Redirect to products list after save
    - _Requirements: Design - Dashboard Pages_
  
  - [x] 24.4 Create edit product page
    - Create src/app/admin/products/[id]/edit/page.tsx
    - Fetch product data by ID
    - Render ProductForm component with pre-filled data
    - Implement product update
    - _Requirements: Design - Dashboard Pages_
  
  - [x] 24.5 Create orders management page
    - Create src/app/admin/orders/page.tsx
    - Render OrderTable component
    - Add status filter (all, new, contacted, completed, cancelled)
    - Add date range filter
    - _Requirements: Design - Dashboard Pages_
  
  - [x] 24.6 Create order detail page
    - Create src/app/admin/orders/[id]/page.tsx
    - Fetch order data by ID
    - Render OrderDetail component
    - Add back button to orders list
    - _Requirements: Design - Dashboard Pages_
  
  - [x] 24.7 Create media management page
    - Create src/app/admin/media/page.tsx
    - Render ImageTypeSelector component
    - Render ImageUploader component
    - Render MediaGallery component
    - _Requirements: Design - Dashboard Pages_
  
  - [x] 24.8 Create content management page
    - Create src/app/admin/content/page.tsx
    - Render ContentEditor component
    - Add tabs for different content sections (Homepage Hero, About Page)
    - _Requirements: Design - Dashboard Pages_

- [ ] 25. Root and group layouts
  - [x] 25.1 Create root layout
    - Create src/app/layout.tsx
    - Add HTML structure with metadata
    - Include globals.css
    - Add font configuration (Inter or similar)
    - Add Toaster component from Shadcn
    - _Requirements: Design - Layouts_
  
  - [x] 25.2 Create main layout
    - Create src/app/(main)/layout.tsx (if using route groups)
    - Render Header and Footer components
    - Add main content wrapper
    - _Requirements: Design - Layouts_
  
  - [x] 25.3 Create admin layout
    - Create src/app/admin/layout.tsx
    - Render AdminSidebar component
    - Add main content area
    - Add admin-specific styling
    - _Requirements: Design - Layouts_

- [x] 26. Environment configuration and validation
  - Create src/config/env.ts
  - Define environment variable schema with Zod
  - Validate all required environment variables on startup (MONGODB_URI, CLOUDINARY_*, ADMIN_USERNAME, ADMIN_PASSWORD)
  - Export typed environment configuration
  - Add error messages for missing variables
  - _Requirements: Design - Environment Variables_

- [x] 27. Global styles and theme configuration
  - Verify src/app/globals.css includes Shadcn base styles
  - Configure Tailwind custom colors in tailwind.config.ts
  - Add global reset and base styles
  - Configure font families
  - _Requirements: Design - Shadcn UI Integration_

- [x] 28. Constants and configuration files
  - Create src/lib/constants/routes.ts with all route paths
  - Create src/lib/constants/categories.ts with product categories (confectionary, fish, foodstuffs)
  - Create src/lib/constants/media-types.ts with media types (hero, carousel, product, category)
  - Create src/config/database.ts with MongoDB configuration
  - _Requirements: Design - Configuration_

- [x] 29. Database seeding script
  - Create scripts/seed-database.ts
  - Add sample products across all categories (at least 3 per category)
  - Add sample media records (hero, carousel images)
  - Add default content records (homepage_hero, about_page)
  - Implement command-line execution with `npm run seed`
  - _Requirements: Design - Testing Strategy_

- [ ] 30. Integration and wiring
  - [x] 30.1 Connect product management flow
    - Test product creation with image upload
    - Verify product listing with filters
    - Test product update and deletion
    - Verify slug generation and uniqueness
  
  - [x] 30.2 Connect inquiry/order flow
    - Test inquiry form submission from product detail page
    - Verify order creation with unique order number
    - Test order display in admin dashboard
    - Test order status updates
  
  - [x] 30.3 Connect media management flow
    - Test image upload to Cloudinary
    - Verify media records in database
    - Test image display on public pages (hero, carousel, products)
    - Test media deletion
  
  - [x] 30.4 Connect admin authentication
    - Test Basic Auth on /admin routes
    - Verify unauthorized access is blocked
    - Test admin functionality after authentication

- [x] 31. Final checkpoint - Ensure all features are integrated
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks reference the simplified design document
- TypeScript strict mode ensures type safety throughout the application
- Shadcn UI components provide accessible, customizable UI elements
- Cloudinary handles all image uploads, transformations, and CDN delivery
- Basic Auth provides simple admin protection for MVP
- MongoDB indexes optimize query performance for product search and filtering
- Next.js App Router enables server-side rendering for SEO optimization
- Tailwind CSS enables rapid UI development with utility classes
- The implementation follows a bottom-up approach: data layer → services → API → frontend
- Each checkpoint ensures incremental validation before proceeding
- No user authentication, shopping cart, or payment processing in this MVP
- Orders are inquiries only - admin follows up manually
