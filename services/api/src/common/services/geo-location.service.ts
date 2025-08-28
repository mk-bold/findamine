import { Injectable } from '@nestjs/common';

interface AgeRequirement {
  country: string;
  state?: string;
  minAge: number;
}

@Injectable()
export class GeoLocationService {
  private readonly ageRequirements: AgeRequirement[] = [
    // Austria
    { country: 'AT', minAge: 14 },
    // Bulgaria
    { country: 'BG', minAge: 14 },
    // Germany
    { country: 'DE', minAge: 16 },
    // Hungary
    { country: 'HU', minAge: 16 },
    // Lithuania
    { country: 'LT', minAge: 16 },
    // Luxembourg
    { country: 'LU', minAge: 16 },
    // Slovakia
    { country: 'SK', minAge: 16 },
    // Netherlands
    { country: 'NL', minAge: 16 },
    // France
    { country: 'FR', minAge: 15 },
    // Italy
    { country: 'IT', minAge: 14 },
    // Australia
    { country: 'AU', minAge: 16 },
    // Norway
    { country: 'NO', minAge: 15 },
    // US States
    { country: 'US', state: 'GA', minAge: 16 }, // Georgia
    { country: 'US', state: 'FL', minAge: 16 }, // Florida
    { country: 'US', state: 'TX', minAge: 18 }, // Texas
    { country: 'US', state: 'LA', minAge: 18 }, // Louisiana
    { country: 'US', state: 'NV', minAge: 17 }, // Nevada
  ];

  /**
   * Get the minimum age requirement for a given country and state
   */
  getMinAgeRequirement(country: string, state?: string): number {
    // First try to find exact match with state
    if (state) {
      const stateMatch = this.ageRequirements.find(
        req => req.country === country && req.state === state
      );
      if (stateMatch) {
        return stateMatch.minAge;
      }
    }

    // Then try to find country match without state
    const countryMatch = this.ageRequirements.find(
      req => req.country === country && !req.state
    );
    if (countryMatch) {
      return countryMatch.minAge;
    }

    // Default to 13 for all other locations
    return 13;
  }

  /**
   * Check if a user is old enough based on their birthdate and location
   */
  isUserOldEnough(birthDate: Date, country: string, state?: string): boolean {
    const minAge = this.getMinAgeRequirement(country, state);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= minAge;
    }
    
    return age >= minAge;
  }

  /**
   * Get location information from IP address
   * Note: This is a simplified implementation. In production, you'd use a service like:
   * - MaxMind GeoIP2
   * - IP2Location
   * - ipapi.co
   */
  async getLocationFromIP(ip: string): Promise<{ country: string; state?: string }> {
    // For development/testing, return a default location
    // In production, this would call an external IP geolocation service
    if (process.env.NODE_ENV === 'development') {
      return { country: 'US', state: 'CA' };
    }

    try {
      // Example using ipapi.co (free tier available)
      const response = await fetch(`http://ip-api.com/json/${ip}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        return {
          country: data.countryCode,
          state: data.regionCode || undefined
        };
      }
    } catch (error) {
      console.error('Failed to get location from IP:', error);
    }

    // Fallback to default
    return { country: 'US', state: 'CA' };
  }

  /**
   * Get formatted location string for display
   */
  getLocationDisplay(country: string, state?: string): string {
    if (state && country === 'US') {
      return `${state}, United States`;
    }
    return country;
  }

  /**
   * Get age requirement display text
   */
  getAgeRequirementText(country: string, state?: string): string {
    const minAge = this.getMinAgeRequirement(country, state);
    const location = this.getLocationDisplay(country, state);
    
    if (minAge === 13) {
      return `You must be at least 13 years old to use Findamine in ${location}.`;
    } else {
      return `You must be at least ${minAge} years old to use Findamine in ${location}.`;
    }
  }
}
