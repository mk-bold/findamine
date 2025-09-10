import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    gameId: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { gameId } = params;
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/player/games/${gameId}/join`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to join game' }));
      return NextResponse.json(
        { error: errorData.message || 'Failed to join game' },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error joining game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}