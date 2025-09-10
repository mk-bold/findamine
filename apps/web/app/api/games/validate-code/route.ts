import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameCode, excludeGameId } = body;

    // Use the backend validate-code endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/game-master/games/validate-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify({ gameCode, excludeGameId }),
    });

    if (!response.ok) {
      return NextResponse.json({ isAvailable: false }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error validating game code:', error);
    return NextResponse.json(
      { error: 'Failed to validate game code', isAvailable: false },
      { status: 500 }
    );
  }
}