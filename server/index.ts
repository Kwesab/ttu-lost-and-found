import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getItems, getItemById, createItem, updateItemStatus, deleteItem } from "./routes/items";
import { getClaims, createClaim, updateClaimStatus, deleteClaim } from "./routes/claims";
import { handleUpload, handleDelete } from "./routes/upload";
import { testConnection } from "./db";

export function createServer() {
  const app = express();

  // Test database connection on startup
  testConnection().catch((error) => {
    console.error("Failed to connect to database:", error);
  });

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "50mb" })); // Increase limit for base64 images
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Items routes
  app.get("/api/items", getItems);
  app.get("/api/items/:id", getItemById);
  app.post("/api/items", createItem);
  app.patch("/api/items/:id", updateItemStatus);
  app.delete("/api/items/:id", deleteItem);

  // Claims routes
  app.get("/api/claims", getClaims);
  app.post("/api/claims", createClaim);
  app.patch("/api/claims/:id", updateClaimStatus);
  app.delete("/api/claims/:id", deleteClaim);

  // Upload routes
  app.post("/api/upload", handleUpload);
  app.delete("/api/upload/:publicId", handleDelete);

  return app;
}
