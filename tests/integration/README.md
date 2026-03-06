# Integration Tests

## Overview

Integration tests verify the complete product management flow end-to-end, including:
- Product creation with image upload
- Product listing with filters (category, featured status)
- Product updates (basic info, images, name/slug regeneration)
- Product deletion (soft delete)
- Slug generation and uniqueness

## Running Integration Tests

### Prerequisites

Integration tests require a MongoDB connection. You have two options:

#### Option 1: Use MongoDB Atlas (Recommended)

The tests will use the `MONGODB_URI` from your `.env.local` file. Make sure it points to a test database:

```bash
# .env.local
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/confectionary-test
```

#### Option 2: Use Local MongoDB

Install and run MongoDB locally:

```bash
# Install MongoDB (Windows)
# Download from https://www.mongodb.com/try/download/community

# Start MongoDB service
mongod --dbpath C:\data\db

# Update .env.local
MONGODB_URI=mongodb://localhost:27017/confectionary-test
```

### Running the Tests

```bash
# Run all integration tests
npm run test tests/integration/

# Run specific test file
npm run test tests/integration/product-management-flow.test.ts

# Run with coverage
npm run test:coverage tests/integration/
```

## Test Structure

### Product Management Flow Tests

Located in `tests/integration/product-management-flow.test.ts`

**Test Suites:**

1. **Product Creation with Image Upload**
   - Single image upload
   - Multiple images upload
   - Product with preparation steps and nutrition info

2. **Product Listing with Filters**
   - List all active products
   - Filter by category (confectionary, fish, foodstuffs)
   - Filter by featured status
   - Combined filters (category + featured)
   - Pagination

3. **Product Update**
   - Update basic information (description, price)
   - Update images
   - Update name and regenerate slug
   - Toggle featured status

4. **Product Deletion (Soft Delete)**
   - Soft delete product (sets isActive=false)
   - Verify deleted products don't appear in public listings
   - Handle non-existent product deletion

5. **Slug Generation and Uniqueness**
   - Generate slug from product name
   - Handle special characters in slug
   - Generate unique slugs for duplicate names
   - Maintain uniqueness across multiple duplicates

6. **Complete Product Management Flow**
   - Full CRUD cycle (Create → Read → Update → Delete)

## Test Data

Tests use Cloudinary URLs for images:
- `https://res.cloudinary.com/test/image/upload/v1/...`

These are mock URLs for testing purposes. The tests verify:
- URLs are stored correctly
- Multiple images are handled
- Images are included in API responses

## Authentication

Tests use Basic Auth for admin endpoints:
- Username and password from environment variables
- `ADMIN_USERNAME` and `ADMIN_PASSWORD` from `.env.local`

## Cleanup

Tests clean up after themselves:
- `beforeEach` hook deletes all products before each test
- `afterAll` hook closes MongoDB connection

## Troubleshooting

### MongoDB Connection Errors

If you see `ECONNREFUSED 127.0.0.1:27017`:
- Ensure MongoDB is running locally, OR
- Update `MONGODB_URI` to point to MongoDB Atlas

### Timeout Errors

If tests timeout:
- Check MongoDB connection is stable
- Increase timeout in test configuration
- Verify network connectivity to MongoDB Atlas

### Validation Errors

If you see Zod validation errors:
- Check API route validation schemas
- Verify test data matches expected format
- Review error messages for specific field issues

## Future Improvements

- [ ] Add MongoDB Memory Server support for faster tests
- [ ] Add tests for concurrent product creation
- [ ] Add tests for bulk operations
- [ ] Add performance benchmarks
- [ ] Add tests for image upload to actual Cloudinary
