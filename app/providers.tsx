'use client';

import { SessionProvider } from 'next-auth/react';
import SpotifyTokenHandler from '@/components/spotify/SpotifyTokenHandler';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SpotifyTokenHandler />
      {children}
    </SessionProvider>
  );
}
