import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/player/games/available`, {
      credentials: 'include',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const games = await response.json();
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching available games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available games' },
      { status: 500 }
    );
  }
}