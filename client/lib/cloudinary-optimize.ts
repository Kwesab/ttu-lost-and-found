/**
 * Cloudinary Image Optimization Utilities
 * 
 * Helper functions to generate optimized Cloudinary URLs with transformations
 */

/**
 * Get an optimized Cloudinary URL with specified transformations
 * @param url - Original Cloudinary URL
 * @param options - Transformation options
 */
export function getOptimizedCloudinaryUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: "auto" | "auto:good" | "auto:best" | "auto:eco" | "auto:low";
    format?: "auto" | "webp" | "avif" | "jpg" | "png";
    crop?: "fill" | "limit" | "scale" | "fit" | "pad";
  } = {}
): string {
  if (!url || !url.includes("cloudinary.com")) {
    return url;
  }

  const {
    width,
    height,
    quality = "auto:good",
    format = "auto",
    crop = "limit",
  } = options;

  // Build transformation string
  const transformations: string[] = [];

  if (width || height) {
    const dimensions = [
      width ? `w_${width}` : "",
      height ? `h_${height}` : "",
      `c_${crop}`,
    ]
      .filter(Boolean)
      .join(",");
    transformations.push(dimensions);
  }

  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);

  const transformation = transformations.join(",");

  // Insert transformation into URL
  // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformation}/{public_id}
  const parts = url.split("/upload/");
  if (parts.length === 2) {
    return `${parts[0]}/upload/${transformation}/${parts[1]}`;
  }

  return url;
}

/**
 * Generate a thumbnail URL from a Cloudinary image
 * @param url - Original Cloudinary URL
 * @param size - Thumbnail size (default: 150px)
 */
export function getCloudinaryThumbnail(url: string, size: number = 150): string {
  return getOptimizedCloudinaryUrl(url, {
    width: size,
    height: size,
    crop: "fill",
    quality: "auto:good",
  });
}

/**
 * Generate a responsive image URL for different screen sizes
 * @param url - Original Cloudinary URL
 * @param size - 'small' | 'medium' | 'large' | 'full'
 */
export function getResponsiveCloudinaryUrl(
  url: string,
  size: "small" | "medium" | "large" | "full" = "medium"
): string {
  const sizeMap = {
    small: { width: 400 },
    medium: { width: 800 },
    large: { width: 1200 },
    full: { width: 1920 },
  };

  return getOptimizedCloudinaryUrl(url, {
    ...sizeMap[size],
    quality: "auto:good",
  });
}

/**
 * Generate srcset string for responsive images
 * @param url - Original Cloudinary URL
 */
export function getCloudinarySrcSet(url: string): string {
  const sizes = [400, 800, 1200, 1920];
  return sizes
    .map((width) => {
      const optimizedUrl = getOptimizedCloudinaryUrl(url, { width });
      return `${optimizedUrl} ${width}w`;
    })
    .join(", ");
}
