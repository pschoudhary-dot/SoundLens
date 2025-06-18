import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { TimeRange } from '@/lib/spotify';

export async function GET(request: NextRequest) {
  try {
    console.log('API: Fetching user playlists...');

    // Try to get token from NextAuth session
    const session = await getServerSession(authOptions);
    console.log('API: NextAuth session available:', !!session);

    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    const spotifyToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    console.log('API: Spotify token from header available:', !!spotifyToken);

    // Determine which token to use
    let accessToken = session?.accessToken || spotifyToken;

    if (!accessToken) {
      console.error('API: No access token available');
      return NextResponse.json({ error: 'No access token available' }, { status: 401 });
    }

    console.log('API: Using access token from:', session?.accessToken ? 'NextAuth session' : 'Spotify header');

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    console.log(`API: Getting user playlists with limit=${limit}, offset=${offset}`);

    // Make the API call to get user's playlists
    const response = await fetch(
      `https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Spotify API error:', response.status, errorText);

      // If it's a permissions error, return empty playlists instead of throwing
      if (response.status === 403) {
        console.warn('⚠️ Insufficient permissions to access playlist data. Returning empty array.');
        return NextResponse.json({ playlists: [] });
      }

      throw new Error(`Spotify API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`API: Successfully retrieved ${data.items.length} playlists`);

    return NextResponse.json({ playlists: data.items });
  } catch (error: any) {
    console.error('API: Error fetching playlists:', error);

    // Determine appropriate status code
    let statusCode = 500;
    if (error.message?.includes('Unauthorized') || error.message?.includes('access token')) {
      statusCode = 401;
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch playlists' },
      { status: statusCode }
    );
  }
}
