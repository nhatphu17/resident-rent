import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir = path.join(process.cwd(), 'public', 'uploads');
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  constructor() {
    // Ensure upload directory exists
    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory() {
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Save a base64 image to file and return URL
   * @param base64String - Base64 encoded image string (with or without data:image prefix)
   * @param folder - Subfolder name (e.g., 'qr-codes', 'rooms')
   * @returns URL path to the saved file
   */
  async saveBase64Image(base64String: string, folder: string = 'rooms'): Promise<string> {
    try {
      // Remove data:image prefix if present
      const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
      
      // Determine file extension from base64 string or default to jpg
      const matches = base64String.match(/^data:image\/(\w+);base64,/);
      const extension = matches ? matches[1] : 'jpg';
      
      // Validate extension
      if (!['jpeg', 'jpg', 'png', 'webp'].includes(extension.toLowerCase())) {
        throw new BadRequestException('Invalid image format. Only JPEG, PNG, and WebP are allowed.');
      }

      // Generate unique filename
      const filename = `${randomUUID()}.${extension}`;
      const folderPath = path.join(this.uploadDir, folder);
      
      // Ensure folder exists
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      const filePath = path.join(folderPath, filename);
      const buffer = Buffer.from(base64Data, 'base64');

      // Check file size
      if (buffer.length > this.maxFileSize) {
        throw new BadRequestException(`File size exceeds ${this.maxFileSize / 1024 / 1024}MB limit`);
      }

      // Write file
      fs.writeFileSync(filePath, buffer);

      // Return URL path (relative to public folder)
      const url = `/uploads/${folder}/${filename}`;
      this.logger.log(`Saved image to: ${url}`);
      return url;
    } catch (error) {
      this.logger.error(`Error saving base64 image:`, error);
      throw error;
    }
  }

  /**
   * Save multiple base64 images
   * @param base64Strings - Array of base64 encoded image strings
   * @param folder - Subfolder name
   * @returns Array of URL paths
   */
  async saveMultipleBase64Images(base64Strings: string[], folder: string = 'rooms'): Promise<string[]> {
    const urls: string[] = [];
    
    for (const base64String of base64Strings) {
      try {
        const url = await this.saveBase64Image(base64String, folder);
        urls.push(url);
      } catch (error) {
        this.logger.error(`Error saving one of the images:`, error);
        // Continue with other images even if one fails
      }
    }

    return urls;
  }

  /**
   * Delete a file by URL
   * @param url - URL path to the file (e.g., /uploads/rooms/filename.jpg)
   */
  async deleteFile(url: string): Promise<void> {
    try {
      // Remove leading slash and convert to file path
      const filePath = path.join(process.cwd(), 'public', url);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`Deleted file: ${url}`);
      } else {
        this.logger.warn(`File not found: ${url}`);
      }
    } catch (error) {
      this.logger.error(`Error deleting file ${url}:`, error);
      // Don't throw error, just log it
    }
  }

  /**
   * Delete multiple files
   * @param urls - Array of URL paths
   */
  async deleteMultipleFiles(urls: string[]): Promise<void> {
    for (const url of urls) {
      await this.deleteFile(url);
    }
  }

  /**
   * Parse JSON array of images (can be URLs or base64)
   * @param imagesJson - JSON string of image array
   * @returns Array of image strings (URLs or base64)
   */
  parseImagesJson(imagesJson?: string): string[] {
    if (!imagesJson) return [];
    
    try {
      const parsed = JSON.parse(imagesJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * Check if a string is a base64 image
   * @param str - String to check
   * @returns true if it's a base64 image
   */
  isBase64Image(str: string): boolean {
    return str.startsWith('data:image/') || (!str.startsWith('http') && !str.startsWith('/'));
  }
}

