# Confectionary Platform

A simplified MVP web application for showcasing African food products (confectionary items, fish products, and diverse African foodstuffs) with detailed preparation guides and customer inquiry collection.

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript, React 18
- **UI Framework**: Shadcn UI + Tailwind CSS
- **Database**: MongoDB Atlas with Mongoose
- **Image Management**: Cloudinary CDN
- **Hosting**: Vercel
- **Authentication**: Basic Auth for admin routes

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install --legacy-peer-deps
```

3. Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

See `.env.example` for required environment variables:

- `MONGODB_URI` - MongoDB connection string
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - Cloudinary credentials
- `ADMIN_USERNAME`, `ADMIN_PASSWORD` - Admin dashboard credentials
- `NEXT_PUBLIC_SITE_URL` - Site URL for absolute links

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── ui/                # Shadcn UI components
│   ├── layout/            # Layout components
│   ├── home/              # Homepage components
│   ├── products/          # Product components
│   ├── orders/            # Order/inquiry components
│   ├── media/             # Media management components
│   └── admin/             # Admin dashboard components
├── lib/                   # Core utilities
│   ├── db/               # Database models and connection
│   ├── services/         # Business logic services
│   ├── utils/            # Utility functions
│   ├── hooks/            # Custom React hooks
│   └── constants/        # Constants and configuration
├── types/                # TypeScript type definitions
└── config/               # Configuration files
```

## Features

### Public Features
- Browse products by category (confectionary, fish, foodstuffs)
- View detailed product information with preparation guides
- Submit product inquiries with contact information
- Responsive design for mobile and desktop

### Admin Features (Protected)
- Dashboard with key metrics
- Product management (create, edit, delete)
- Order/inquiry management
- Image upload to Cloudinary
- Content management for homepage and about page

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with sample data

### Code Style

- ESLint for code linting
- Prettier for code formatting
- TypeScript strict mode enabled

## Deployment

The application is designed to be deployed on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## License

Private project - All rights reserved
