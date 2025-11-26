import "dotenv/config";
import { testConnection, closePool } from "./db.js";

(async () => {
  try {
    console.log("Testing database connection...");
    const connected = await testConnection();
    if (connected) {
      console.log("✅ Connection successful!");
    } else {
      console.log("❌ Connection failed");
    }
    await closePool();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
})();
