import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/player/frenemies`, {
      credentials: 'include',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const frenemies = await response.json();
    return NextResponse.json(frenemies);
  } catch (error) {
    console.error('Error fetching frenemies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch frenemies' },
      { status: 500 }
    );
  }
}