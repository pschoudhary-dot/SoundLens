import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log('API: Fetching recently played tracks...');

    // Try to get token from NextAuth session
    const session = await getServerSession(authOptions);
    console.log('API: NextAuth session available:', !!session);

    // We're not using cookies for Spotify tokens anymore
    // The token will be passed in the Authorization header from the client

    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    const spotifyToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    // Determine which token to use
    let accessToken = session?.accessToken || spotifyToken;

    if (!accessToken) {
      console.error('API: No access token available');
      return NextResponse.json({ error: 'No access token available' }, { status: 401 });
    }

    console.log('API: Using access token from:', session?.accessToken ? 'NextAuth session' : 'Spotify cookie');

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    console.log(`API: Getting recently played tracks with limit=${limit}`);

    // Make the API call to Spotify
    const response = await fetch(
      `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Spotify API error:', response.status, errorText);

      // If it's a permissions error, return empty tracks instead of throwing
      if (response.status === 403) {
        console.warn('⚠️ Insufficient permissions to access recently played data. Returning empty array.');
        return NextResponse.json({ tracks: [] });
      }

      throw new Error(`Spotify API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform the data to match our expected format
    const tracks = data.items.map((item: any) => ({
      id: item.track.id,
      name: item.track.name,
      artist: item.track.artists.map((artist: any) => artist.name).join(', '),
      album: item.track.album.name,
      image: item.track.album.images[0]?.url,
      previewUrl: item.track.preview_url,
      spotifyUrl: item.track.external_urls.spotify,
      uri: item.track.uri,
      playedAt: item.played_at,
      duration: item.track.duration_ms,
    }));

    console.log(`API: Successfully retrieved ${tracks.length} recently played tracks`);

    return NextResponse.json({ tracks });
  } catch (error: any) {
    console.error('API: Error fetching recently played tracks:', error);

    // Determine appropriate status code
    let statusCode = 500;
    if (error.message?.includes('Unauthorized') || error.message?.includes('access token')) {
      statusCode = 401;
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch recently played tracks' },
      { status: statusCode }
    );
  }
}
