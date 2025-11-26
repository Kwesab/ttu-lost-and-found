import { RequestHandler } from "express";
import { v2 as cloudinary } from "cloudinary";
import { UploadResponse } from "@shared/api";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const handleUpload: RequestHandler = async (req, res) => {
  try {
    const { file } = req.body;

    if (!file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }

    // Upload to Cloudinary with optimizations
    const result = await cloudinary.uploader.upload(file, {
      folder: "lost-and-found",
      resource_type: "auto",
      // Image optimization settings
      transformation: [
        {
          width: 1200,
          height: 1200,
          crop: "limit", // Only resize if larger
          quality: "auto:good", // Automatic quality optimization
          fetch_format: "auto", // Automatic format selection (WebP, AVIF)
        },
      ],
    });

    const response: UploadResponse = {
      url: result.secure_url,
      publicId: result.public_id,
    };

    res.json(response);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
};

export const handleDelete: RequestHandler = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      res.status(400).json({ error: "No public ID provided" });
      return;
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      res.json({ success: true, message: "Image deleted successfully" });
    } else {
      res.status(404).json({ error: "Image not found" });
    }
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete image" });
  }
};
