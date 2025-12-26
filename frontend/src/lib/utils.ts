import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get image URL - handles both base64 and file URLs
 * @param image - Base64 string or URL path
 * @returns Full URL to the image
 */
export function getImageUrl(image?: string | null): string {
  if (!image) return '';
  
  // If it's a base64 image, return as is
  if (image.startsWith('data:image/')) {
    return image;
  }
  
  // If it's already a full URL (http/https), return as is
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  
  // If it's a relative URL (starts with /), prepend API URL
  if (image.startsWith('/')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${apiUrl}${image}`;
  }
  
  // Otherwise, assume it's a relative path and prepend API URL with /
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return `${apiUrl}/${image}`;
}


