# Database Scripts

This directory contains utility scripts for database management and setup.

## Available Scripts

### `seed-database.ts`

Seeds the database with sample data for development and testing.

**Usage:**
```bash
npm run seed
```

**What it does:**
- Connects to MongoDB using the `MONGODB_URI` environment variable
- Clears existing data from products, media, and content collections
- Seeds sample products (at least 3 per category: confectionary, fish, foodstuffs)
- Seeds sample media records (hero and carousel images)
- Seeds default content records (homepage_hero, about_page)

**Features:**
- **Idempotent**: Can be run multiple times safely - clears data before seeding
- **Comprehensive**: Includes products with preparation steps, nutrition info, and images
- **Categorized**: Products are distributed across all three categories
- **Featured Products**: Some products are marked as featured for homepage display

**Sample Data Included:**

**Confectionary (4 products):**
- Nigerian Chin Chin
- Plantain Chips
- Coconut Candy
- Puff Puff Mix

**Fish Products (4 products):**
- Smoked Catfish
- Dried Crayfish
- Stockfish
- Smoked Mackerel

**Foodstuffs (4 products):**
- Egusi Seeds (Ground)
- Plantain Flour
- Palm Oil (Red)
- Ogbono Seeds (Ground)

**Media (4 records):**
- 1 Hero image
- 3 Carousel images

**Content (2 records):**
- Homepage hero section
- About page content

**Requirements:**
- MongoDB connection must be configured in `.env.local`
- `MONGODB_URI` environment variable must be set

**Example Output:**
```
🌱 Starting database seeding...

✅ Connected to MongoDB

📦 Clearing existing data...
🗑️  Cleared products collection
🗑️  Cleared media collection
🗑️  Cleared content collection

🌱 Seeding new data...
✅ Seeded 4 media records
✅ Seeded 2 content records
✅ Seeded 12 products
   - Confectionary: 4 products
   - Fish: 4 products
   - Foodstuffs: 4 products
   - Featured: 8 products

✅ Database seeding completed successfully!

📊 Summary:
   - 4 media records
   - 2 content records
   - 12 products

👋 Database connection closed
```

**Testing:**
The seeding script has unit tests to validate the data structure:
```bash
npm test -- scripts/seed-database.test.ts
```

**Notes:**
- All product images use placeholder Cloudinary URLs
- In production, replace these with actual uploaded images
- The script uses the same MongoDB models as the application
- All seeded products are marked as active and visible
- 8 out of 12 products are marked as featured for homepage display

## Environment Variables

Make sure your `.env.local` file contains:
```env
MONGODB_URI=mongodb://localhost:27017/confectionary
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/confectionary
```

## Troubleshooting

**Error: "MONGODB_URI environment variable is not set"**
- Ensure `.env.local` exists in the project root
- Verify `MONGODB_URI` is defined in the file

**Error: "connect ECONNREFUSED"**
- MongoDB is not running locally
- For local development, start MongoDB: `mongod`
- For MongoDB Atlas, ensure your connection string is correct

**Error: "MongoServerError: E11000 duplicate key error"**
- The script should clear data before seeding
- If this occurs, manually clear collections or check for unique constraint violations
