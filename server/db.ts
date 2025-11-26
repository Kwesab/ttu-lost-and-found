/**
 * DATABASE CONNECTION FILE
 * ======================
 * This file manages the connection to our PostgreSQL database hosted on Neon.
 * 
 * What is a Connection Pool?
 * - Instead of creating a new database connection for every request (slow),
 *   we create a "pool" of reusable connections
 * - Think of it like a taxi stand - taxis wait there ready to serve customers
 * - When a request needs the database, it "borrows" a connection from the pool
 * - When done, it returns the connection to the pool for the next request
 * 
 * Why use a pool?
 * - Much faster (no connection setup time for each request)
 * - More efficient (limits total connections to database)
 * - More reliable (handles connection errors gracefully)
 */

import { Pool, PoolClient, QueryResult } from "pg";

// Create PostgreSQL connection pool
// This is like creating our taxi stand with specific rules
const pool = new Pool({
  // connectionString: Where is our database? (from .env file)
  // Example: postgresql://username:password@host:port/database
  connectionString: process.env.DATABASE_URL,
  
  // ssl: Secure connection required? (Neon requires SSL)
  ssl: process.env.DATABASE_URL?.includes("sslmode=require")
    ? { rejectUnauthorized: false }  // Trust the SSL certificate
    : false,
  
  // max: Maximum number of connections in the pool (10 for Neon free tier)
  // Like having max 10 taxis at the stand
  max: 10,
  
  // min: Minimum connections to keep alive (2 connections ready to go)
  // Like always keeping 2 taxis waiting at the stand
  min: 2,
  
  // idleTimeoutMillis: How long to keep unused connections (60 seconds)
  // If a taxi hasn't been used for 60 seconds, send it away
  idleTimeoutMillis: 60000,
  
  // connectionTimeoutMillis: How long to wait when connecting (30 seconds)
  // If it takes more than 30 seconds to get a taxi, give up
  connectionTimeoutMillis: 30000,
  
  // statement_timeout: Maximum time for a query to run (30 seconds)
  // If a database query takes more than 30 seconds, cancel it
  statement_timeout: 30000,
  
  // keepAlive: Send "ping" messages to keep connection alive
  // Like the taxi driver calling every 10 seconds to say "I'm still here"
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000, // Start pinging after 10 seconds
});

// Handle pool errors
// If something goes wrong with the pool (like losing database connection),
// log the error and shut down the app (it will restart automatically on Render)
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);  // Exit code -1 means "error" (not a normal shutdown)
});

/**
 * QUERY FUNCTION
 * ==============
 * This is the main function we use to talk to the database.
 * 
 * How it works:
 * 1. We give it SQL text (like "SELECT * FROM items")
 * 2. Optionally, we give it parameters (like the item ID we want)
 * 3. It executes the query on the database
 * 4. It returns the results
 * 
 * Example usage:
 *   const result = await query("SELECT * FROM items WHERE id = $1", [itemId]);
 *   const items = result.rows;
 * 
 * Why use $1, $2 instead of putting values directly in SQL?
 * - Security! Prevents SQL injection attacks
 * - $1 means "first parameter", $2 means "second parameter", etc.
 * 
 * @param text - SQL query string (e.g., "SELECT * FROM items WHERE id = $1")
 * @param params - Array of values to replace $1, $2, etc. (e.g., [itemId])
 * @returns Query result with rows of data
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  // Record when we started (for performance tracking)
  const start = Date.now();
  
  try {
    // Execute the query using a connection from the pool
    const result = await pool.query<T>(text, params);
    
    // Calculate how long the query took
    const duration = Date.now() - start;
    
    // Log query details (helpful for debugging slow queries)
    console.log("Executed query", { text, duration, rows: result.rowCount });
    
    // Return the results
    return result;
  } catch (error) {
    // If something goes wrong, log the error and throw it
    // (The calling code will handle the error)
    console.error("Database query error:", error);
    throw error;
  }
}

/**
 * GET CLIENT FUNCTION
 * ===================
 * Gets a dedicated database connection for transactions.
 * 
 * What is a transaction?
 * - A group of database operations that must all succeed or all fail together
 * - Example: Transferring money - deduct from account A and add to account B
 *   If one fails, we need to undo the other (rollback)
 * 
 * When to use this instead of query()?
 * - When you need multiple queries to be atomic (all or nothing)
 * - Example: Creating an item and updating user stats in one transaction
 * 
 * Usage:
 *   const client = await getClient();
 *   try {
 *     await client.query("BEGIN");
 *     await client.query("INSERT INTO items ...");
 *     await client.query("UPDATE users ...");
 *     await client.query("COMMIT");
 *   } catch (error) {
 *     await client.query("ROLLBACK");
 *   } finally {
 *     client.release(); // Return connection to pool
 *   }
 */
export async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

/**
 * CLOSE POOL FUNCTION
 * ===================
 * Shuts down all database connections gracefully.
 * 
 * When to use this?
 * - When the server is shutting down
 * - During testing (clean up after tests)
 * 
 * This ensures:
 * - All pending queries finish
 * - Connections are properly closed
 * - No hanging connections on the database server
 */
export async function closePool(): Promise<void> {
  await pool.end();
}

/**
 * TEST CONNECTION FUNCTION
 * ========================
 * Checks if we can successfully connect to the database.
 * 
 * What it does:
 * 1. Sends a simple query to the database (SELECT NOW())
 * 2. If successful, logs success message with current database time
 * 3. If failed, logs error message
 * 
 * We run this when the server starts to catch database problems early.
 * Better to fail immediately than to discover connection issues when a user
 * tries to use the app!
 * 
 * @returns true if connected successfully, false if failed
 */
export async function testConnection(): Promise<boolean> {
  try {
    // Try to get current time from database
    const result = await query("SELECT NOW()");
    
    // If we got here, connection works! Log success
    console.log("✅ Database connected successfully:", result.rows[0]);
    return true;
  } catch (error) {
    // Connection failed, log error
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// Export all functions as default object
// This allows: import db from './db' and use db.query(), db.testConnection(), etc.
export default { query, getClient, closePool, testConnection };
