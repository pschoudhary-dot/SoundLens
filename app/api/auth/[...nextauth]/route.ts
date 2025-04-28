import NextAuth, { NextAuthOptions } from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';

const scopes = [
  'user-read-email',
  'user-read-private',
  'user-top-read',
  'user-read-recently-played',
].join(' ');

// Log environment variables for debugging
console.log('Environment Variables:');
console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID ? '✓ Set' : '✗ Missing');
console.log('SPOTIFY_CLIENT_SECRET:', process.env.SPOTIFY_CLIENT_SECRET ? '✓ Set' : '✗ Missing');
console.log('SPOTIFY_REDIRECT_URI:', process.env.SPOTIFY_REDIRECT_URI);
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✓ Set' : '✗ Missing');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ Missing');

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID as string,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: scopes,
          redirect_uri: process.env.SPOTIFY_REDIRECT_URI
        }
      }
    }),
  ],
  debug: true, // Enable debug mode for more detailed logs
  callbacks: {
    async jwt({ token, account }) {
      try {
        // Initial sign in
        if (account) {
          console.log('JWT callback - initial sign in with account:', {
            access_token: !!account.access_token,
            refresh_token: !!account.refresh_token,
            expires_at: account.expires_at
          });

          return {
            ...token,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            accessTokenExpires: account.expires_at ? account.expires_at * 1000 : 0,
          };
        }

        // Return previous token if the access token has not expired yet
        if (token.accessTokenExpires && Date.now() < (token.accessTokenExpires as number)) {
          return token;
        }

        // Access token has expired, try to update it
        return refreshAccessToken(token);
      } catch (error) {
        console.error('Error in JWT callback:', error);
        return { ...token, error: 'RefreshAccessTokenError' };
      }
    },
    async session({ session, token }) {
      try {
        session.accessToken = token.accessToken;
        session.error = token.error;
        return session;
      } catch (error) {
        console.error('Error in session callback:', error);
        return { ...session, error: 'SessionError' };
      }
    },
  },
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-default-secret-do-not-use-in-production',
};

async function refreshAccessToken(token: any) {
  try {
    console.log('Attempting to refresh access token');

    if (!token.refreshToken) {
      console.error('No refresh token available');
      return {
        ...token,
        error: 'NoRefreshTokenError',
      };
    }

    const url = 'https://accounts.spotify.com/api/token';
    const basicAuth = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    console.log('Making refresh token request to Spotify');

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
      console.error('Spotify token refresh failed:', response.status, errorText);
      throw new Error(`Spotify API error: ${response.status} - ${errorText}`);
    }

    const refreshedTokens = await response.json();
    console.log('Successfully refreshed access token');

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };