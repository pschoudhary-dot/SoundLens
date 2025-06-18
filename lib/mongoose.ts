import mongoose from 'mongoose';

// Define the global mongoose type
declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 60000, // Increase timeout to 60 seconds
      socketTimeoutMS: 60000, // Increase socket timeout to 60 seconds
      serverSelectionTimeoutMS: 60000, // Increase server selection timeout
      maxPoolSize: 10, // Increase connection pool size
      family: 4, // Use IPv4, skip trying IPv6
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully');
        return mongoose as any;
      })
      .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        // Don't throw the error here, just log it and return a resolved promise
        // This prevents the app from crashing if MongoDB is temporarily unavailable
        return mongoose as any;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
