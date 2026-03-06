# MongoDB Connection

This module provides a singleton MongoDB connection with connection pooling, error handling, and retry logic.

## Features

- **Singleton Pattern**: Reuses existing connections to avoid connection overhead
- **Connection Pooling**: Configured with min/max pool sizes for optimal performance
- **Retry Logic**: Automatically retries failed connections up to 3 times with exponential backoff
- **Error Handling**: Comprehensive error logging and status tracking
- **Hot Reload Support**: Maintains connection across Next.js hot reloads in development

## Configuration

### Environment Variables

Set the following in your `.env.local` file:

```env
MONGODB_URI=mongodb://localhost:27017/confectionary
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/confectionary
```

### Connection Pool Settings

The connection is configured with the following pool settings:

- **maxPoolSize**: 10 connections
- **minPoolSize**: 2 connections
- **socketTimeoutMS**: 45000ms (45 seconds)
- **serverSelectionTimeoutMS**: 10000ms (10 seconds)

## Usage

### Basic Connection

```typescript
import connectDB from '@/lib/db/mongodb';

// In API routes or server components
export async function GET() {
  try {
    await connectDB();
    // Use mongoose models here
    const products = await Product.find();
    return Response.json({ products });
  } catch (error) {
    return Response.json({ error: 'Database connection failed' }, { status: 500 });
  }
}
```

### Check Connection Status

```typescript
import { getConnectionStatus } from '@/lib/db/mongodb';

const status = getConnectionStatus();
console.log(`MongoDB status: ${status}`);
// Possible values: 'connected', 'connecting', 'disconnected', 'disconnecting', 'unknown'
```

### Disconnect (for testing or cleanup)

```typescript
import { disconnectDB } from '@/lib/db/mongodb';

await disconnectDB();
```

## Testing

### Manual Test

Run the manual test script to verify the connection:

```bash
npm run test:db
```

This will:
1. Connect to MongoDB
2. Verify singleton pattern
3. Check connection status
4. Test disconnect/reconnect

### Requirements

- MongoDB server running locally at `localhost:27017`, OR
- MongoDB Atlas connection string configured in `.env.local`

## Connection Events

The module logs the following connection events:

- `connected`: Initial connection established
- `disconnected`: Connection lost
- `reconnected`: Connection re-established after disconnect
- `error`: Connection error occurred
- `close`: Connection closed

## Error Handling

The module implements retry logic with exponential backoff:

- **Attempt 1**: Immediate
- **Attempt 2**: After 1 second
- **Attempt 3**: After 2 seconds

If all attempts fail, an error is thrown with details about the failure.

## Best Practices

1. **Always call `connectDB()` before database operations**: The singleton pattern ensures this is efficient
2. **Don't disconnect in production**: Let the connection pool manage connections
3. **Use `disconnectDB()` only in tests**: For cleanup between test runs
4. **Monitor connection status**: Use `getConnectionStatus()` for health checks

## Next.js Integration

### API Routes

```typescript
// app/api/products/route.ts
import connectDB from '@/lib/db/mongodb';
import Product from '@/lib/db/models/Product';

export async function GET() {
  await connectDB();
  const products = await Product.find({ isActive: true });
  return Response.json({ products });
}
```

### Server Components

```typescript
// app/products/page.tsx
import connectDB from '@/lib/db/mongodb';
import Product from '@/lib/db/models/Product';

export default async function ProductsPage() {
  await connectDB();
  const products = await Product.find({ isActive: true }).lean();
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
```

## Troubleshooting

### Connection Refused Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution**: Ensure MongoDB is running locally or update `MONGODB_URI` to point to MongoDB Atlas.

### Authentication Failed

```
Error: Authentication failed
```

**Solution**: Check your MongoDB Atlas credentials in the connection string.

### Timeout Error

```
Error: Server selection timed out
```

**Solution**: 
- Check network connectivity
- Verify MongoDB Atlas IP whitelist includes your IP
- Increase `serverSelectionTimeoutMS` if needed

## Production Deployment

For production (Vercel, etc.):

1. Set `MONGODB_URI` environment variable in deployment platform
2. Use MongoDB Atlas for managed database
3. Whitelist deployment platform IPs in MongoDB Atlas
4. Monitor connection pool metrics
5. Set appropriate pool sizes based on traffic

## References

- [Mongoose Connection Options](https://mongoosejs.com/docs/connections.html)
- [MongoDB Connection Pooling](https://www.mongodb.com/docs/manual/administration/connection-pool-overview/)
- [Next.js with MongoDB](https://github.com/vercel/next.js/tree/canary/examples/with-mongodb-mongoose)
