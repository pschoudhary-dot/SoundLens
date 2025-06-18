import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check for required environment variables
    if (!process.env.SPOTIFY_CLIENT_ID) {
      console.error('❌ SPOTIFY_CLIENT_ID is not defined in environment variables');
      return NextResponse.redirect(new URL('/auth/error?error=spotify&error_description=Missing+Spotify+Client+ID+in+server+configuration', request.url));
    }

    if (!process.env.SPOTIFY_CLIENT_SECRET) {
      console.error('❌ SPOTIFY_CLIENT_SECRET is not defined in environment variables');
      return NextResponse.redirect(new URL('/auth/error?error=spotify&error_description=Missing+Spotify+Client+Secret+in+server+configuration', request.url));
    }

    // Use the registered redirect URI from environment variables
    // This is the URI that's registered in your Spotify Developer Dashboard
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

    if (!redirectUri) {
      console.error('❌ SPOTIFY_REDIRECT_URI is not defined in environment variables');
      return NextResponse.redirect(new URL('/auth/error?error=spotify&error_description=Missing+Spotify+Redirect+URI+in+server+configuration', request.url));
    }

    // Validate the redirect URI format
    try {
      new URL(redirectUri);
    } catch (urlError) {
      console.error('❌ SPOTIFY_REDIRECT_URI is not a valid URL:', redirectUri);
      return NextResponse.redirect(new URL('/auth/error?error=spotify&error_description=Invalid+Spotify+Redirect+URI+format', request.url));
    }

    // Spotify OAuth parameters
    const scopes = [
      'user-read-email',
      'user-read-private',
      'user-top-read',
      'user-read-recently-played',
      'user-read-playback-state',
      'user-modify-playback-state',
      'playlist-read-private',
      'playlist-read-collaborative',
      'user-library-read',
      'user-read-currently-playing',
      'user-follow-read',
      'user-read-playback-position',
      'streaming', // Required for Web Playback SDK
    ].join(' ');

    // Add state parameter for CSRF protection
    const state = Math.random().toString(36).substring(2, 15);

    // Store state in URL for verification in callback
    const callbackUrl = new URL('/api/auth/callback/spotify', request.url);
    callbackUrl.searchParams.append('state', state);

    // Construct the Spotify authorization URL
    const spotifyAuthUrl = new URL('https://accounts.spotify.com/authorize');
    spotifyAuthUrl.searchParams.append('client_id', process.env.SPOTIFY_CLIENT_ID);
    spotifyAuthUrl.searchParams.append('response_type', 'code');
    spotifyAuthUrl.searchParams.append('redirect_uri', redirectUri);
    spotifyAuthUrl.searchParams.append('scope', scopes);
    spotifyAuthUrl.searchParams.append('show_dialog', 'true');
    spotifyAuthUrl.searchParams.append('state', state);

    console.log('🎵 Redirecting to Spotify auth with registered redirect_uri:', redirectUri);
    console.log('🔑 Using Client ID:', process.env.SPOTIFY_CLIENT_ID.substring(0, 5) + '...');

    // Redirect to Spotify authorization page
    return NextResponse.redirect(spotifyAuthUrl.toString());
  } catch (error) {
    console.error('❌ Error in Spotify auth endpoint:', error);
    let errorMessage = 'Failed to initiate Spotify authentication';

    if (error instanceof Error) {
      errorMessage += ': ' + error.message;
    }

    return NextResponse.redirect(new URL(`/auth/error?error=spotify&error_description=${encodeURIComponent(errorMessage)}`, request.url));
  }
}
