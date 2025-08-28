import { NextRequest, NextResponse } from 'next/server';

// Age requirements by country and state
const ageRequirements = [
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

function getMinAgeRequirement(country: string, state?: string): number {
  // First try to find exact match with state
  if (state) {
    const stateMatch = ageRequirements.find(
      req => req.country === country && req.state === state
    );
    if (stateMatch) {
      return stateMatch.minAge;
    }
  }

  // Then try to find country match without state
  const countryMatch = ageRequirements.find(
    req => req.country === country && !req.state
  );
  if (countryMatch) {
    return countryMatch.minAge;
  }

  // Default to 13 for all other locations
  return 13;
}

function getLocationDisplay(country: string, state?: string): string {
  if (state && country === 'US') {
    return `${state}, United States`;
  }
  return country;
}

export async function GET(request: NextRequest) {
  try {
    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || '127.0.0.1';

    // For development, return a default location
    if (process.env.NODE_ENV === 'development') {
      const country = 'US';
      const state = 'CA';
      const minAge = getMinAgeRequirement(country, state);
      const locationDisplay = getLocationDisplay(country, state);

      return NextResponse.json({
        country,
        state,
        minAge,
        locationDisplay,
        ip: ip
      });
    }

    // In production, you would call an external IP geolocation service
    // For now, we'll use a simple approach with ipapi.co
    try {
      const response = await fetch(`http://ip-api.com/json/${ip}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        const country = data.countryCode;
        const state = data.regionCode || undefined;
        const minAge = getMinAgeRequirement(country, state);
        const locationDisplay = getLocationDisplay(country, state);

        return NextResponse.json({
          country,
          state,
          minAge,
          locationDisplay,
          ip: ip
        });
      }
    } catch (error) {
      console.error('Failed to get location from IP:', error);
    }

    // Fallback to default location
    const country = 'US';
    const state = 'CA';
    const minAge = getMinAgeRequirement(country, state);
    const locationDisplay = getLocationDisplay(country, state);

    return NextResponse.json({
      country,
      state,
      minAge,
      locationDisplay,
      ip: ip
    });

  } catch (error) {
    console.error('Geo-location error:', error);
    return NextResponse.json(
      { error: 'Failed to determine location' },
      { status: 500 }
    );
  }
}
