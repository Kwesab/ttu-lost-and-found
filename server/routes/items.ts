import { RequestHandler } from "express";
import { Item, ItemsResponse, ItemResponse } from "@shared/api";
import { query } from "../db";

// Database row interface
interface ItemRow {
  id: string;
  type: "lost" | "found";
  title: string;
  description: string;
  location: string;
  date: string;
  image_url: string;
  image_urls: string[] | null;
  contact_email: string;
  status: "active" | "claimed" | "returned";
  verification_questions: string[];
  created_at: string;
  updated_at: string;
}

// Convert database row to Item interface
function rowToItem(row: ItemRow): Item {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    location: row.location,
    date: row.date,
    imageUrl: row.image_url,
    imageUrls: row.image_urls || undefined,
    contactEmail: row.contact_email,
    status: row.status,
    createdAt: row.created_at,
    verificationQuestions: row.verification_questions,
  };
}

export const getItems: RequestHandler = async (req, res) => {
  try {
    const type = req.query.type as string | undefined;
    
    let sql = "SELECT * FROM items ORDER BY created_at DESC";
    const params: any[] = [];
    
    if (type) {
      sql = "SELECT * FROM items WHERE type = $1 ORDER BY created_at DESC";
      params.push(type);
    }
    
    const result = await query<ItemRow>(sql, params);
    const items = result.rows.map(rowToItem);
    
    const response: ItemsResponse = { items };
    res.json(response);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
};

export const getItemById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query<ItemRow>(
      "SELECT * FROM items WHERE id = $1",
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    const item = rowToItem(result.rows[0]);
    const response: ItemResponse = { item };
    res.json(response);
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({ error: "Failed to fetch item" });
  }
};

export const createItem: RequestHandler = async (req, res) => {
  try {
    const { 
      type, 
      title, 
      description, 
      location, 
      date, 
      imageUrl, 
      imageUrls,
      contactEmail, 
      verificationQuestions 
    } = req.body;
    
    if (!type || !title || !description || !location || !date || !contactEmail) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const result = await query<ItemRow>(
      `INSERT INTO items (
        type, title, description, location, date, 
        image_url, image_urls, contact_email, verification_questions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        type,
        title,
        description,
        location,
        date,
        imageUrl || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop",
        imageUrls || null,
        contactEmail,
        verificationQuestions || ["Question 1?", "Question 2?", "Question 3?"]
      ]
    );
    
    const item = rowToItem(result.rows[0]);
    res.status(201).json({ item });
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ error: "Failed to create item" });
  }
};

export const updateItemStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await query<ItemRow>(
      "UPDATE items SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    const item = rowToItem(result.rows[0]);
    res.json({ item });
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ error: "Failed to update item" });
  }
};

export const deleteItem: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      "DELETE FROM items WHERE id = $1 RETURNING id",
      [id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: "Failed to delete item" });
  }
};
