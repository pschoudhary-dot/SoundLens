import NextAuth, { NextAuthOptions } from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

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

// Log environment variables for debugging
console.log('Environment Variables:');
// Debug environment variables
console.log('🔍 CHECKING ENVIRONMENT VARIABLES:');
console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID ? '✓ Set' : '✗ Missing');
console.log('SPOTIFY_CLIENT_SECRET:', process.env.SPOTIFY_CLIENT_SECRET ? '✓ Set' : '✗ Missing');
console.log('SPOTIFY_REDIRECT_URI:', process.env.SPOTIFY_REDIRECT_URI);
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✓ Set' : '✗ Missing');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ Missing');

// Validate Spotify redirect URI
if (process.env.SPOTIFY_REDIRECT_URI) {
  try {
    const redirectUrl = new URL(process.env.SPOTIFY_REDIRECT_URI);
    console.log('✅ SPOTIFY_REDIRECT_URI is a valid URL:', redirectUrl.toString());

    // Check if the redirect URI matches the expected format
    if (!redirectUrl.pathname.includes('/api/auth/callback/spotify')) {
      console.warn('⚠️ SPOTIFY_REDIRECT_URI may not be correct. Expected path to include: /api/auth/callback/spotify');
    }

    // Check if the hostname matches NEXTAUTH_URL
    if (process.env.NEXTAUTH_URL) {
      const nextAuthUrl = new URL(process.env.NEXTAUTH_URL);
      if (redirectUrl.hostname !== nextAuthUrl.hostname) {
        console.warn('⚠️ SPOTIFY_REDIRECT_URI hostname does not match NEXTAUTH_URL hostname');
        console.warn(`   SPOTIFY_REDIRECT_URI: ${redirectUrl.hostname}`);
        console.warn(`   NEXTAUTH_URL: ${nextAuthUrl.hostname}`);
      }
    }
  } catch (error) {
    console.error('❌ SPOTIFY_REDIRECT_URI is not a valid URL:', process.env.SPOTIFY_REDIRECT_URI);
  }
} else {
  console.error('❌ SPOTIFY_REDIRECT_URI is not set');
}

// Define authOptions but don't export it directly
const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID as string,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: scopes,
          redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
          show_dialog: true // Force the user to approve the app again
        }
      },
      profile(profile) {
        return {
          id: profile.id,
          name: profile.display_name,
          email: profile.email,
          image: profile.images?.[0]?.url
        }
      }
    }),
  ],
  debug: true, // Enable debug mode for more detailed logs
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log('🔍 SIGNIN CALLBACK TRIGGERED', {
        hasUser: !!user,
        hasAccount: !!account,
        hasProfile: !!profile,
        accountProvider: account?.provider,
        profileId: profile ? (profile as any).id : null,
        userId: user?.id
      });

      try {
        if (account?.provider === 'spotify' && profile) {
          console.log('🎵 Spotify authentication detected');

          // Connect to the database
          console.log('📊 Connecting to database...');
          await dbConnect();
          console.log('📊 Database connection successful');

          // Check if user exists and has an ID
          if (!user || !user.id) {
            console.error('❌ User object is missing or has no ID:', user);
            return true; // Still allow sign in, but log the error
          }

          console.log(`👤 Updating user with ID: ${user.id}`);

          try {
            // Update the user with Spotify ID and set spotifyConnected to true
            const updatedUser = await User.findByIdAndUpdate(
              user.id,
              {
                spotifyId: (profile as any).id,
                spotifyConnected: true
              },
              { new: true }
            );

            if (!updatedUser) {
              console.error('❌ User not found in database with ID:', user.id);
            }
          } catch (dbError) {
            console.error('❌ Database error when updating user:', dbError);
            // Still allow sign in even if database update fails
          }

          console.log('✅ Spotify authentication processed');

          // Update localStorage on client side will be handled by the ConnectServices component
        } else {
          console.log('⚠️ Not a Spotify authentication or missing profile data');
        }
        return true;
      } catch (error) {
        console.error('❌ ERROR in signIn callback:', error);
        // Log more details about the error
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
        return true; // Still allow sign in even if update fails
      }
    },
    async jwt({ token, account, user }) {
      console.log('🔑 JWT CALLBACK TRIGGERED', {
        hasToken: !!token,
        hasAccount: !!account,
        hasUser: !!user,
        tokenKeys: token ? Object.keys(token) : [],
        tokenError: token?.error || 'none'
      });

      try {
        // Initial sign in
        if (account) {
          console.log('🔑 JWT callback - initial sign in with account:', {
            provider: account.provider,
            type: account.type,
            access_token: !!account.access_token,
            refresh_token: !!account.refresh_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope
          });

          // If we have the user object, add it to the token
          if (user) {
            console.log('👤 Adding user ID to token:', user.id);
            token.userId = user.id;
          } else {
            console.log('⚠️ No user object available in JWT callback');
          }

          const newToken = {
            ...token,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            accessTokenExpires: account.expires_at ? account.expires_at * 1000 : 0, // account.expires_at is in seconds
            provider: account.provider
          };
          console.log(`🔑 Initial token setup: account.expires_at=${account.expires_at}, calculated accessTokenExpires=${newToken.accessTokenExpires} (ms)`);
          console.log('🔑 New token created with keys:', Object.keys(newToken));
          return newToken;
        }

        // Return previous token if the access token has not expired yet
        const bufferMilliseconds = 5 * 60 * 1000; // 5 minutes buffer
        const shouldRefresh = token.accessTokenExpires && Date.now() >= ((token.accessTokenExpires as number) - bufferMilliseconds);

        if (token.accessTokenExpires && !shouldRefresh) {
          console.log(`🔑 Token still valid. Current time: ${Date.now()}, Expiry: ${token.accessTokenExpires}, Buffer: ${bufferMilliseconds}ms. Using existing token.`);
          return token;
        }

        if (shouldRefresh) {
          console.log(`🔄 Token expired or within refresh buffer. Current time: ${Date.now()}, Original Expiry: ${token.accessTokenExpires}. Attempting refresh.`);
        } else {
          // This case should ideally not be hit if token.accessTokenExpires is always set.
          console.log('🔄 Access token expiry not set or condition met, attempting to refresh.');
        }
        return refreshAccessToken(token);
      } catch (error) {
        console.error('❌ ERROR in JWT callback:', error);
        // Log more details about the error
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
        console.error('❌ Returning token with error flag');
        return { ...token, error: 'RefreshAccessTokenError' };
      }
    },
    async session({ session, token, user }) {
      console.log('🔄 SESSION CALLBACK TRIGGERED', {
        hasSession: !!session,
        hasToken: !!token,
        hasUser: !!user,
        tokenKeys: token ? Object.keys(token) : [],
        sessionKeys: session ? Object.keys(session) : []
      });

      try {
        // Add properties to the session from the token
        session.accessToken = token.accessToken;
        session.error = token.error;

        // Make sure user object exists
        if (!session.user) {
          session.user = {};
        }

        // Add user ID if available
        if (token.userId) {
          // Add to both places for compatibility
          session.userId = token.userId;
          session.user.id = token.userId;
        }

        // Add provider information if available
        if (token.provider) {
          session.provider = token.provider;
        }

        console.log('🔄 Session updated with keys:', Object.keys(session));
        return session;
      } catch (error) {
        console.error('❌ ERROR in session callback:', error);
        // Log more details about the error
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
        console.error('❌ Returning session with error flag');
        return { ...session, error: 'SessionError' };
      }
    },
  },
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/auth/error',
    newUser: '/connect-services', // Redirect new users to connect services
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-default-secret-do-not-use-in-production',
};

async function refreshAccessToken(token: any) {
  console.log('🔄 REFRESH TOKEN FUNCTION CALLED', {
    hasToken: !!token,
    hasRefreshToken: !!token?.refreshToken,
    tokenKeys: token ? Object.keys(token) : []
  });

  try {
    console.log('🔄 Attempting to refresh access token');

    if (!token.refreshToken) {
      console.error('❌ No refresh token available');
      return {
        ...token,
        error: 'NoRefreshTokenError',
      };
    }

    const url = 'https://accounts.spotify.com/api/token';
    const basicAuth = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    console.log('🔄 Making refresh token request to Spotify');
    console.log('🔑 Using Client ID:', process.env.SPOTIFY_CLIENT_ID?.substring(0, 5) + '...');

    // Log the first few characters of the refresh token for debugging
    const refreshTokenPreview = token.refreshToken.substring(0, 5) + '...';
    console.log('🔑 Using refresh token:', refreshTokenPreview);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Spotify token refresh failed:', response.status, errorText);

      // Log more details about the error
      console.error('Response status:', response.status);
      console.error('Response status text:', response.statusText);
      console.error('Response headers:', Object.fromEntries([...response.headers.entries()]));

      throw new Error(`Spotify API error: ${response.status} - ${errorText}`);
    }

    const refreshedTokens = await response.json();
    console.log('✅ Successfully refreshed access token from Spotify.');
    console.log('🔑 New token expires in (from Spotify):', refreshedTokens.expires_in, 'seconds');

    const newAccessTokenExpires = Date.now() + refreshedTokens.expires_in * 1000;
    const oldRefreshToken = token.refreshToken;
    const newRefreshToken = refreshedTokens.refresh_token;

    if (newRefreshToken && newRefreshToken !== oldRefreshToken) {
      console.log('🔄 Spotify issued a new refresh token.');
    } else if (newRefreshToken) {
      console.log('🔑 Spotify returned the same refresh token.');
    } else {
      console.log('⚠️ Spotify did not return a new refresh token. Continuing with the old one.');
    }

    console.log(`✨ New access token received. New expiry: ${newAccessTokenExpires}`);

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: newAccessTokenExpires,
      refreshToken: newRefreshToken ?? oldRefreshToken, // Fall back to old refresh token if new one isn't provided
      error: null, // Clear any previous error
    };
  } catch (error) {
    console.error('❌ ERROR refreshing access token:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// Export authOptions for use in other files, but in a way that doesn't conflict with Next.js route exports
export { authOptions };