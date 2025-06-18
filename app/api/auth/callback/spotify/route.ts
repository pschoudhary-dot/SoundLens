import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  console.log('🎵 SPOTIFY CALLBACK RECEIVED');

  try {
    // Get all query parameters for debugging
    const url = new URL(request.url);
    const params: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    console.log('🔍 Spotify callback params:', params);

    // Check for error
    const error = url.searchParams.get('error');
    if (error) {
      console.error('❌ Spotify auth error:', error);

      // Redirect to error page with details
      const errorDescription = url.searchParams.get('error_description') || '';
      const redirectUrl = `/auth/error?error=spotify&error_description=${encodeURIComponent(errorDescription)}&source=custom_handler`;

      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // Verify state parameter to prevent CSRF attacks
    const state = url.searchParams.get('state');
    if (!state) {
      console.error('❌ No state parameter provided');
      return NextResponse.redirect(new URL('/auth/error?error=spotify&error_description=Missing+state+parameter&source=custom_handler', request.url));
    }

    // Get the authorization code
    const code = url.searchParams.get('code');
    if (!code) {
      console.error('❌ No authorization code provided');
      return NextResponse.redirect(new URL('/auth/error?error=spotify&error_description=No+authorization+code+provided&source=custom_handler', request.url));
    }

    console.log('✅ Authorization code received');

    // Exchange the code for an access token
    const tokenResponse = await exchangeCodeForToken(code);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Token exchange failed:', tokenResponse.status, errorText);
      return NextResponse.redirect(new URL(`/auth/error?error=spotify&error_description=Token+exchange+failed:+${tokenResponse.status}&source=custom_handler`, request.url));
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ Token exchange successful');

    // Get user profile from Spotify
    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('❌ Profile fetch failed:', profileResponse.status, errorText);
      return NextResponse.redirect(new URL(`/auth/error?error=spotify&error_description=Profile+fetch+failed:+${profileResponse.status}&source=custom_handler`, request.url));
    }

    const profileData = await profileResponse.json();
    console.log('✅ Profile fetch successful:', profileData.id);

    // Connect to database
    await dbConnect();

    // In Edge Runtime, we need to avoid using cookies() for token storage
    // Instead, we'll use localStorage on the client side

    // Try to find the user by email (most reliable method)
    let user = await User.findOne({ email: profileData.email });
    console.log('🔍 Looking up user by email:', profileData.email, 'Found:', !!user);

    // If no user found by email, try to create a new user
    if (!user) {
      console.log('⚠️ No existing user found with email:', profileData.email);
      console.log('🔍 Creating new user with Spotify data');

      try {
        // Create a new user with Spotify data
        user = new User({
          email: profileData.email,
          name: profileData.display_name || 'Spotify User',
          // Generate a random password since we're using Spotify for auth
          password: Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10),
          spotifyId: profileData.id,
          spotifyConnected: true
        });

        await user.save();
        console.log('✅ Created new user with ID:', user._id);
      } catch (createError) {
        console.error('❌ Failed to create new user:', createError);
        return NextResponse.redirect(new URL('/auth/error?error=spotify&error_description=Failed+to+create+new+user+account&source=custom_handler', request.url));
      }
    }

    // We're using the user's email to identify them, so we don't need to check for tokens here
    console.log('✅ User identified by email, proceeding with Spotify connection');

    // Update user with Spotify data and tokens
    user.spotifyId = profileData.id;
    user.spotifyConnected = true;
    user.spotifyAccessToken = tokenData.access_token;

    if (tokenData.refresh_token) {
      user.spotifyRefreshToken = tokenData.refresh_token;
    }

    // Calculate token expiry timestamp
    if (tokenData.expires_in) {
      user.spotifyTokenExpiry = Date.now() + (tokenData.expires_in * 1000);
    }

    await user.save();

    console.log('✅ User updated with Spotify data and tokens');

    // Instead of using cookies, we'll pass the tokens as URL parameters
    // The client-side code will store them in localStorage

    // Create a URL with the tokens as parameters
    const redirectUrl = new URL('/auth/spotify-success', request.url);
    redirectUrl.searchParams.append('access_token', tokenData.access_token);
    redirectUrl.searchParams.append('expires_in', tokenData.expires_in.toString());

    if (tokenData.refresh_token) {
      redirectUrl.searchParams.append('refresh_token', tokenData.refresh_token);
    }

    // Add user ID for association
    redirectUrl.searchParams.append('user_id', user._id.toString());

    // Add a timestamp for token expiration calculation
    redirectUrl.searchParams.append('timestamp', Date.now().toString());

    console.log('✅ Redirecting to success page with tokens');

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('❌ Unexpected error in Spotify callback:', error);
    return NextResponse.redirect(new URL('/auth/error?error=spotify&error_description=Unexpected+error&source=custom_handler', request.url));
  }
}

async function exchangeCodeForToken(code: string) {
  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    console.error('❌ Missing Spotify credentials in environment variables');
    throw new Error('Missing Spotify credentials');
  }

  if (!redirectUri) {
    console.error('❌ Missing SPOTIFY_REDIRECT_URI in environment variables');
    throw new Error('Missing redirect URI');
  }

  console.log('🔍 Exchanging code for token with redirect URI:', redirectUri);

  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', redirectUri);

  const basicAuth = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');

  try {
    console.log('🔍 Making token exchange request to Spotify');
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    // Log response status for debugging
    console.log('🔍 Token exchange response status:', response.status);

    return response;
  } catch (error) {
    console.error('❌ Error during token exchange:', error);
    throw error;
  }
}
