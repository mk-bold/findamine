import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const gameId = formData.get('gameId') as string;
    const photos = formData.getAll('photo') as File[];
    const descriptions = formData.getAll('description') as string[];

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      );
    }

    if (!photos || photos.length === 0) {
      return NextResponse.json(
        { error: 'No photos provided' },
        { status: 400 }
      );
    }

    if (photos.length > 3) {
      return NextResponse.json(
        { error: 'Maximum 3 photos allowed' },
        { status: 400 }
      );
    }

    // Upload each photo individually
    const uploadPromises = photos.map(async (photo, index) => {
      const photoFormData = new FormData();
      photoFormData.append('photo', photo);
      photoFormData.append('gameId', gameId);
      photoFormData.append('description', descriptions[index] || '');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/game-photo`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Cookie': request.headers.get('cookie') || '',
        },
        body: photoFormData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Photo upload ${index + 1} failed:`, errorText);
        throw new Error(`Failed to upload photo ${index + 1}: ${response.status}`);
      }

      return response.json();
    });

    const uploadResults = await Promise.all(uploadPromises);

    return NextResponse.json({
      message: 'Photos uploaded successfully',
      photos: uploadResults
    }, { status: 201 });

  } catch (error) {
    console.error('Error uploading photos:', error);
    return NextResponse.json(
      { error: 'Failed to upload photos' },
      { status: 500 }
    );
  }
}
