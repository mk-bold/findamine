import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    
    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'lat and lng parameters are required' }, 
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid latitude or longitude values' }, 
        { status: 400 }
      );
    }

    // Use Google Maps Geocoding API for reverse geocoding
    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!googleMapsApiKey) {
      console.warn('Google Maps API key not found, returning generic address');
      return NextResponse.json({
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        formatted_address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        lat: latitude,
        lng: longitude
      });
    }

    try {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleMapsApiKey}`;
      const response = await fetch(geocodeUrl);
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        return NextResponse.json({
          address: result.formatted_address,
          formatted_address: result.formatted_address,
          lat: latitude,
          lng: longitude,
          components: result.address_components,
          place_id: result.place_id
        });
      } else {
        console.warn('Google Geocoding API returned no results:', data.status);
        return NextResponse.json({
          address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          formatted_address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          lat: latitude,
          lng: longitude
        });
      }
    } catch (error) {
      console.error('Error calling Google Geocoding API:', error);
      return NextResponse.json({
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        formatted_address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        lat: latitude,
        lng: longitude
      });
    }

  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return NextResponse.json(
      { error: 'Failed to reverse geocode coordinates' },
      { status: 500 }
    );
  }
}