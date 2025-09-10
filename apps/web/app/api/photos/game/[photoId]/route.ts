import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { photoId: string } }
) {
  try {
    const { photoId } = params;
    
    // Get the API URL from environment variables
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    
    console.log(`[Photo Delete] Deleting photo ${photoId} from ${apiUrl}/photos/game/${photoId}`);
    
    // Extract the auth_token cookie specifically
    const cookies = request.headers.get('cookie') || '';
    const authTokenMatch = cookies.match(/auth_token=([^;]+)/);
    const authToken = authTokenMatch ? authTokenMatch[1] : '';
    
    console.log(`[Photo Delete] Auth token found: ${authToken ? 'Yes' : 'No'}`);
    
    // Forward the request to the backend API with proper authentication
    const response = await fetch(`${apiUrl}/photos/game/${photoId}`, {
      method: 'DELETE',
      headers: {
        'Cookie': `auth_token=${authToken}`,
      },
    });

    console.log(`[Photo Delete] Backend response status: ${response.status}`);
    if (!response.ok) {
      const errorData = await response.json();
      console.log(`[Photo Delete] Backend error:`, errorData);
      return NextResponse.json(
        { message: errorData.message || 'Failed to delete photo' },
        { status: response.status }
      );
    }

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || 'Failed to delete photo' },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { photoId: string } }
) {
  try {
    const { photoId } = params;
    const body = await request.json();
    
    // Get the API URL from environment variables
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    
    // Extract the auth_token cookie specifically
    const cookies = request.headers.get('cookie') || '';
    const authTokenMatch = cookies.match(/auth_token=([^;]+)/);
    const authToken = authTokenMatch ? authTokenMatch[1] : '';
    
    // Forward the request to the backend API with proper authentication
    const response = await fetch(`${apiUrl}/photos/game/${photoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth_token=${authToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || 'Failed to update photo' },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: 'Photo updated successfully' });
  } catch (error) {
    console.error('Error updating photo:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
