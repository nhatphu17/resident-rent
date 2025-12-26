import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly nominatimUrl = 'https://nominatim.openstreetmap.org/search';

  /**
   * Geocode an address to get latitude and longitude
   * @param address - Full address string (e.g., "Xã ABC, Tỉnh XYZ, Vietnam")
   * @returns Promise with { latitude, longitude } or null if not found
   */
  async geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
    if (!address || address.trim().length === 0) {
      return null;
    }

    try {
      // Add "Vietnam" to improve accuracy for Vietnamese addresses
      const searchQuery = `${address}, Vietnam`;
      
      // Use Nominatim API (OpenStreetMap) - free, no API key required
      const url = new URL(this.nominatimUrl);
      url.searchParams.set('q', searchQuery);
      url.searchParams.set('format', 'json');
      url.searchParams.set('limit', '1');
      url.searchParams.set('addressdetails', '1');

      // Add User-Agent header (required by Nominatim)
      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'ResidentRentApp/1.0 (contact@example.com)', // Replace with your app name/email
        },
      });

      if (!response.ok) {
        this.logger.warn(`Geocoding API returned status ${response.status}`);
        return null;
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        this.logger.warn(`No results found for address: ${address}`);
        return null;
      }

      const result = data[0];
      const latitude = parseFloat(result.lat);
      const longitude = parseFloat(result.lon);

      if (isNaN(latitude) || isNaN(longitude)) {
        this.logger.warn(`Invalid coordinates returned for address: ${address}`);
        return null;
      }

      this.logger.log(`Successfully geocoded address: ${address} -> (${latitude}, ${longitude})`);
      return { latitude, longitude };
    } catch (error) {
      this.logger.error(`Error geocoding address "${address}":`, error);
      return null;
    }
  }

  /**
   * Build address string from ward and province
   * @param ward - Ward/Xã/Phường
   * @param province - Province/Tỉnh/Thành phố
   * @returns Formatted address string
   */
  buildAddressString(ward?: string, province?: string): string {
    const parts: string[] = [];
    
    if (ward) {
      parts.push(ward);
    }
    
    if (province) {
      parts.push(province);
    }

    return parts.join(', ');
  }

  /**
   * Geocode room address from ward and province
   * @param ward - Ward/Xã/Phường
   * @param province - Province/Tỉnh/Thành phố
   * @returns Promise with { latitude, longitude } or null
   */
  async geocodeRoomAddress(ward?: string, province?: string): Promise<{ latitude: number; longitude: number } | null> {
    const address = this.buildAddressString(ward, province);
    
    if (!address) {
      return null;
    }

    return this.geocodeAddress(address);
  }
}

