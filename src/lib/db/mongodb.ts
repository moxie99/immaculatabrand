import mongoose from 'mongoose';
import { env } from '@/config/env';

/**
 * MongoDB connection configuration and singleton pattern implementation
 * Provides connection pooling, error handling, and retry logic
 */

interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Global cache to maintain connection across hot reloads in development
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseConnection | undefined;
}

let cached: MongooseConnection = global.mongoose || {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

// Connection options with pooling configuration
const options: mongoose.ConnectOptions = {
  dbName: 'confectionary', // Specify database name
  maxPoolSize: 10, // Maximum number of connections in the pool
  minPoolSize: 2, // Minimum number of connections in the pool
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  serverSelectionTimeoutMS: 10000, // Timeout for server selection (10 seconds)
  family: 4, // Use IPv4, skip trying IPv6
};

/**
 * Connect to MongoDB with singleton pattern
 * Reuses existing connection if available
 * Implements retry logic for connection failures
 */
async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection if available
  if (cached.conn) {
    console.log('✅ Using cached MongoDB connection');
    return cached.conn;
  }

  // Return existing connection promise if connection is in progress
  if (cached.promise) {
    console.log('⏳ MongoDB connection in progress, waiting...');
    cached.conn = await cached.promise;
    return cached.conn;
  }

  // Create new connection with retry logic
  cached.promise = connectWithRetry();

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}

/**
 * Connect to MongoDB with retry logic
 * Retries up to 3 times with exponential backoff
 */
async function connectWithRetry(
  retries = 3,
  delay = 1000
): Promise<typeof mongoose> {
  const MONGODB_URI = env.MONGODB_URI;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Attempting MongoDB connection (attempt ${attempt}/${retries})...`);
      
      const conn = await mongoose.connect(MONGODB_URI, options);
      
      console.log('✅ MongoDB connected successfully');
      console.log(`📊 Database: ${conn.connection.db?.databaseName || 'unknown'}`);
      console.log(`🌐 Host: ${conn.connection.host}`);
      
      // Set up connection event listeners
      setupConnectionListeners(conn.connection);
      
      return conn;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${attempt} failed:`, error);
      
      if (attempt === retries) {
        console.error('💥 All MongoDB connection attempts failed');
        throw new Error(
          `Failed to connect to MongoDB after ${retries} attempts: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
      
      // Exponential backoff: wait longer between each retry
      const waitTime = delay * Math.pow(2, attempt - 1);
      console.log(`⏱️  Retrying in ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
  
  throw new Error('Failed to connect to MongoDB');
}

/**
 * Set up event listeners for MongoDB connection
 * Logs connection status changes
 */
function setupConnectionListeners(connection: mongoose.Connection): void {
  connection.on('connected', () => {
    console.log('📡 MongoDB connection established');
  });

  connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB connection lost');
  });

  connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected');
  });

  connection.on('error', (error) => {
    console.error('❌ MongoDB connection error:', error);
  });

  connection.on('close', () => {
    console.log('🔌 MongoDB connection closed');
  });
}

/**
 * Disconnect from MongoDB
 * Useful for cleanup in tests or graceful shutdown
 */
export async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await cached.conn.connection.close();
    cached.conn = null;
    cached.promise = null;
    console.log('👋 MongoDB disconnected');
  }
}

/**
 * Get connection status
 * Returns the current state of the MongoDB connection
 */
export function getConnectionStatus(): string {
  if (!cached.conn) {
    return 'disconnected';
  }
  
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  
  return states[cached.conn.connection.readyState] || 'unknown';
}

export default connectDB;
