import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import connectDB, { disconnectDB, getConnectionStatus } from '@/lib/db/mongodb';

describe('MongoDB Connection', () => {
  beforeAll(async () => {
    // Ensure we start with a clean state
    await disconnectDB();
  });

  afterAll(async () => {
    // Clean up after tests
    await disconnectDB();
  });

  it('should connect to MongoDB successfully', async () => {
    const mongoose = await connectDB();
    expect(mongoose).toBeDefined();
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
  });

  it('should return connection status', async () => {
    await connectDB();
    const status = getConnectionStatus();
    expect(status).toBe('connected');
  });

  it('should reuse existing connection (singleton pattern)', async () => {
    const conn1 = await connectDB();
    const conn2 = await connectDB();
    expect(conn1).toBe(conn2);
  });

  it('should disconnect successfully', async () => {
    await connectDB();
    await disconnectDB();
    const status = getConnectionStatus();
    expect(status).toBe('disconnected');
  });
});
