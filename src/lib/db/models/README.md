# Database Models

This directory contains Mongoose schema definitions for the Confectionary Platform.

## Product Model

The Product model represents food items (confectionary, fish, or foodstuffs) displayed on the platform.

### Schema Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Product name (max 200 characters) |
| `slug` | String | Yes | URL-friendly slug (unique, auto-generated) |
| `category` | String | Yes | Product category: 'confectionary', 'fish', or 'foodstuffs' |
| `description` | String | Yes | Product description |
| `price` | Number | Yes | Price (must be positive) |
| `currency` | String | Yes | Currency code: 'GBP', 'USD', or 'EUR' (default: 'GBP') |
| `images` | String[] | No | Array of Cloudinary HTTPS URLs |
| `preparationSteps` | Array | No | Step-by-step preparation instructions |
| `nutritionInfo` | Object | No | Nutritional information |
| `isFeatured` | Boolean | No | Show on homepage (default: false) |
| `isActive` | Boolean | No | Visible to public (default: true) |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

### Preparation Steps Schema

Each preparation step contains:
- `stepNumber` (Number, required): Step sequence number
- `title` (String, required): Step title
- `description` (String, required): Step instructions
- `imageUrl` (String, optional): Image URL for this step
- `duration` (String, optional): Time required (e.g., "10 minutes")

### Nutrition Info Schema

Optional nutritional information:
- `servingSize` (String): Serving size (e.g., "100g")
- `calories` (Number): Calorie count
- `protein` (String): Protein content (e.g., "5g")
- `carbs` (String): Carbohydrate content (e.g., "30g")
- `fat` (String): Fat content (e.g., "10g")

### Indexes

- **Unique index** on `slug` for fast lookups and uniqueness enforcement
- **Index** on `category` for category filtering
- **Indexes** on `isFeatured` and `isActive` for visibility queries
- **Compound index** on `isFeatured` + `isActive` for homepage queries
- **Text index** on `name` for full-text search

### Validation Rules

- `price` must be greater than zero
- `category` must be one of: 'confectionary', 'fish', 'foodstuffs'
- `currency` must be one of: 'GBP', 'USD', 'EUR'
- All image URLs must use HTTPS protocol
- `slug` must be unique across all products

### Auto-Generation

- **Slug**: Automatically generated from product name on save
  - Converts to lowercase
  - Replaces spaces with hyphens
  - Removes special characters
  - Ensures uniqueness by appending numbers if needed

### Instance Methods

- `isVisibleToPublic()`: Returns true if product is active
- `shouldShowOnHomepage()`: Returns true if product is both featured and active

### Static Methods

- `generateUniqueSlug(name, excludeId?)`: Generates a unique slug from a name
  - Appends number suffix if slug already exists
  - Optionally excludes a specific product ID (useful for updates)

### Usage Example

```typescript
import Product from '@/lib/db/models/Product';

// Create a new product
const product = await Product.create({
  name: 'Nigerian Chin Chin',
  category: 'confectionary',
  description: 'Delicious crunchy Nigerian snack',
  price: 12.99,
  currency: 'GBP',
  images: ['https://res.cloudinary.com/example/image.jpg'],
  preparationSteps: [
    {
      stepNumber: 1,
      title: 'Mix ingredients',
      description: 'Combine flour, sugar, and butter',
      duration: '10 minutes',
    },
  ],
  isFeatured: true,
  isActive: true,
});

// Query products
const featuredProducts = await Product.find({
  isFeatured: true,
  isActive: true,
}).limit(12);

// Search products by name
const searchResults = await Product.find({
  $text: { $search: 'chin chin' },
});

// Generate unique slug
const slug = await Product.generateUniqueSlug('Nigerian Chin Chin');
```

### Testing

Unit tests are available in `Product.unit.test.ts` to verify:
- Schema structure and field types
- Validation rules
- Index configuration
- Instance and static methods
- Slug generation logic

Run tests with:
```bash
npm test -- src/lib/db/models/Product.unit.test.ts
```

## Order Model

The Order model represents customer inquiries/orders submitted through the platform.

### Schema Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `orderNumber` | String | Auto | Unique order number (format: ORD-YYYYMMDD-NNN) |
| `customerName` | String | Yes | Customer's full name (max 200 characters) |
| `customerEmail` | String | Yes | Customer's email address (validated format) |
| `customerPhone` | String | Yes | Customer's phone number |
| `items` | Array | Yes | Array of order items |
| `message` | String | No | Customer's inquiry message (max 1000 characters) |
| `status` | String | Yes | Order status (default: 'new') |
| `shippingAddress` | Object | No | Optional shipping address |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

### Order Item Schema

Each order item contains:
- `productId` (ObjectId, required): Reference to Product
- `productName` (String, required): Product name at time of order
- `quantity` (Number, required): Quantity ordered (min: 1)
- `priceAtTime` (Number, required): Product price at time of order

### Shipping Address Schema

Optional shipping address:
- `street` (String): Street address
- `city` (String): City
- `state` (String): State/province
- `postalCode` (String): Postal/ZIP code
- `country` (String): Country

### Indexes

- **Unique index** on `orderNumber` for fast lookups
- **Index** on `customerEmail` for customer lookup
- **Index** on `status` for admin filtering
- **Descending index** on `createdAt` for recent orders
- **Compound index** on `status` + `createdAt` for admin queries

### Validation Rules

- `customerEmail` must be valid email format
- `status` must be one of: 'new', 'contacted', 'completed', 'cancelled'
- `quantity` must be at least 1
- `priceAtTime` must be non-negative
- Status transitions must follow state machine rules

### Status State Machine

Valid status transitions:
- `new` → `contacted` or `cancelled`
- `contacted` → `completed` or `cancelled`
- `completed` → (terminal state, no transitions)
- `cancelled` → (terminal state, no transitions)

### Auto-Generation

- **Order Number**: Automatically generated on save
  - Format: `ORD-YYYYMMDD-NNN` (e.g., ORD-20240115-001)
  - Date-based with sequential numbering per day

### Instance Methods

- `canTransitionTo(newStatus)`: Checks if status transition is valid

### Static Methods

- `generateOrderNumber()`: Generates unique order number for current date
- `isValidStatusTransition(currentStatus, newStatus)`: Validates status transition

### Usage Example

```typescript
import Order from '@/lib/db/models/Order';

// Create a new order
const order = await Order.create({
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: '+44 123 456 7890',
  items: [
    {
      productId: productId,
      productName: 'Nigerian Chin Chin',
      quantity: 2,
      priceAtTime: 12.99,
    },
  ],
  message: 'Please deliver before Friday',
  shippingAddress: {
    street: '123 Main St',
    city: 'London',
    postalCode: 'SW1A 1AA',
    country: 'UK',
  },
});

// Query orders
const newOrders = await Order.find({ status: 'new' })
  .sort({ createdAt: -1 })
  .limit(10);

// Update order status
if (order.canTransitionTo('contacted')) {
  order.status = 'contacted';
  await order.save();
}
```

## Media Model

The Media model represents images stored in Cloudinary CDN.

### Schema Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `cloudinaryId` | String | Yes | Cloudinary public_id (unique) |
| `url` | String | Yes | HTTP URL |
| `secureUrl` | String | Yes | HTTPS URL |
| `type` | String | Yes | Media type: 'hero', 'carousel', 'product', or 'category' |
| `altText` | String | Yes | Accessibility alt text (max 500 characters) |
| `width` | Number | Yes | Image width in pixels |
| `height` | Number | Yes | Image height in pixels |
| `format` | String | Yes | Image format (e.g., 'jpg', 'png', 'webp') |
| `createdAt` | Date | Auto | Upload timestamp |

### Indexes

- **Unique index** on `cloudinaryId` for fast lookups
- **Index** on `type` for filtering by media type
- **Descending index** on `createdAt` for recent uploads
- **Compound index** on `type` + `createdAt` for filtered sorting

### Validation Rules

- `cloudinaryId` must be unique
- `url` must be valid HTTP or HTTPS URL
- `secureUrl` must use HTTPS protocol
- `type` must be one of: 'hero', 'carousel', 'product', 'category'
- `width` and `height` must be positive numbers
- `altText` is required for accessibility

### Instance Methods

- `isHeroImage()`: Returns true if type is 'hero'
- `isCarouselImage()`: Returns true if type is 'carousel'
- `isProductImage()`: Returns true if type is 'product'
- `isCategoryImage()`: Returns true if type is 'category'

### Static Methods

- `getByType(type, limit?)`: Fetches media by type, sorted by creation date
- `findByCloudinaryId(cloudinaryId)`: Finds media by Cloudinary ID

### Usage Example

```typescript
import Media from '@/lib/db/models/Media';

// Create media record after Cloudinary upload
const media = await Media.create({
  cloudinaryId: 'confectionary/hero/hero-image-1',
  url: 'http://res.cloudinary.com/example/image.jpg',
  secureUrl: 'https://res.cloudinary.com/example/image.jpg',
  type: 'hero',
  altText: 'Homepage hero image showing African delicacies',
  width: 1920,
  height: 1080,
  format: 'jpg',
});

// Query media by type
const heroImages = await Media.getByType('hero', 5);
const carouselImages = await Media.getByType('carousel');

// Find by Cloudinary ID
const image = await Media.findByCloudinaryId('confectionary/hero/hero-image-1');
```

## Content Model

The Content model represents editable site content (homepage hero text, about page content, etc.).

### Schema Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `key` | String | Yes | Unique content identifier (lowercase, alphanumeric with underscores) |
| `title` | String | Yes | Display title (max 200 characters) |
| `description` | String | No | Optional description (max 500 characters) |
| `data` | Object | Yes | Flexible JSON data structure |
| `updatedAt` | Date | Auto | Last update timestamp |

### Indexes

- **Unique index** on `key` for fast lookups and uniqueness enforcement

### Validation Rules

- `key` must be unique and contain only lowercase letters, numbers, and underscores
- `key` is automatically converted to lowercase
- `title` is required and trimmed
- `data` is a flexible Mixed type that accepts any JSON structure

### Data Field Flexibility

The `data` field uses Mongoose's Mixed type, allowing storage of various content structures:

```typescript
// Homepage hero content
{
  key: 'homepage_hero',
  title: 'Homepage Hero Section',
  data: {
    heading: 'Authentic African Delicacies',
    subheading: 'Delivered to Your Doorstep',
    ctaText: 'Browse Products',
    ctaLink: '/products'
  }
}

// About page content
{
  key: 'about_page',
  title: 'About Us Content',
  data: {
    story: 'Our story text...',
    mission: 'Our mission text...',
    values: ['Quality', 'Authenticity', 'Service']
  }
}
```

### Instance Methods

- `getData()`: Returns the data object
- `updateData(newData)`: Merges new data with existing data

### Static Methods

- `findByKey(key)`: Finds content by key (case-insensitive)
- `upsertByKey(key, title, data, description?)`: Updates existing content or creates new
- `getAllKeys()`: Returns array of all content keys

### Usage Example

```typescript
import Content from '@/lib/db/models/Content';

// Create or update content
const content = await Content.upsertByKey(
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

// Find content by key
const heroContent = await Content.findByKey('homepage_hero');
console.log(heroContent.getData());

// Update content data
heroContent.updateData({ heading: 'New Heading' });
await heroContent.save();

// Get all content keys
const keys = await Content.getAllKeys();
console.log(keys); // ['homepage_hero', 'about_page', ...]
```

### Testing

Unit tests are available in `Content.unit.test.ts` to verify:
- Schema structure and field types
- Validation rules
- Index configuration
- Instance and static methods
- Data field flexibility

Run tests with:
```bash
npm test src/lib/db/models/Content.unit.test.ts
```

## Model Relationships

### Product ← Order
- Orders reference Products via `items[].productId`
- Product name and price are denormalized in Order for historical accuracy

### Media → Content
- Content can reference Media URLs in its flexible `data` field
- No direct foreign key relationship

### All Models → MongoDB
- All models use Mongoose for schema validation and querying
- Connection managed by `src/lib/db/mongodb.ts`
- Automatic timestamp management via Mongoose timestamps option

## Best Practices

1. **Always validate input** before creating/updating documents
2. **Use static methods** for complex queries (e.g., `Product.generateUniqueSlug`)
3. **Check status transitions** before updating Order status
4. **Use indexes** for frequently queried fields
5. **Denormalize when appropriate** (e.g., product name in orders)
6. **Handle errors** from unique constraint violations
7. **Use HTTPS URLs** for all image references
8. **Provide alt text** for all media for accessibility

## Running All Model Tests

```bash
# Run all model tests
npm test src/lib/db/models/

# Run specific model test
npm test src/lib/db/models/Product.unit.test.ts
npm test src/lib/db/models/Order.unit.test.ts
npm test src/lib/db/models/Media.unit.test.ts
npm test src/lib/db/models/Content.unit.test.ts
```
