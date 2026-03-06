# Configuration

This directory contains configuration files for the Confectionary Platform.

## Environment Configuration (`env.ts`)

The `env.ts` file provides centralized, validated environment variable management using Zod schema validation.

### Features

- **Type-safe access**: All environment variables are fully typed
- **Validation on startup**: Application fails fast with clear error messages if required variables are missing
- **Single source of truth**: Import `env` instead of accessing `process.env` directly
- **Clear error messages**: Detailed validation errors show exactly which variables are missing or invalid

### Required Environment Variables

The following environment variables must be set in your `.env.local` file:

#### Database
- `MONGODB_URI` - MongoDB connection string (e.g., `mongodb://localhost:27017/confectionary`)

#### Cloudinary
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

#### Admin Authentication
- `ADMIN_USERNAME` - Admin dashboard username
- `ADMIN_PASSWORD` - Admin dashboard password

#### Application
- `NEXT_PUBLIC_SITE_URL` - Full site URL (e.g., `http://localhost:3000`)
- `NODE_ENV` - Environment mode (`development`, `production`, or `test`)

### Usage

Instead of accessing `process.env` directly:

```typescript
// ❌ Don't do this
const mongoUri = process.env.MONGODB_URI;
```

Import and use the validated `env` object:

```typescript
// ✅ Do this
import { env } from '@/config/env';

const mongoUri = env.MONGODB_URI;
```

### Benefits

1. **Type Safety**: TypeScript knows the exact type of each variable
2. **Autocomplete**: Your IDE will suggest available environment variables
3. **Validation**: Invalid or missing variables are caught at startup, not at runtime
4. **Documentation**: The schema serves as documentation for required variables

### Example

```typescript
import { env } from '@/config/env';

// All variables are typed and validated
console.log(env.MONGODB_URI);           // string
console.log(env.CLOUDINARY_CLOUD_NAME); // string
console.log(env.NODE_ENV);              // 'development' | 'production' | 'test'
console.log(env.NEXT_PUBLIC_SITE_URL);  // string (validated as URL)
```

### Error Handling

If validation fails, the application will exit with a clear error message:

```
❌ Environment variable validation failed:

  - MONGODB_URI: MONGODB_URI is required
  - CLOUDINARY_API_KEY: CLOUDINARY_API_KEY is required

Please check your .env.local file and ensure all required variables are set.
```

### Testing

The environment configuration includes comprehensive tests in `env.test.ts` that verify:

- All required variables are validated
- Invalid values are rejected
- Default values work correctly
- Error messages are clear and helpful

Run tests with:

```bash
npm test -- src/config/env.test.ts
```

## Other Configuration Files

- `cloudinary.ts` - Cloudinary client configuration
- `database.ts` - Database connection configuration (if needed)
- `admin.ts` - Admin authentication configuration (if needed)
