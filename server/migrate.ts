import "dotenv/config";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { query, testConnection } from "./db.js";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Run database migrations
 */
export async function runMigrations() {
  console.log("🔄 Running database migrations...\n");

  try {
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      throw new Error("Failed to connect to database");
    }

    // Read and execute schema SQL
    const schemaPath = join(__dirname, "schema.sql");
    const schema = readFileSync(schemaPath, "utf-8");

    // Split SQL into statements, handling $$ delimited functions properly
    const statements: string[] = [];
    let currentStatement = "";
    let inDollarQuote = false;
    
    const lines = schema.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip comments and empty lines
      if (trimmed.startsWith("--") || trimmed === "") {
        continue;
      }
      
      currentStatement += line + "\n";
      
      // Check for $$ delimiter (for functions)
      if (trimmed.includes("$$")) {
        inDollarQuote = !inDollarQuote;
      }
      
      // Statement ends at semicolon (but not inside $$ blocks)
      if (trimmed.endsWith(";") && !inDollarQuote) {
        statements.push(currentStatement.trim());
        currentStatement = "";
      }
    }
    
    console.log(`Found ${statements.length} SQL statements to execute\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length > 0) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        await query(statement);
      }
    }

    console.log("\n✅ Migrations completed successfully!\n");
    return true;
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    throw error;
  }
}

/**
 * Drop all tables (use with caution!)
 */
export async function dropAllTables() {
  console.log("⚠️  Dropping all tables...");

  try {
    await query("DROP TABLE IF EXISTS claims CASCADE");
    await query("DROP TABLE IF EXISTS items CASCADE");
    await query("DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE");
    
    console.log("✅ All tables dropped successfully");
    return true;
  } catch (error) {
    console.error("❌ Failed to drop tables:", error);
    throw error;
  }
}

/**
 * Reset database (drop and recreate)
 */
export async function resetDatabase() {
  console.log("🔄 Resetting database...\n");
  await dropAllTables();
  await runMigrations();
  console.log("✅ Database reset complete!\n");
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1])) {
  (async () => {
    try {
      await runMigrations();
      console.log("✅ Migration script completed");
      // Force exit to close pool
      setTimeout(() => process.exit(0), 100);
    } catch (error) {
      console.error("❌ Migration script failed:", error);
      setTimeout(() => process.exit(1), 100);
    }
  })();
}
