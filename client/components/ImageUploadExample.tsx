/**
 * Example component showing how to use Cloudinary image upload
 * 
 * This is a reference implementation - you can copy this pattern
 * into your actual forms (Report.tsx, etc.)
 */

import { useState } from "react";
import { uploadToCloudinary, uploadToCloudinaryWithProgress } from "@/lib/cloudinary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export function ImageUploadExample() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
      setError("");
      setUploadProgress(0);
      setUploadedUrl("");
    }
  };

  const handleUploadSimple = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError("");

    try {
      const url = await uploadToCloudinary(selectedFile);
      setUploadedUrl(url);
      console.log("Upload successful:", url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadWithProgress = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError("");
    setUploadProgress(0);

    try {
      const url = await uploadToCloudinaryWithProgress(
        selectedFile,
        (progress) => setUploadProgress(progress)
      );
      setUploadedUrl(url);
      console.log("Upload successful:", url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold">Image Upload Example</h2>

      <div>
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>

      {selectedFile && (
        <div className="text-sm text-muted-foreground">
          Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleUploadSimple}
          disabled={!selectedFile || isUploading}
        >
          Upload (Simple)
        </Button>
        <Button
          onClick={handleUploadWithProgress}
          disabled={!selectedFile || isUploading}
          variant="outline"
        >
          Upload (With Progress)
        </Button>
      </div>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="space-y-2">
          <Progress value={uploadProgress} />
          <p className="text-sm text-center">{uploadProgress}%</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      {uploadedUrl && (
        <div className="space-y-2">
          <div className="p-3 bg-green-50 text-green-800 rounded-md text-sm">
            Upload successful!
          </div>
          <img
            src={uploadedUrl}
            alt="Uploaded"
            className="w-full rounded-md border"
          />
          <div className="text-xs break-all text-muted-foreground">
            URL: {uploadedUrl}
          </div>
        </div>
      )}
    </div>
  );
}
