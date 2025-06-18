'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MusicReel from '@/components/spotify/MusicReel';
import SpotifyPlayer from '@/components/spotify/SpotifyPlayer';
import { SpotifyPlayerProvider } from '@/contexts/SpotifyPlayerContext';
import { Disc3 } from 'lucide-react';

export default function MusicReelPage() {
  const { data: session, status } = useSession();

  // Check authentication
  useEffect(() => {
    // Check for custom JWT authentication
    const customToken = localStorage.getItem('soundlens_token');

    // If NextAuth is unauthenticated and we don't have a custom token, redirect
    if (status === 'unauthenticated' && !customToken) {
      // Before redirecting, check if we're coming from a Spotify auth flow
      const url = new URL(window.location.href);
      const fromSpotify = url.searchParams.get('from_spotify');

      if (!fromSpotify) {
        redirect('/');
      }
    }
  }, [status]);

  return (
    <SpotifyPlayerProvider>
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow container mx-auto px-4 py-8 pb-24">
          <h1 className="text-3xl font-bold mb-6">Music Reel</h1>

          <div className="mb-6">
            <div className="flex items-center mb-4">
              <Disc3 className="text-accent mr-2" size={24} />
              <h2 className="text-2xl font-bold">Swipe through your recently played tracks</h2>
            </div>
            <p className="text-white/70 mb-6">
              Scroll up and down or use the arrow buttons to navigate through your music history.
              Click the play button to preview tracks (when available).
            </p>
            <MusicReel />
          </div>
        </main>

        <Footer />

        {/* Spotify Player */}
        <SpotifyPlayer />
      </div>
    </SpotifyPlayerProvider>
  );
}
