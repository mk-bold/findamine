import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Call the backend logout endpoint to properly invalidate the session
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Include cookies
    });

    // Create a response that clears the auth_token cookie
    const response = NextResponse.json({ success: true });
    
    // Clear the auth_token cookie by setting it to expire in the past
    response.cookies.set('auth_token', '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Logout failed' },
      { status: 500 }
    );
  }
}
