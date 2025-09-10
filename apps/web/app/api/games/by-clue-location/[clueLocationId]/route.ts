import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { clueLocationId: string } }
) {
  try {
    const { clueLocationId } = params;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'}/game-master/clue-locations/${clueLocationId}/game-count`,
      {
        credentials: 'include',
        headers: {
          'Cookie': request.headers.get('cookie') || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const gameCount = await response.json();
    return NextResponse.json(gameCount);
  } catch (error) {
    console.error('Error fetching clue location game count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clue location game count' },
      { status: 500 }
    );
  }
}