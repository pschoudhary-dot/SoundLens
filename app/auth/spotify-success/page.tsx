'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function SpotifySuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Processing Spotify authentication...');

  useEffect(() => {
    if (!searchParams) {
      setMessage('Error: No search parameters found');
      return;
    }

    // Get tokens from URL parameters
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const expiresIn = searchParams.get('expires_in');
    const userId = searchParams.get('user_id');
    const timestamp = searchParams.get('timestamp');

    if (!accessToken || !userId) {
      setMessage('Error: Missing required parameters');
      return;
    }

    try {
      // Store tokens in localStorage
      localStorage.setItem('spotify_access_token', accessToken);

      if (refreshToken) {
        localStorage.setItem('spotify_refresh_token', refreshToken);
      }

      if (expiresIn && timestamp) {
        const expiryTime = parseInt(timestamp) + (parseInt(expiresIn) * 1000);
        localStorage.setItem('spotify_token_expiry', expiryTime.toString());
      }

      // Store user ID for association
      localStorage.setItem('spotify_user_id', userId);

      // Set a flag to indicate Spotify is connected
      localStorage.setItem('spotify_connected', 'true');

      // Update the user data in localStorage if it exists
      const userDataStr = localStorage.getItem('soundlens_user');
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          userData.spotifyConnected = true;
          localStorage.setItem('soundlens_user', JSON.stringify(userData));
        } catch (e) {
          console.error('Error updating user data:', e);
        }
      }

      setMessage('Spotify connected successfully! Redirecting to dashboard...');

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error storing Spotify tokens:', error);
      setMessage('Error storing authentication data. Please try again.');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary">
      <div className="bg-primary/30 backdrop-blur-sm border border-white/10 rounded-lg p-8 max-w-md w-full text-center">
        <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-accent" />
        <h1 className="text-2xl font-bold mb-4">Spotify Authentication</h1>
        <p className="text-white/70">{message}</p>
      </div>
    </div>
  );
}
