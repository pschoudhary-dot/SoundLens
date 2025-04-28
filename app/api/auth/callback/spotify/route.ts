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
    
    // Get user from session or cookies
    const sessionToken = cookies().get('next-auth.session-token')?.value;
    
    if (!sessionToken) {
      console.error('❌ No session token found');
      return NextResponse.redirect(new URL('/auth/error?error=spotify&error_description=No+session+token+found&source=custom_handler', request.url));
    }
    
    // Connect to database
    await dbConnect();
    
    // Find user by email
    const user = await User.findOne({ email: profileData.email });
    
    if (!user) {
      console.error('❌ No user found with email:', profileData.email);
      return NextResponse.redirect(new URL('/auth/error?error=spotify&error_description=User+not+found&source=custom_handler', request.url));
    }
    
    // Update user with Spotify data
    user.spotifyId = profileData.id;
    user.spotifyConnected = true;
    await user.save();
    
    console.log('✅ User updated with Spotify data');
    
    // Store tokens in cookies (securely)
    cookies().set('spotify_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokenData.expires_in,
      path: '/'
    });
    
    if (tokenData.refresh_token) {
      cookies().set('spotify_refresh_token', tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/'
      });
    }
    
    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
    
  } catch (error) {
    console.error('❌ Unexpected error in Spotify callback:', error);
    return NextResponse.redirect(new URL('/auth/error?error=spotify&error_description=Unexpected+error&source=custom_handler', request.url));
  }
}

async function exchangeCodeForToken(code: string) {
  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', redirectUri as string);
  
  const basicAuth = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');
  
  return fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  });
}
