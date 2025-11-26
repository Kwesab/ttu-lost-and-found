import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Upload, X, Loader2 } from "lucide-react";
import { uploadToCloudinaryWithProgress } from "@/lib/cloudinary";

interface ImageUpload {
  url: string;
  publicId: string;
  preview: string;
}

export default function Report() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = (searchParams.get("type") as "lost" | "found") || "lost";
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [images, setImages] = useState<ImageUpload[]>([]);
  const MAX_IMAGES = 3;
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    contactEmail: "",
    question1: "",
    question2: "",
    question3: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (images.length + files.length > MAX_IMAGES) {
      setError(`You can only upload up to ${MAX_IMAGES} images`);
      return;
    }

    // Validate file types and sizes
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setError("Please select only image files");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("Each image must be less than 10MB");
        return;
      }
    }

    setUploading(true);
    setError("");

    try {
      for (const file of files) {
        // Create preview
        const preview = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        // Upload to Cloudinary
        setUploadProgress(0);
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: preview }),
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        setImages((prev) => [
          ...prev,
          { url: data.url, publicId: data.publicId, preview },
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset the input
      e.target.value = "";
    }
  };

  const handleRemoveImage = async (index: number) => {
    const image = images[index];
    
    try {
      // Delete from Cloudinary
      const publicId = encodeURIComponent(image.publicId);
      await fetch(`/api/upload/${publicId}`, {
        method: "DELETE",
      });

      // Remove from state
      setImages((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error("Failed to delete image:", err);
      // Remove from state anyway
      setImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Ensure at least one image is uploaded
    if (images.length === 0) {
      setError("Please upload at least one image");
      setLoading(false);
      return;
    }

    try {
      const imageUrls = images.map((img) => img.url);
      
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: formData.title,
          description: formData.description,
          location: formData.location,
          date: formData.date,
          contactEmail: formData.contactEmail,
          imageUrl: imageUrls[0], // Primary image for backward compatibility
          imageUrls: imageUrls, // All images
          verificationQuestions: [
            formData.question1,
            formData.question2,
            formData.question3
          ]
        })
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      navigate(type === "lost" ? "/lost" : "/found");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const title = type === "lost" ? "Report a Lost Item" : "Report a Found Item";
  const description = type === "lost"
    ? "Help the community find your lost item by providing detailed information"
    : "Help reunite a lost item with its owner by reporting what you found";
  const bgColor = type === "lost" ? "from-red-50 to-red-100" : "from-green-50 to-green-100";
  const borderColor = type === "lost" ? "border-red-200" : "border-green-200";
  const gradientColor = type === "lost" ? "from-red-500 to-red-600" : "from-green-500 to-green-600";
  const accentColor = type === "lost" ? "red" : "green";

  return (
    <Layout>
      <div className={`bg-gradient-to-br ${bgColor} min-h-screen py-12`}>
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden">
            {/* Header */}
            <div className={`bg-gradient-to-r ${gradientColor} p-8 text-white`}>
              <div className="inline-block mb-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                <p className="text-xs font-semibold uppercase tracking-wider">{type === "lost" ? "❌ Lost" : "✓ Found"}</p>
              </div>
              <h1 className="text-4xl font-bold mb-2">{title}</h1>
              <p className="text-white/90 text-lg">{description}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="text-red-600 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900">
                  Item Images * ({images.length}/{MAX_IMAGES})
                </label>
                
                {/* Image Grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 group"
                      >
                        <img
                          src={image.url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {index === 0 && (
                          <div className="absolute top-1 left-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded">
                            Primary
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                {images.length < MAX_IMAGES && (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className={`flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                        uploading
                          ? "border-blue-300 bg-blue-50 opacity-50"
                          : "border-slate-300 bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploading ? (
                          <>
                            <Loader2 className="w-8 h-8 text-blue-600 mb-2 animate-spin" />
                            <p className="text-sm text-blue-600 font-semibold">Uploading...</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-slate-400 mb-2" />
                            <p className="text-sm text-slate-600">Click to upload images</p>
                            <p className="text-xs text-slate-500 mt-1">
                              Up to {MAX_IMAGES} images, optimized automatically
                            </p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                )}
              </div>

              {/* Item Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900">Item Name *</label>
                <Input
                  type="text"
                  name="title"
                  placeholder="e.g., Blue Backpack"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900">Description *</label>
                <Textarea
                  name="description"
                  placeholder="Provide details about the item..."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900">Location *</label>
                <Input
                  type="text"
                  name="location"
                  placeholder="Where did you lose/find it?"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900">Date *</label>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              {/* Contact Email */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900">Contact Email *</label>
                <Input
                  type="email"
                  name="contactEmail"
                  placeholder="your.email@stu.edu.gh"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              {/* Verification Questions */}
              <div className="pt-4 border-t border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Verification Questions *</h3>
                <p className="text-sm text-slate-600 mb-4">
                  These questions help verify the rightful owner when someone claims the item
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-900">Question 1</label>
                    <Input
                      type="text"
                      name="question1"
                      placeholder="e.g., What brand is the item?"
                      value={formData.question1}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-900">Question 2</label>
                    <Input
                      type="text"
                      name="question2"
                      placeholder="e.g., What color is it?"
                      value={formData.question2}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-900">Question 3</label>
                    <Input
                      type="text"
                      name="question3"
                      placeholder="e.g., What unique features does it have?"
                      value={formData.question3}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  {loading ? "Creating..." : "Create Report"}
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate("/")}
                  variant="outline"
                  className="flex-1 py-3"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
