'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Component that handles storing the Spotify access token in localStorage
 * This is needed for the Spotify Web Playback SDK to work
 */
const SpotifyTokenHandler: React.FC = () => {
  const { data: session } = useSession();

  useEffect(() => {
    // Store the Spotify access token in localStorage when it changes
    if (session?.accessToken) {
      console.log('Storing Spotify access token in localStorage');
      localStorage.setItem('spotify_access_token', session.accessToken as string);
    }
  }, [session?.accessToken]);

  // This component doesn't render anything
  return null;
};

export default SpotifyTokenHandler;
