import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  
  console.log('🔍 Testing MongoDB connection...');
  console.log('📝 Connection string (password hidden):', uri?.replace(/:[^:@]+@/, ':****@'));
  
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment');
    process.exit(1);
  }

  try {
    console.log('\n⏳ Attempting to connect...');
    
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connection successful!');
    console.log('📊 Database:', conn.connection.db?.databaseName);
    console.log('🌐 Host:', conn.connection.host);
    console.log('🔌 Ready state:', conn.connection.readyState);
    
    await mongoose.disconnect();
    console.log('\n👋 Disconnected successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection failed!');
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('\nFull error:', error);
    }
    
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Verify your IP is whitelisted in MongoDB Atlas (Network Access)');
    console.log('2. Check if the cluster is active (not paused)');
    console.log('3. Verify the username and password are correct');
    console.log('4. Try getting a fresh connection string from MongoDB Atlas');
    
    process.exit(1);
  }
}

testConnection();
