import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/player/minions`, {
      credentials: 'include',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const minions = await response.json();
    return NextResponse.json(minions);
  } catch (error) {
    console.error('Error fetching minions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch minions' },
      { status: 500 }
    );
  }
}