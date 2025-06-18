'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Component that handles storing the Spotify access token in localStorage
 * This is needed for the Spotify Web Playback SDK to work
 */
const SpotifyTokenHandler: React.FC = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      console.log('SpotifyTokenHandler: Storing Spotify access token in localStorage.');
      localStorage.setItem('spotify_access_token', session.accessToken as string);
    } else if (status === 'unauthenticated') {
      console.log('SpotifyTokenHandler: Session unauthenticated. Removing Spotify access token from localStorage.');
      localStorage.removeItem('spotify_access_token');
    } else if (session?.error) {
      // Errors like RefreshAccessTokenError suggest the token is no longer valid
      console.error(`SpotifyTokenHandler: Session error (${session.error}). Removing Spotify access token from localStorage.`);
      localStorage.removeItem('spotify_access_token');
    } else if (status === 'loading') {
      console.log('SpotifyTokenHandler: Session is loading. No action on localStorage yet.');
    }
    // Only re-run if session object itself changes, or status changes.
    // session.accessToken is part of the session object.
  }, [session, status]);

  // This component doesn't render anything
  return null;
};

export default SpotifyTokenHandler;
