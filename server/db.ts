import { Pool, PoolClient, QueryResult } from "pg";

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : false,
  max: 10, // Reduced max connections for Neon free tier
  min: 2, // Keep minimum connections alive
  idleTimeoutMillis: 60000, // Keep idle connections for 60 seconds
  connectionTimeoutMillis: 30000, // Increased to 30 seconds
  statement_timeout: 30000, // 30 second query timeout
  keepAlive: true, // Enable TCP keepalive
  keepAliveInitialDelayMillis: 10000, // Start keepalive after 10s
});

// Handle pool errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

/**
 * Execute a SQL query
 * @param text - SQL query string
 * @param params - Query parameters
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    console.log("Executed query", { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

/**
 * Close the database pool (for graceful shutdown)
 */
export async function closePool(): Promise<void> {
  await pool.end();
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query("SELECT NOW()");
    console.log("✅ Database connected successfully:", result.rows[0]);
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

export default { query, getClient, closePool, testConnection };
