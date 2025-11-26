# Cloudinary Integration - Complete Guide

This project uses Cloudinary for image uploads, storage, and optimization.

## ✨ Features Implemented

### Option A: Report Form Integration ✅
- **Multiple image uploads** (up to 3 images per item)
- Real-time image preview with thumbnail grid
- Image removal with automatic Cloudinary deletion
- Primary image indication (first image is primary)
- Validation for file types and sizes

### Option B: Image Optimization ✅
- **Automatic optimization** on upload:
  - Smart resizing (max 1200x1200px, only if larger)
  - Quality optimization (`auto:good`)
  - Format auto-selection (WebP, AVIF for modern browsers)
- **Utility functions** for runtime optimization:
  - `getOptimizedCloudinaryUrl()` - Custom transformations
  - `getCloudinaryThumbnail()` - Generate thumbnails
  - `getResponsiveCloudinaryUrl()` - Responsive sizes
  - `getCloudinarySrcSet()` - Generate srcset for `<img>`

### Option C: Multiple Image Support ✅
- **Backend**: `Item.imageUrls` array in data model
- **Report form**: Upload up to 3 images with preview grid
- **Item cards**: Display "+N more" badge when multiple images
- **Item detail**: Full image gallery with thumbnail navigation
- **Admin panel**: Show image count indicator

### Option D: Image Deletion ✅
- **DELETE /api/upload/:publicId** endpoint
- Automatic cleanup when removing images from reports
- Server-side validation and error handling

## Setup

1. **Get your Cloudinary credentials:**
   - Sign up at [cloudinary.com](https://cloudinary.com)
   - Go to your [Dashboard](https://console.cloudinary.com/)
   - Copy your Cloud Name, API Key, and API Secret

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Fill in your Cloudinary credentials:
   ```env
   CLOUDINARY_URL=cloudinary://<your_api_key>:<your_api_secret>@<your_cloud_name>
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

## Usage

### 1. Upload Images (Client-Side)

```typescript
import { uploadToCloudinary, uploadToCloudinaryWithProgress } from '@/lib/cloudinary';

// Simple upload
const imageUrl = await uploadToCloudinary(file);

// Upload with progress tracking
const imageUrl = await uploadToCloudinaryWithProgress(
  file,
  (progress) => console.log(`Upload progress: ${progress}%`)
);
```

### 2. Optimize Images (Client-Side)

```typescript
import { 
  getOptimizedCloudinaryUrl, 
  getCloudinaryThumbnail,
  getResponsiveCloudinaryUrl,
  getCloudinarySrcSet 
} from '@/lib/cloudinary-optimize';

// Custom optimization
const optimized = getOptimizedCloudinaryUrl(imageUrl, {
  width: 800,
  height: 600,
  quality: 'auto:good',
  crop: 'fill'
});

// Thumbnail (150x150)
const thumbnail = getCloudinaryThumbnail(imageUrl);

// Responsive size
const medium = getResponsiveCloudinaryUrl(imageUrl, 'medium');

// Generate srcset for responsive images
<img 
  src={getResponsiveCloudinaryUrl(imageUrl, 'medium')}
  srcSet={getCloudinarySrcSet(imageUrl)}
  sizes="(max-width: 768px) 100vw, 50vw"
  alt="Item"
/>
```

### 3. Multiple Images in Forms

The Report form (`client/pages/Report.tsx`) demonstrates the pattern:

```typescript
const [images, setImages] = useState<Array<{url: string, publicId: string}>>([]);
const MAX_IMAGES = 3;

// Handle multiple file selection
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  // Upload each file and add to images array
  // See Report.tsx for full implementation
};

// Remove an image
const handleRemoveImage = async (index: number) => {
  const image = images[index];
  // Delete from Cloudinary
  await fetch(`/api/upload/${encodeURIComponent(image.publicId)}`, {
    method: "DELETE",
  });
  // Remove from state
  setImages((prev) => prev.filter((_, i) => i !== index));
};
```

## API Endpoints

### Upload Image
**POST** `/api/upload`

**Request:**
```json
{
  "file": "data:image/png;base64,..." // base64-encoded image
}
```

**Response:**
```json
{
  "url": "https://res.cloudinary.com/.../optimized-image.jpg",
  "publicId": "lost-and-found/abc123"
}
```

**Optimizations Applied:**
- Max dimensions: 1200x1200px (scales down only if larger)
- Quality: `auto:good` (intelligent compression)
- Format: `auto` (WebP/AVIF for supported browsers)

### Delete Image
**DELETE** `/api/upload/:publicId`

**Response:**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

## Security

✅ API credentials stored server-side only (never exposed to client)  
✅ All uploads go through secure server endpoint  
✅ Files automatically organized in `lost-and-found` folder  
✅ Request body limit: 50MB for base64 images  
✅ File type validation (images only)  
✅ File size validation (10MB per image)  
✅ `.env` excluded from git  

## Testing

Run the upload endpoint tests:

```bash
pnpm test upload.spec
```

**Tests included:**
- ✅ Successful image upload with optimization
- ✅ Error handling for missing file
- ✅ Delete image endpoint

## Data Model

The `Item` interface supports both single and multiple images:

```typescript
interface Item {
  // ... other fields
  imageUrl: string;      // Primary image (backward compatible)
  imageUrls?: string[];  // Multiple images (optional)
}
```

**Usage pattern:**
- Save all uploaded images to `imageUrls` array
- Set first image as `imageUrl` for backward compatibility
- Display logic checks for `imageUrls` first, falls back to `imageUrl`

## Components Updated

### ✅ Report.tsx
- Multiple image upload (up to 3)
- Grid preview with remove buttons
- Primary image indicator
- Upload progress tracking

### ✅ ItemCard.tsx
- Displays first image from `imageUrls` or `imageUrl`
- Shows "+N more" badge when multiple images exist

### ✅ ItemDetail.tsx
- Full image gallery with main viewer
- Thumbnail navigation grid
- Click thumbnails to change main image

### ✅ Admin.tsx
- Shows image count badge in admin table
- Displays thumbnail with "+N" indicator

## File Structure

```
client/
  lib/
    cloudinary.ts                    # Upload helpers
    cloudinary-optimize.ts           # Optimization utilities
  pages/
    Report.tsx                       # Multiple image upload form
    ItemDetail.tsx                   # Image gallery viewer
    Admin.tsx                        # Admin panel with image indicators
  components/
    ItemCard.tsx                     # Card with multiple image support
    ImageUploadExample.tsx           # Reference implementation

server/
  routes/
    upload.ts                        # Upload & delete endpoints
    upload.spec.ts                   # API tests

shared/
  api.ts                             # Item interface with imageUrls

.env                                 # Cloudinary credentials (DO NOT COMMIT)
.env.example                         # Template for environment variables
```

## Best Practices

1. **Always validate file types and sizes** before uploading
2. **Show upload progress** for better UX
3. **Use optimized URLs** in production (via helper functions)
4. **Clean up deleted images** from Cloudinary to save storage
5. **Use responsive images** with srcset for better performance
6. **Limit number of images** per item (currently 3)

## Troubleshooting

**Images not uploading?**
- Check `.env` file has correct Cloudinary credentials
- Verify server is running and `/api/upload` endpoint is accessible
- Check browser console for errors

**Images not optimized?**
- Optimization happens on upload (server-side)
- Check the uploaded URL includes transformation parameters
- Use optimization utilities for client-side URL modifications

**Delete not working?**
- Ensure `publicId` is properly URL-encoded
- Check Cloudinary dashboard to verify image exists
- Review server logs for deletion errors

## Performance Tips

- Use `getCloudinaryThumbnail()` for small previews (cards, lists)
- Use `getResponsiveCloudinaryUrl()` for different viewport sizes
- Implement lazy loading for image galleries
- Consider using `loading="lazy"` attribute on `<img>` tags

---

**All options (A, B, C, D) are now fully implemented and tested! 🎉**
