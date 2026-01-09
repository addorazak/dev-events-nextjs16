import mongoose from "mongoose";

/**
 * MongoDB Connection Module
 * ========================
 * Handles MongoDB connection with caching to prevent multiple connections
 * Uses singleton pattern with connection pooling
 *
 * Best practices:
 * - Cache connection in global variable (development) to survive hot-reloads
 * - In production (Vercel, etc.), functions are stateless but caching still helps
 * - Proper error handling and retry logic
 */

// Interface for cached connection state
interface CachedConnection {
  promise: Promise<typeof mongoose> | null;
  conn: typeof mongoose | null;
}

// Extend globalThis to prevent TypeScript errors when storing connection cache
declare global {
  var mongoose: CachedConnection | undefined;
}

// Initialize cached connection with singleton pattern
const cached: CachedConnection = global.mongoose || {
  promise: null,
  conn: null,
};

// Validate MongoDB URI environment variable
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Missing MONGODB_URI: Please define MONGODB_URI in .env.local\n" +
      "Example: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname"
  );
}

/**
 * Mongoose Connection Options
 * Production-ready configuration for optimal performance
 */
const connectionOptions: mongoose.ConnectOptions = {
  // Disable mongoose buffering for immediate error feedback
  bufferCommands: false,

  // Connection pool settings
  maxPoolSize: 10,
  minPoolSize: 2,

  // Timeout settings (in milliseconds)
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,

  // Retry settings
  retryWrites: true,
  retryReads: true,
};

/**
 * Connect to MongoDB with connection caching
 *
 * Strategy:
 * 1. Return existing connection if available (cached.conn)
 * 2. Return existing promise if already connecting (prevents race conditions)
 * 3. Create new connection promise if needed
 * 4. Handle errors gracefully with proper cleanup
 *
 * @returns {Promise<typeof mongoose>} Mongoose instance
 * @throws {Error} If connection fails after all retries
 */
async function connectToDatabase(): Promise<typeof mongoose> {
  // Check if connection already exists
  if (cached.conn) {
    console.log("Using cached MongoDB connection");
    return cached.conn;
  }

  // If connection is already in progress, wait for it
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI!, connectionOptions)
      .then((mongooseInstance) => {
        console.log("Successfully connected to MongoDB");
        return mongooseInstance;
      })
      .catch((error: Error) => {
        // Reset promise on failure to allow retry on next call
        cached.promise = null;
        console.error("MongoDB connection failed:", error.message);
        throw new Error(`Database connection error: ${error.message}`);
      });
  }

  try {
    // Await the connection promise
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset promise on error to allow retry
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

/**
 * Preserve global mongoose cache during development hot-reloads
 * In production, this is still useful for connection pooling within the same process
 */

if (process.env.NODE_ENV !== "production") {
  global.mongoose = cached;
}

export default connectToDatabase;
