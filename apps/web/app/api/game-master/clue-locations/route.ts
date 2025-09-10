import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const authToken = request.cookies.get('auth_token')?.value;
    
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius');

    // Build query string
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (lat) queryParams.append('lat', lat);
    if (lng) queryParams.append('lng', lng);
    if (radius) queryParams.append('radius', radius);

    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/game-master/clue-locations?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Cookie': `auth_token=${authToken}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch clue locations' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching clue locations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get the auth token from cookies
    const authToken = request.cookies.get('auth_token')?.value;
    
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/game-master/clue-locations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Cookie': `auth_token=${authToken}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Failed to create clue location' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating clue location:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
