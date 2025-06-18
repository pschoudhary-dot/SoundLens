'use client';

import { SessionProvider } from 'next-auth/react';
import SpotifyTokenHandler from '@/components/spotify/SpotifyTokenHandler';

import { SpotifyAuthProvider } from '@/contexts/SpotifyAuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SpotifyAuthProvider>
        <SpotifyTokenHandler />
        {children}
      </SpotifyAuthProvider>
    </SessionProvider>
  );
}
