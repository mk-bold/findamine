import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { followingId: string } }
) {
  try {
    const { followingId } = params;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/player/social/unfollow/${followingId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to unfollow player' },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error unfollowing player:', error);
    return NextResponse.json(
      { error: 'Failed to unfollow player' },
      { status: 500 }
    );
  }
}