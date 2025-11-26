import { RequestHandler } from "express";
import { Claim, ClaimsResponse } from "@shared/api";
import { query } from "../db";

// Database row interface
interface ClaimRow {
  id: string;
  item_id: string;
  name: string;
  email: string;
  message: string;
  answers: string[];
  proof_image_url: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

// Convert database row to Claim interface
function rowToClaim(row: ClaimRow): Claim {
  return {
    id: row.id,
    itemId: row.item_id,
    name: row.name,
    email: row.email,
    message: row.message,
    answers: row.answers as [string, string, string],
    proofImageUrl: row.proof_image_url || undefined,
    status: row.status,
    createdAt: row.created_at,
  };
}

export const getClaims: RequestHandler = async (req, res) => {
  try {
    const itemId = req.query.itemId as string | undefined;
    
    let sql = "SELECT * FROM claims ORDER BY created_at DESC";
    const params: any[] = [];
    
    if (itemId) {
      sql = "SELECT * FROM claims WHERE item_id = $1 ORDER BY created_at DESC";
      params.push(itemId);
    }
    
    const result = await query<ClaimRow>(sql, params);
    const claims = result.rows.map(rowToClaim);
    
    const response: ClaimsResponse = { claims };
    res.json(response);
  } catch (error) {
    console.error("Error fetching claims:", error);
    res.status(500).json({ error: "Failed to fetch claims" });
  }
};

export const createClaim: RequestHandler = async (req, res) => {
  try {
    const { itemId, name, email, message, answers, proofImageUrl } = req.body;
    
    if (!itemId || !name || !email || !message || !answers || answers.length !== 3) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const result = await query<ClaimRow>(
      `INSERT INTO claims (
        item_id, name, email, message, answers, proof_image_url
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [itemId, name, email, message, answers, proofImageUrl || null]
    );
    
    const claim = rowToClaim(result.rows[0]);
    
    // TODO: Send email to item owner
    console.log(`Claim created for item ${itemId}. Owner should be notified.`);
    
    res.status(201).json({ claim });
  } catch (error) {
    console.error("Error creating claim:", error);
    res.status(500).json({ error: "Failed to create claim" });
  }
};

export const updateClaimStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await query<ClaimRow>(
      "UPDATE claims SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Claim not found" });
    }
    
    const claim = rowToClaim(result.rows[0]);
    res.json({ claim });
  } catch (error) {
    console.error("Error updating claim:", error);
    res.status(500).json({ error: "Failed to update claim" });
  }
};

export const deleteClaim: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      "DELETE FROM claims WHERE id = $1 RETURNING id",
      [id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Claim not found" });
    }
    
    res.json({ message: "Claim deleted successfully" });
  } catch (error) {
    console.error("Error deleting claim:", error);
    res.status(500).json({ error: "Failed to delete claim" });
  }
};
