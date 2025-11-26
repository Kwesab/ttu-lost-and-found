/**
 * Cloudinary Configuration
 */
export const CLOUDINARY_CONFIG = {
  cloudName: "dsb10bj2r",
};

/**
 * Convert file to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Upload image to Cloudinary via server endpoint
 * @param file - Image file to upload
 * @param folder - Optional folder path in Cloudinary (unused, kept for API compatibility)
 * @returns Promise with image URL
 */
export async function uploadToCloudinary(
  file: File,
  folder: string = "lost-and-found"
): Promise<string> {
  try {
    // Convert file to base64
    const base64File = await fileToBase64(file);

    // Send to server endpoint
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file: base64File }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to upload image");
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Image upload failed. Please try again.");
  }
}

/**
 * Upload image with loading state (for UI components)
 * @param file - Image file to upload
 * @param onProgress - Callback for progress updates
 * @param folder - Optional folder path (unused, kept for API compatibility)
 * @returns Promise with image URL
 */
export async function uploadToCloudinaryWithProgress(
  file: File,
  onProgress?: (progress: number) => void,
  folder: string = "lost-and-found"
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // Convert file to base64
      const base64File = await fileToBase64(file);

      const xhr = new XMLHttpRequest();

      // Progress tracking
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          resolve(data.url);
        } else {
          reject(new Error("Failed to upload image"));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload error occurred"));
      });

      xhr.open("POST", "/api/upload");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(JSON.stringify({ file: base64File }));
    } catch (error) {
      reject(error);
    }
  });
}
