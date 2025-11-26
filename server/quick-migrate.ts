import "dotenv/config";
import pg from "pg";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function quickMigrate() {
  const client = new pg.Client(process.env.DATABASE_URL);
  
  try {
    console.log("🔄 Connecting to database...");
    await client.connect();
    console.log("✅ Connected\n");

    const schemaPath = join(__dirname, "schema.sql");
    const schema = readFileSync(schemaPath, "utf-8");

    console.log("🔄 Running schema...");
    await client.query(schema);
    console.log("✅ Schema executed successfully!\n");

    // Verify tables exist
    const result = await client.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
    );
    console.log("📋 Tables created:");
    result.rows.forEach((row) => console.log(`  - ${row.tablename}`));
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await client.end();
    console.log("\n✅ Migration complete!");
    process.exit(0);
  }
}

quickMigrate();
