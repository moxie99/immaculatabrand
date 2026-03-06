# Design Document: Confectionary Platform

## Overview

The Confectionary Platform is a simplified MVP web application designed to showcase African food products and collect customer inquiries. The platform displays confectionary items (cakes, oat flour, plantain flour), various fish products (crayfish, smoked fish, catfish), and diverse African foodstuffs, each with detailed step-by-step preparation guides. The public-facing website requires no authentication - visitors can browse products and submit inquiry forms with their contact information and product interests. Orders are stored in MongoDB and displayed in a protected admin dashboard for manual follow-up.

The architecture uses Next.js 14+ with App Router, TypeScript, Shadcn UI components with Tailwind CSS, MongoDB Atlas for data storage, Cloudinary for image management, and Vercel for hosting. The admin dashboard is the only protected area (using simple password or basic auth), where administrators can manage products, view submitted orders, upload various image types (hero images, carousel images, product images, category images), and manage site content. The design prioritizes simplicity, fast time-to-market, and ease of maintenance for an MVP launch.

## Architecture

### System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end
    
    subgraph "CDN & Edge"
        Vercel[Vercel Edge Network]
        Static[Static Assets CDN]
    end
    
    subgraph "Application Layer - Next.js"
        AppRouter[App Router Pages]
        APIRoutes[API Routes]
        AdminMiddleware[Admin Auth Middleware]
        ServerComponents[Server Components]
        ClientComponents[Client Components - Shadcn UI]
    end
    
    subgraph "Service Layer"
        ProductService[Product Service]
        OrderService[Order/Inquiry Service]
        MediaService[Media Service]
        ContentService[Content Service]
    end
    
    subgraph "Data Layer"
        MongoDB[(MongoDB Atlas)]
    end
    
    subgraph "External Services"
        Cloudinary[Cloudinary CDN]
    end

    
    Browser --> Vercel
    Mobile --> Vercel
    Vercel --> AppRouter
    Vercel --> Static
    
    AppRouter --> ServerComponents
    AppRouter --> ClientComponents
    AppRouter --> APIRoutes
    
    APIRoutes --> AdminMiddleware
    AdminMiddleware --> ProductService
    AdminMiddleware --> OrderService
    AdminMiddleware --> MediaService
    AdminMiddleware --> ContentService
    
    ProductService --> MongoDB
    OrderService --> MongoDB
    ContentService --> MongoDB
    
    MediaService --> Cloudinary
    ClientComponents --> Cloudinary
```

### Technology Stack Rationale

**Frontend Framework: Next.js 14+ with App Router**
- Server-side rendering (SSR) for SEO optimization critical for product discovery
- React Server Components reduce client-side JavaScript bundle size
- Built-in API routes eliminate need for separate backend server
- Image optimization for product photos (automatic WebP conversion, lazy loading)
- Edge middleware for admin authentication checks
- Incremental Static Regeneration (ISR) for product pages

**UI Framework: Shadcn UI + Tailwind CSS**
- Pre-built, accessible components that can be customized and owned
- Copy-paste component model - no external dependencies to manage
- Built on Radix UI primitives for accessibility compliance
- Tailwind CSS for rapid styling and consistent design system
- TypeScript support out of the box
- Reduces development time significantly compared to custom components

**Backend Language: TypeScript (Node.js runtime)**
- Type safety prevents runtime errors in production
- Shared types between frontend and backend reduce duplication
- Excellent ecosystem for MongoDB drivers and validation libraries (Zod)
- Native async/await support for database operations
- Strong community support and extensive documentation

**Database: MongoDB Atlas**
- Flexible schema ideal for diverse product types (cakes, fish, foodstuffs with varying attributes)
- Document model naturally represents nested preparation steps
- Simple to set up and manage for MVP
- Built-in full-text search for product discovery
- Free tier sufficient for MVP launch
- Easy to scale as platform grows

**Image Management: Cloudinary**
- Automatic image optimization and transformation
- CDN delivery for fast image loading globally
- Simple upload API with Node.js SDK
- Supports multiple image formats and responsive images
- Free tier generous for MVP (25GB storage, 25GB bandwidth)
- Built-in image manipulation (resize, crop, format conversion)

**Hosting: Vercel**
- Zero-config deployment for Next.js applications
- Global CDN with 100+ edge locations for low latency
- Automatic HTTPS and SSL certificate management
- Serverless functions scale automatically with traffic
- Preview deployments for every Git branch
- Free tier sufficient for MVP launch

**Admin Authentication: Basic Auth / Simple Password**
- No complex user management needed for single admin
- Environment variable-based credentials
- Next.js middleware for route protection
- Sufficient security for MVP admin dashboard
- Can upgrade to proper auth system later if needed

## Application Folder Structure

```
confectionary-platform/
├── .env.local                          # Local environment variables
├── .env.development                    # Development environment
├── .env.production                     # Production environment
├── .eslintrc.json                      # ESLint configuration
├── .prettierrc                         # Prettier configuration
├── next.config.js                      # Next.js configuration
├── tsconfig.json                       # TypeScript configuration
├── package.json                        # Dependencies and scripts
├── tailwind.config.ts                  # Tailwind CSS configuration
├── postcss.config.js                   # PostCSS configuration
├── components.json                     # Shadcn UI configuration
├── middleware.ts                       # Next.js middleware for admin auth
│
├── public/                             # Static assets
│   ├── images/
│   │   ├── logo.svg
│   │   └── placeholders/
│   └── icons/
│
├── src/
│   ├── app/                            # Next.js App Router
│   │   ├── layout.tsx                  # Root layout
│   │   ├── page.tsx                    # Landing page (hero, carousel, featured products)
│   │   ├── globals.css                 # Global styles + Shadcn base
│   │   │
│   │   ├── products/
│   │   │   ├── page.tsx                # Product listing
│   │   │   ├── [category]/
│   │   │   │   └── page.tsx            # Category page
│   │   │   └── [id]/
│   │   │       └── page.tsx            # Product detail with inquiry form
│   │   │
│   │   ├── about/
│   │   │   └── page.tsx
│   │   │
│   │   ├── contact/
│   │   │   └── page.tsx                # Contact/inquiry form
│   │   │
│   │   ├── admin/                      # Protected admin dashboard
│   │   │   ├── layout.tsx              # Dashboard layout
│   │   │   ├── page.tsx                # Dashboard home (stats, recent orders)
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx            # View all orders/inquiries
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx        # Order detail
│   │   │   ├── products/
│   │   │   │   ├── page.tsx            # Manage products
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx        # Create product
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx    # Edit product
│   │   │   ├── media/
│   │   │   │   └── page.tsx            # Upload hero, carousel, product images
│   │   │   └── content/
│   │   │       └── page.tsx            # Manage site content
│   │   │
│   │   └── api/                        # API routes
│   │       ├── products/
│   │       │   ├── route.ts            # GET all, POST create (admin)
│   │       │   ├── [id]/
│   │       │   │   └── route.ts        # GET, PUT, DELETE (admin)
│   │       │   ├── categories/
│   │       │   │   └── route.ts        # GET categories
│   │       │   └── featured/
│   │       │       └── route.ts        # GET featured products
│   │       ├── orders/
│   │       │   ├── route.ts            # GET all (admin), POST create (public)
│   │       │   └── [id]/
│   │       │       └── route.ts        # GET, PUT (admin)
│   │       ├── media/
│   │       │   ├── upload/
│   │       │   │   └── route.ts        # POST upload to Cloudinary (admin)
│   │       │   └── [type]/
│   │       │       └── route.ts        # GET images by type (hero, carousel, product)
│   │       └── content/
│   │           └── route.ts            # GET, PUT site content (admin)
│   │
│   ├── components/                     # React components
│   │   ├── ui/                         # Shadcn UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   └── carousel.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── AdminSidebar.tsx
│   │   ├── home/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── ImageCarousel.tsx
│   │   │   └── FeaturedProducts.tsx
│   │   ├── products/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── ProductForm.tsx         # Admin product form
│   │   │   ├── PreparationGuide.tsx
│   │   │   └── CategoryFilter.tsx
│   │   ├── orders/
│   │   │   ├── InquiryForm.tsx         # Public inquiry form
│   │   │   ├── OrderTable.tsx          # Admin order table
│   │   │   └── OrderDetail.tsx         # Admin order detail
│   │   ├── media/
│   │   │   ├── ImageUploader.tsx       # Cloudinary upload component
│   │   │   ├── MediaGallery.tsx
│   │   │   └── ImageTypeSelector.tsx   # Select hero/carousel/product
│   │   └── admin/
│   │       ├── DashboardStats.tsx
│   │       └── ContentEditor.tsx
│   │
│   ├── lib/                            # Core utilities
│   │   ├── db/
│   │   │   ├── mongodb.ts              # MongoDB connection
│   │   │   └── models/                 # Mongoose models
│   │   │       ├── Product.ts
│   │   │       ├── Order.ts
│   │   │       ├── Media.ts
│   │   │       └── Content.ts
│   │   ├── services/
│   │   │   ├── product.service.ts
│   │   │   ├── order.service.ts
│   │   │   ├── media.service.ts        # Cloudinary integration
│   │   │   └── content.service.ts
│   │   ├── utils/
│   │   │   ├── validation.ts           # Zod schemas
│   │   │   ├── errors.ts               # Custom error classes
│   │   │   ├── logger.ts               # Logger utility
│   │   │   ├── cn.ts                   # Shadcn class name utility
│   │   │   └── helpers.ts              # General utilities
│   │   ├── hooks/                      # Custom React hooks
│   │   │   ├── useProducts.ts
│   │   │   ├── useToast.ts
│   │   │   └── useMediaUpload.ts
│   │   └── constants/
│   │       ├── routes.ts
│   │       ├── categories.ts
│   │       └── media-types.ts
│   │
│   ├── types/                          # TypeScript types
│   │   ├── index.ts
│   │   ├── product.types.ts
│   │   ├── order.types.ts
│   │   ├── media.types.ts
│   │   └── api.types.ts
│   │
│   └── config/                         # Configuration
│       ├── env.ts                      # Environment validation
│       ├── database.ts
│       ├── cloudinary.ts
│       └── admin.ts                    # Admin credentials
│
├── tests/                              # Test files
│   ├── unit/
│   │   ├── services/
│   │   ├── utils/
│   │   └── components/
│   └── integration/
│       └── api/
│
└── scripts/                            # Utility scripts
    ├── seed-database.ts
    └── setup-cloudinary.ts
```

## Database Schema Design

### Collections Overview

```mermaid
erDiagram
    Product ||--o{ OrderItem : contains
    Order ||--o{ OrderItem : includes
    Product }o--|| Category : belongs_to
    Media }o--|| MediaType : has
    
    Product {
        ObjectId _id PK
        string name
        string slug UK
        string category
        string description
        number price
        string currency
        array images
        array preparationSteps
        object nutritionInfo
        boolean isFeatured
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }
    
    Order {
        ObjectId _id PK
        string orderNumber UK
        string customerName
        string customerEmail
        string customerPhone
        array items
        string message
        enum status
        object shippingAddress
        timestamp createdAt
        timestamp updatedAt
    }
    
    Media {
        ObjectId _id PK
        string cloudinaryId UK
        string url
        string secureUrl
        enum type
        string altText
        number width
        number height
        string format
        timestamp createdAt
    }
    
    Content {
        ObjectId _id PK
        string key UK
        string title
        string description
        object data
        timestamp updatedAt
    }
```

### Detailed Schema Definitions


#### Product Collection

```typescript
interface Product {
  _id: ObjectId;
  name: string;                    // Product name (e.g., "Nigerian Chin Chin")
  slug: string;                    // URL-friendly slug (unique)
  category: string;                // "confectionary" | "fish" | "foodstuffs"
  description: string;             // Rich text description
  price: number;                   // Price in smallest currency unit
  currency: string;                // "GBP" | "USD" | "EUR"
  images: string[];                // Array of Cloudinary URLs
  preparationSteps: {
    stepNumber: number;
    title: string;
    description: string;
    imageUrl?: string;
    duration?: string;
  }[];
  nutritionInfo?: {
    servingSize: string;
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
  isFeatured: boolean;             // Show on homepage
  isActive: boolean;               // Visible to public
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `slug`: unique index for URL lookups
- `category`: index for category filtering
- `isFeatured, isActive`: compound index for homepage queries
- `name`: text index for search functionality

#### Order Collection

```typescript
interface Order {
  _id: ObjectId;
  orderNumber: string;             // Auto-generated (e.g., "ORD-20240115-001")
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: {
    productId: ObjectId;
    productName: string;
    quantity: number;
    priceAtTime: number;
  }[];
  message?: string;                // Customer inquiry message
  status: "new" | "contacted" | "completed" | "cancelled";
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `orderNumber`: unique index
- `customerEmail`: index for customer lookup
- `status`: index for admin filtering
- `createdAt`: descending index for recent orders

#### Media Collection

```typescript
interface Media {
  _id: ObjectId;
  cloudinaryId: string;            // Cloudinary public_id (unique)
  url: string;                     // HTTP URL
  secureUrl: string;               // HTTPS URL
  type: "hero" | "carousel" | "product" | "category";
  altText: string;                 // Accessibility text
  width: number;
  height: number;
  format: string;                  // "jpg" | "png" | "webp"
  createdAt: Date;
}
```

**Indexes:**
- `cloudinaryId`: unique index
- `type`: index for filtering by media type
- `createdAt`: descending index for recent uploads

#### Content Collection

```typescript
interface Content {
  _id: ObjectId;
  key: string;                     // Unique identifier (e.g., "homepage_hero_text")
  title: string;                   // Display title
  description?: string;            // Optional description
  data: Record<string, any>;       // Flexible JSON data
  updatedAt: Date;
}
```

**Example Content Documents:**
```typescript
// Homepage hero content
{
  key: "homepage_hero",
  title: "Homepage Hero Section",
  data: {
    heading: "Authentic African Delicacies",
    subheading: "Delivered to Your Doorstep",
    ctaText: "Browse Products",
    ctaLink: "/products"
  }
}

// About page content
{
  key: "about_page",
  title: "About Us Content",
  data: {
    story: "Our story text...",
    mission: "Our mission text...",
    values: ["Quality", "Authenticity", "Service"]
  }
}
```

**Indexes:**
- `key`: unique index for content lookup

## Components and Interfaces

### Shadcn UI Integration

The platform uses Shadcn UI components for consistent, accessible UI elements. Shadcn follows a copy-paste model where components are added directly to the project rather than installed as dependencies.

**Setup:**
```bash
npx shadcn-ui@latest init
```

**Required Components:**
- `button` - Primary actions, form submissions
- `input` - Text inputs for forms
- `textarea` - Multi-line text inputs
- `select` - Dropdown selections
- `card` - Product cards, content containers
- `dialog` - Modals for confirmations
- `form` - Form handling with react-hook-form + Zod
- `label` - Form labels
- `table` - Admin data tables
- `toast` - Notifications and alerts
- `carousel` - Homepage image carousel
- `dropdown-menu` - Navigation menus

**Component Customization:**
All Shadcn components can be customized via Tailwind classes and are located in `src/components/ui/`. The design system uses a consistent color palette defined in `tailwind.config.ts`.

### Cloudinary Integration

Cloudinary handles all image uploads, transformations, and delivery via CDN.

**Configuration:**
```typescript
// src/config/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
```

**Upload Service:**
```typescript
// src/lib/services/media.service.ts
export async function uploadImage(
  file: File,
  type: 'hero' | 'carousel' | 'product' | 'category'
): Promise<Media> {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const dataUri = `data:${file.type};base64,${base64}`;
  
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: `confectionary/${type}`,
    transformation: [
      { width: 1200, height: 800, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' }
    ]
  });
  
  return {
    cloudinaryId: result.public_id,
    url: result.url,
    secureUrl: result.secure_url,
    type,
    width: result.width,
    height: result.height,
    format: result.format
  };
}
```

**Image Transformations:**
Cloudinary automatically optimizes images based on device and browser:
- Automatic format selection (WebP for modern browsers)
- Responsive image delivery
- Lazy loading support
- On-the-fly resizing and cropping

**URL Structure:**
```
https://res.cloudinary.com/{cloud_name}/image/upload/
  w_800,h_600,c_fill,q_auto,f_auto/
  confectionary/product/product-123.jpg
```

**React Component Example:**
```typescript
import { CldImage } from 'next-cloudinary';

<CldImage
  src={product.images[0]}
  width={800}
  height={600}
  alt={product.name}
  crop="fill"
  quality="auto"
  format="auto"
/>
```

### Admin Authentication Middleware

Simple password-based authentication for admin routes using Next.js middleware.

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area"'
        }
      });
    }
    
    const [username, password] = Buffer
      .from(authHeader.split(' ')[1], 'base64')
      .toString()
      .split(':');
    
    const validUsername = process.env.ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD;
    
    if (username !== validUsername || password !== validPassword) {
      return new NextResponse('Invalid credentials', { status: 401 });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*'
};
```

## API Routes

### Public API Routes

#### GET /api/products
Fetch all active products with optional filtering.

**Query Parameters:**
- `category` (optional): Filter by category
- `featured` (optional): Only featured products
- `limit` (optional): Number of results
- `skip` (optional): Pagination offset

**Response:**
```typescript
{
  products: Product[];
  total: number;
}
```

#### GET /api/products/[id]
Fetch single product by ID.

**Response:**
```typescript
{
  product: Product;
}
```

#### POST /api/orders
Create new order/inquiry (public endpoint).

**Request Body:**
```typescript
{
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  message?: string;
  shippingAddress?: Address;
}
```

**Response:**
```typescript
{
  order: Order;
  orderNumber: string;
}
```

### Admin API Routes (Protected)

All admin routes require Basic Auth credentials.

#### POST /api/products
Create new product (admin only).

**Request Body:**
```typescript
{
  name: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  preparationSteps: PreparationStep[];
  nutritionInfo?: NutritionInfo;
  isFeatured: boolean;
}
```

#### PUT /api/products/[id]
Update existing product (admin only).

#### DELETE /api/products/[id]
Delete product (admin only).

#### GET /api/orders
Fetch all orders (admin only).

**Query Parameters:**
- `status` (optional): Filter by status
- `limit`, `skip`: Pagination

#### PUT /api/orders/[id]
Update order status (admin only).

**Request Body:**
```typescript
{
  status: "new" | "contacted" | "completed" | "cancelled";
}
```

#### POST /api/media/upload
Upload image to Cloudinary (admin only).

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (image file), `type` (hero|carousel|product|category)

**Response:**
```typescript
{
  media: Media;
}
```

#### GET /api/media/[type]
Fetch all media by type (public for display, admin for management).

**Response:**
```typescript
{
  media: Media[];
}
```

#### GET /api/content
Fetch site content by key.

**Query Parameters:**
- `key`: Content key (e.g., "homepage_hero")

**Response:**
```typescript
{
  content: Content;
}
```

#### PUT /api/content
Update site content (admin only).

**Request Body:**
```typescript
{
  key: string;
  title: string;
  data: Record<string, any>;
}
```

## Key User Flows

### Public User Flow: Browse and Inquire

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant NextJS
    participant MongoDB
    
    User->>Browser: Visit homepage
    Browser->>NextJS: GET /
    NextJS->>MongoDB: Fetch featured products
    MongoDB-->>NextJS: Return products
    NextJS-->>Browser: Render homepage with hero, carousel, products
    
    User->>Browser: Click product
    Browser->>NextJS: GET /products/[id]
    NextJS->>MongoDB: Fetch product details
    MongoDB-->>NextJS: Return product
    NextJS-->>Browser: Render product detail page
    
    User->>Browser: Fill inquiry form
    Browser->>NextJS: POST /api/orders
    NextJS->>MongoDB: Create order document
    MongoDB-->>NextJS: Order created
    NextJS-->>Browser: Show confirmation
    Browser-->>User: Display order number
```

### Admin Flow: Manage Products and Orders

```mermaid
sequenceDiagram
    participant Admin
    participant Browser
    participant NextJS
    participant Cloudinary
    participant MongoDB
    
    Admin->>Browser: Visit /admin
    Browser->>NextJS: GET /admin (with Basic Auth)
    NextJS->>MongoDB: Fetch dashboard stats
    MongoDB-->>NextJS: Return stats
    NextJS-->>Browser: Render dashboard
    
    Admin->>Browser: Upload product image
    Browser->>NextJS: POST /api/media/upload
    NextJS->>Cloudinary: Upload image
    Cloudinary-->>NextJS: Return image URL
    NextJS->>MongoDB: Save media record
    NextJS-->>Browser: Return media data
    
    Admin->>Browser: Create product
    Browser->>NextJS: POST /api/products
    NextJS->>MongoDB: Insert product
    MongoDB-->>NextJS: Product created
    NextJS-->>Browser: Show success
    
    Admin->>Browser: View orders
    Browser->>NextJS: GET /api/orders
    NextJS->>MongoDB: Fetch all orders
    MongoDB-->>NextJS: Return orders
    NextJS-->>Browser: Render order table
```

## Environment Variables

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/confectionary

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure_password_here

# Application
NEXT_PUBLIC_SITE_URL=https://confectionary-platform.vercel.app
NODE_ENV=production
```

## Dependencies

### Core Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-slot": "^1.0.2",
    
    "tailwindcss": "^3.4.0",
    "tailwind-merge": "^2.0.0",
    "clsx": "^2.0.0",
    "class-variance-authority": "^0.7.0",
    
    "mongodb": "^6.3.0",
    "mongoose": "^8.0.0",
    
    "cloudinary": "^1.41.0",
    "next-cloudinary": "^5.0.0",
    
    "zod": "^3.22.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    
    "lucide-react": "^0.294.0",
    "embla-carousel-react": "^8.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "prettier": "^3.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

## Testing Strategy

### Unit Testing
- Test utility functions (validation, helpers)
- Test service layer methods (product.service, order.service, media.service)
- Test React components in isolation using React Testing Library
- Mock external dependencies (MongoDB, Cloudinary)

### Integration Testing
- Test API routes with actual MongoDB test database
- Test Cloudinary upload flow with test credentials
- Test admin authentication middleware
- Test form submissions end-to-end

### Manual Testing Checklist
- [ ] Homepage loads with hero, carousel, and featured products
- [ ] Product listing page displays all active products
- [ ] Product detail page shows preparation steps and images
- [ ] Inquiry form submits successfully and creates order
- [ ] Admin login works with correct credentials
- [ ] Admin can create, edit, and delete products
- [ ] Admin can upload images to Cloudinary
- [ ] Admin can view and update order status
- [ ] Images load from Cloudinary CDN
- [ ] Responsive design works on mobile devices
- [ ] SEO meta tags are present on all pages

## Performance Considerations

### Image Optimization
- Cloudinary automatic format selection (WebP for modern browsers)
- Responsive images with srcset
- Lazy loading for below-the-fold images
- Next.js Image component for automatic optimization

### Caching Strategy
- Static pages cached at CDN edge (Vercel)
- ISR for product pages (revalidate every 60 seconds)
- API routes use stale-while-revalidate pattern
- MongoDB indexes for fast queries

### Bundle Size Optimization
- Shadcn UI components are tree-shakeable
- Server Components reduce client-side JavaScript
- Dynamic imports for admin dashboard components
- Remove unused Tailwind classes in production

### Database Performance
- Indexes on frequently queried fields
- Limit query results with pagination
- Use projection to fetch only needed fields
- Connection pooling for MongoDB

## Security Considerations

### Admin Authentication
- Basic Auth for MVP (username/password in environment variables)
- HTTPS enforced by Vercel
- Admin routes protected by Next.js middleware
- Consider upgrading to proper auth system (NextAuth.js) for production

### Data Validation
- Zod schemas for all API inputs
- Server-side validation for all form submissions
- Sanitize user inputs to prevent XSS
- Rate limiting on public API endpoints (future enhancement)

### Database Security
- MongoDB connection string in environment variables
- Database user with minimal required permissions
- No sensitive data stored (no payment info, no passwords)
- Regular backups via MongoDB Atlas

### Image Upload Security
- File type validation (only images allowed)
- File size limits (max 5MB per image)
- Cloudinary signed uploads for admin routes
- Content Security Policy headers

### CORS and Headers
- Restrict API access to same origin
- Set security headers (X-Frame-Options, X-Content-Type-Options)
- CSP headers for XSS protection

## Deployment Strategy

### Vercel Deployment

**Initial Setup:**
1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set build command: `npm run build`
4. Set output directory: `.next`

**Environment Variables:**
- Add all variables from `.env.production`
- Mark sensitive variables as secret
- Configure different values for preview vs production

**Deployment Flow:**
- Push to `main` branch → Production deployment
- Push to feature branch → Preview deployment
- Automatic HTTPS certificate provisioning
- Global CDN distribution

### MongoDB Atlas Setup

1. Create free tier cluster
2. Configure network access (allow Vercel IPs or 0.0.0.0/0)
3. Create database user with read/write permissions
4. Get connection string and add to Vercel environment variables

### Cloudinary Setup

1. Create free account
2. Get cloud name, API key, and API secret
3. Configure upload presets for different image types
4. Add credentials to Vercel environment variables

## Future Enhancements (Post-MVP)

### Phase 2 Features
- Email notifications for new orders (SendGrid integration)
- Customer order tracking (order status updates)
- Product reviews and ratings
- Advanced search and filtering
- Multi-language support (English, French for African markets)

### Phase 3 Features
- Proper authentication system (NextAuth.js)
- User accounts for repeat customers
- Shopping cart functionality
- Payment processing (Stripe integration)
- Inventory management
- Analytics dashboard for admin

### Scalability Improvements
- Redis caching layer for frequently accessed data
- Full-text search with MongoDB Atlas Search
- CDN caching strategy optimization
- Database sharding for global distribution
- Microservices architecture for order processing

### SEO Enhancements
- Structured data (JSON-LD) for products
- XML sitemap generation
- Blog/content marketing section
- Social media integration
- Email marketing integration

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system - essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Product Slug Uniqueness

*For any* two products in the database, if they have the same slug, then they must be the same product.

**Validates: Requirements 6.3, 6.11, 14.1**

### Property 2: Active Product Visibility

*For any* product, if it is marked as active, then it should appear in public product listings; if it is marked as inactive, then it should only be visible in the admin dashboard.

**Validates: Requirements 1.2, 6.8**

### Property 3: Featured Product Display Limit

*For any* homepage render, the number of displayed featured products should be at most 12, and all displayed products must be both featured and active.

**Validates: Requirements 3.3, 3.6**

### Property 4: Product Image URL Format

*For any* product, all image URLs should start with "https://res.cloudinary.com/" and use HTTPS protocol.

**Validates: Requirements 1.7, 8.9**

### Property 5: Product Category Validity

*For any* product, its category must be one of: "confectionary", "fish", or "foodstuffs".

**Validates: Requirements 1.8, 4.3, 13.6**

### Property 6: Product Detail Completeness

*For any* product detail page render, the output should contain the product's description, at least one image, price, and preparation guide (if preparation steps exist).

**Validates: Requirements 1.3, 1.4**

### Property 7: Preparation Steps Ordering

*For any* product with preparation steps, when rendered, the steps should appear in sequential order by step number with all required fields (step number, title, description).

**Validates: Requirement 1.5**

### Property 8: Order Number Uniqueness

*For any* two orders in the database, if they have the same order number, then they must be the same order.

**Validates: Requirements 2.7, 14.2**

### Property 9: Order Referential Integrity

*For any* order, all product IDs referenced in the order items must exist in the products collection.

**Validates: Requirement 14.5**

### Property 10: Order Required Fields Validation

*For any* order creation attempt, if customer name, email, or phone is missing, then the order should be rejected with field-specific error messages.

**Validates: Requirements 2.2, 2.10**

### Property 11: Order Email Validation

*For any* order creation attempt with an invalid email format, the order should be rejected with an error message.

**Validates: Requirements 2.9, 13.3**

### Property 12: Order Confirmation Response

*For any* successfully created order, the response should include the generated order number.

**Validates: Requirement 2.8**

### Property 13: Order Status Validity

*For any* order, its status must be one of: "new", "contacted", "completed", or "cancelled".

**Validates: Requirements 7.4, 13.7**

### Property 14: Order Status Transitions

*For any* order status update, the transition must follow valid state machine rules: "new" can transition to "contacted" or "cancelled"; "contacted" can transition to "completed" or "cancelled"; "completed" and "cancelled" are terminal states.

**Validates: Requirements 7.5, 7.6, 7.7**

### Property 15: Order Display Sorting

*For any* order list display, orders should be sorted by creation date in descending order (newest first).

**Validates: Requirement 7.8**

### Property 16: Media Type Validity

*For any* media record, its type must be one of: "hero", "carousel", "product", or "category".

**Validates: Requirements 8.2, 13.8**

### Property 17: Media Cloudinary ID Uniqueness

*For any* two media records in the database, if they have the same cloudinaryId, then they must be the same media record.

**Validates: Requirements 8.3, 14.3**

### Property 18: Media URL Security

*For any* media record, both the url and secureUrl fields should be present, and the secureUrl should start with "https://".

**Validates: Requirements 8.8, 8.9**

### Property 19: Media File Size Validation

*For any* image upload attempt with a file size larger than 5MB, the upload should be rejected with an error message.

**Validates: Requirement 8.5**

### Property 20: Media File Type Validation

*For any* file upload attempt with a non-image file type, the upload should be rejected with an error message.

**Validates: Requirement 8.6**

### Property 21: Content Key Uniqueness

*For any* two content records in the database, if they have the same key, then they must be the same content record.

**Validates: Requirements 9.3, 14.4**

### Property 22: Content Round-Trip Preservation

*For any* content with structured JSON data, saving and then retrieving the content should produce equivalent data (round-trip property).

**Validates: Requirement 9.7**

### Property 23: Admin Route Authentication

*For any* request to a route under /admin/*, if the request does not include valid Basic Auth credentials, then the system should return 401 Unauthorized.

**Validates: Requirements 5.1, 5.2, 5.5**

### Property 24: Public Route Accessibility

*For any* request to public routes (/, /products, /products/[id], /contact), the request should be processed without requiring authentication.

**Validates: Requirement 5.6**

### Property 25: Product Price Validation

*For any* product creation or update, if the price is not a positive number, then the operation should be rejected with an error message.

**Validates: Requirement 13.5**

### Property 26: Input Sanitization

*For any* user input containing potentially malicious content (script tags, HTML), the system should sanitize the input to prevent XSS attacks.

**Validates: Requirement 13.2**

### Property 27: Security Headers Presence

*For any* HTTP response, the system should include security headers: X-Frame-Options, X-Content-Type-Options, and Content-Security-Policy.

**Validates: Requirements 13.9, 13.10**

### Property 28: Error Response Format

*For any* validation error, the system should return 400 Bad Request with field-specific error messages in a consistent format.

**Validates: Requirement 15.2**

### Property 29: Resource Not Found Response

*For any* request for a non-existent resource, the system should return 404 Not Found.

**Validates: Requirement 15.4**

### Property 30: Image Alt Text Presence

*For any* image element rendered in the UI, it should include an alt attribute with descriptive text.

**Validates: Requirement 11.4**

### Property 31: Product URL Slug Format

*For any* product, its URL should be in the format /products/[slug] where [slug] is the product's slug field.

**Validates: Requirement 16.5**

### Property 32: SEO Meta Tags Presence

*For any* product page, the HTML should include unique page title and meta description tags.

**Validates: Requirements 16.1, 16.2**

### Property 33: Open Graph Tags Presence

*For any* product page, the HTML should include Open Graph meta tags for social media sharing.

**Validates: Requirement 16.6**

### Property 34: Dashboard Statistics Accuracy

*For any* admin dashboard render, the displayed statistics (total products, total orders, new orders count) should match the current counts in MongoDB.

**Validates: Requirements 10.1, 10.2, 10.3, 10.5**

### Property 35: Category Filtering

*For any* category filter selection on the products page, all displayed products should belong to the selected category.

**Validates: Requirement 4.2**

### Property 36: Timestamp Generation

*For any* newly created document (product, order, media, content), the system should automatically generate createdAt and updatedAt timestamps.

**Validates: Requirement 14.6**
