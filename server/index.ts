/**
 * MAIN SERVER FILE
 * ================
 * This is the heart of our backend - it sets up the Express server and all API routes.
 * 
 * What is Express?
 * - A web framework for Node.js
 * - Handles HTTP requests (GET, POST, PUT, DELETE, etc.)
 * - Routes requests to the right handler functions
 * - Think of it as a traffic controller for web requests
 * 
 * What happens here?
 * 1. Import all the tools and route handlers we need
 * 2. Create an Express app
 * 3. Set up middleware (code that runs for every request)
 * 4. Define all our API endpoints (routes)
 * 5. Return the configured server
 */

import "dotenv/config";  // Load environment variables from .env file
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getItems, getItemById, createItem, updateItemStatus, deleteItem } from "./routes/items";
import { getClaims, createClaim, updateClaimStatus, deleteClaim } from "./routes/claims";
import { handleUpload, handleDelete } from "./routes/upload";
import { testConnection } from "./db";

/**
 * CREATE SERVER FUNCTION
 * ======================
 * Creates and configures the Express server with all routes and middleware.
 * 
 * We export this as a function (instead of just creating the server here) because:
 * - We can create multiple server instances for testing
 * - We can configure the server differently for dev vs production
 * - It's easier to test
 */
export function createServer() {
  // Create a new Express application
  const app = express();

  // Test database connection on startup
  // This helps us catch database issues immediately when the server starts
  // instead of waiting for the first user request to fail
  testConnection().catch((error) => {
    console.error("Failed to connect to database:", error);
  });

  // ===================
  // MIDDLEWARE SETUP
  // ===================
  // Middleware = code that runs for EVERY request before it reaches our route handlers
  
  // CORS (Cross-Origin Resource Sharing)
  // Allows our frontend (localhost:5173 in dev, deployed URL in prod) to make requests
  // Without this, browsers would block requests from different origins for security
  app.use(cors());
  
  // JSON Parser Middleware
  // Automatically converts JSON request bodies into JavaScript objects
  // Example: {"name": "John"} becomes req.body = {name: "John"}
  // limit: "50mb" allows uploading large base64 images
  app.use(express.json({ limit: "50mb" }));
  
  // URL-Encoded Parser Middleware
  // Handles form data submissions (like traditional HTML forms)
  // extended: true allows rich objects and arrays
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // ===================
  // API ROUTES
  // ===================
  // Each route connects a URL + HTTP method to a handler function
  // Format: app.METHOD(path, handlerFunction)
  
  // ------------------
  // Test/Example Routes
  // ------------------
  
  // Ping endpoint - used to check if server is alive
  // GET /api/ping → Returns {message: "ping"}
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Demo endpoint - example route (can be removed in production)
  app.get("/api/demo", handleDemo);

  // ------------------
  // ITEMS ROUTES
  // ------------------
  // These handle all operations on lost/found items
  
  // GET /api/items - Get all items (or filter by type with ?type=lost or ?type=found)
  app.get("/api/items", getItems);
  
  // GET /api/items/:id - Get a single item by its ID
  // Example: GET /api/items/123abc
  app.get("/api/items/:id", getItemById);
  
  // POST /api/items - Create a new item (lost or found)
  // Body: {type, title, description, location, date, imageUrls, contactEmail, verificationQuestions}
  app.post("/api/items", createItem);
  
  // PATCH /api/items/:id - Update an item's status
  // Example: Mark item as "claimed" or "returned"
  app.patch("/api/items/:id", updateItemStatus);
  
  // DELETE /api/items/:id - Delete an item
  // Example: DELETE /api/items/123abc
  app.delete("/api/items/:id", deleteItem);

  // ------------------
  // CLAIMS ROUTES
  // ------------------
  // These handle claim submissions and admin approval/rejection
  
  // GET /api/claims - Get all claims (or filter by email with ?email=user@example.com)
  app.get("/api/claims", getClaims);
  
  // POST /api/claims - Submit a new claim for an item
  // Body: {itemId, name, email, message, answers, proofImageUrl}
  app.post("/api/claims", createClaim);
  
  // PATCH /api/claims/:id - Update claim status (approve or reject)
  // Body: {status: "approved" | "rejected"}
  app.patch("/api/claims/:id", updateClaimStatus);
  
  // DELETE /api/claims/:id - Delete a claim
  app.delete("/api/claims/:id", deleteClaim);

  // ------------------
  // UPLOAD ROUTES
  // ------------------
  // These handle image uploads to Cloudinary
  
  // POST /api/upload - Upload an image to Cloudinary
  // Body: {file: "base64_encoded_image_data"}
  // Returns: {url: "cloudinary_image_url", publicId: "cloudinary_id"}
  app.post("/api/upload", handleUpload);
  
  // DELETE /api/upload - Delete an image from Cloudinary
  // Body: {publicId: "cloudinary_id"}
  app.delete("/api/upload", handleDelete);

  // Return the configured Express app
  // This app can now be started with app.listen(port)
  return app;
}
