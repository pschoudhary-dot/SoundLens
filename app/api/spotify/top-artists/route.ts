import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getTopArtists, TimeRange } from '@/lib/spotify';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log('API: Fetching top artists...');

    // Try to get token from NextAuth session
    const session = await getServerSession(authOptions);
    console.log('API: NextAuth session available:', !!session);

    // We're not using cookies for Spotify tokens anymore
    // The token will be passed in the Authorization header from the client

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

    console.log('API: Using access token from:', session?.accessToken ? 'NextAuth session' : 'Spotify cookie');

    const searchParams = request.nextUrl.searchParams;
    let timeRange = (searchParams.get('timeRange') as TimeRange) || 'medium_term';
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    // Map custom time ranges to Spotify API time ranges
    if (timeRange === 'today' || timeRange === 'this_week' || timeRange === 'this_month') {
      // For these custom ranges, we'll use short_term (4 weeks) as the closest approximation
      // In a real app, you might want to store daily/weekly data to provide more accurate ranges
      timeRange = 'short_term';
    }

    console.log(`API: Getting top artists with timeRange=${timeRange}, limit=${limit}`);

    // If we're using the cookie token, make the API call directly
    let artists;
    if (spotifyToken && !session?.accessToken) {
      // Direct API call using the token from cookie
      const response = await fetch(
        `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${spotifyToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Spotify API error:', response.status, errorText);
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();

      // Transform the data to match our expected format
      artists = data.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        images: item.images || [],
        genres: item.genres || [],
        popularity: item.popularity,
        external_urls: item.external_urls,
      }));
    } else {
      // Use the existing function with the session token
      artists = await getTopArtists(timeRange, limit);
    }

    console.log(`API: Successfully retrieved ${artists.length} artists`);

    return NextResponse.json({ artists });
  } catch (error: any) {
    console.error('API: Error fetching top artists:', error);

    // Determine appropriate status code
    let statusCode = 500;
    if (error.message?.includes('Unauthorized') || error.message?.includes('access token')) {
      statusCode = 401;
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch top artists' },
      { status: statusCode }
    );
  }
}
