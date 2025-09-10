import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Construct query parameters
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      params.append(key, value);
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/player/search?${params}`, {
      credentials: 'include',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const players = await response.json();
    return NextResponse.json(players);
  } catch (error) {
    console.error('Error searching players:', error);
    return NextResponse.json(
      { error: 'Failed to search players' },
      { status: 500 }
    );
  }
}