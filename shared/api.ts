/**
 * Shared code between client and server
 */

export interface Item {
  id: string;
  type: 'lost' | 'found';
  title: string;
  description: string;
  location: string;
  date: string;
  imageUrl: string; // Primary image (for backward compatibility)
  imageUrls?: string[]; // Multiple images support
  contactEmail: string;
  status: 'active' | 'claimed' | 'returned';
  createdAt: string;
  verificationQuestions: string[];
}

export interface Claim {
  id: string;
  itemId: string;
  name: string;
  email: string;
  message: string;
  answers: [string, string, string];
  proofImageUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface ItemsResponse {
  items: Item[];
}

export interface ItemResponse {
  item: Item;
}

export interface ClaimsResponse {
  claims: Claim[];
}

export interface DemoResponse {
  message: string;
}

export interface UploadResponse {
  url: string;
  publicId: string;
}
