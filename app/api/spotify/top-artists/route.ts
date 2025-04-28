import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getTopArtists, TimeRange } from '@/lib/spotify';

export async function GET(request: NextRequest) {
  try {
    console.log('API: Fetching top artists...');
    const session = await getServerSession(authOptions);

    console.log('API: Session available:', !!session);

    if (!session) {
      console.error('API: No session available');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if session has accessToken
    if (!session.accessToken) {
      console.error('API: No access token available');
      return NextResponse.json({ error: 'No access token available' }, { status: 401 });
    }

    console.log('API: Access token available:', !!session.accessToken);

    const searchParams = request.nextUrl.searchParams;
    const timeRange = (searchParams.get('timeRange') as TimeRange) || 'medium_term';
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    console.log(`API: Getting top artists with timeRange=${timeRange}, limit=${limit}`);

    const artists = await getTopArtists(timeRange, limit);

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
