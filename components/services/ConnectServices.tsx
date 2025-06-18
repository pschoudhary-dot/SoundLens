'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Button from '@/components/ui/Button';
import ButtonWithSpinner from '@/components/ui/ButtonWithSpinner';
import { Music, Youtube } from 'lucide-react';

const ConnectServices: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('soundlens_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Check if we need to update the user data from the server
      const checkUserConnections = async () => {
        try {
          const token = localStorage.getItem('soundlens_token');
          if (token) {
            const response = await axios.get('/api/user/profile', {
              headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.user) {
              // Update user data with latest connection status
              const updatedUser = {
                ...parsedUser,
                spotifyConnected: response.data.user.spotifyConnected || parsedUser.spotifyConnected,
                youtubeConnected: response.data.user.youtubeConnected || parsedUser.youtubeConnected
              };

              setUser(updatedUser);
              localStorage.setItem('soundlens_user', JSON.stringify(updatedUser));
            }
          }
        } catch (error) {
          console.error('Error fetching user connection status:', error);
        }
      };

      checkUserConnections();
    }

    setIsLoading(false);
  }, []);

  const handleConnectSpotify = () => {
    // Check if Spotify is already connected
    const userData = localStorage.getItem('soundlens_user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.spotifyConnected) {
          // If already connected, just go to dashboard
          router.push('/dashboard');
          return;
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    // Store current user info in sessionStorage for retrieval after OAuth flow
    if (user) {
      sessionStorage.setItem('soundlens_connecting_user', JSON.stringify(user));

      // Store the token in sessionStorage for the callback to use
      const token = localStorage.getItem('soundlens_token');
      if (token) {
        sessionStorage.setItem('soundlens_token', token);

        // Also set a cookie with the token to ensure it's available to the server
        document.cookie = `soundlens_token=${token}; path=/; max-age=3600; SameSite=Strict`;
      }

      // Store the user ID in a cookie to help with user identification during callback
      if (user._id) {
        document.cookie = `soundlens_user_id=${user._id}; path=/; max-age=3600; SameSite=Strict`;
      }
    }

    // Use our custom Spotify auth endpoint that will handle the port correctly
    router.push('/api/spotify/auth');
  };

  const handleConnectYouTube = () => {
    // This would be implemented in a similar way to Spotify
    // For now, we'll just show an alert
    alert('YouTube Music connection will be implemented soon!');
  };

  const handleContinue = () => {
    // Use window.location for a hard redirect instead of router.push
    window.location.href = '/dashboard';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-primary/30 backdrop-blur-sm border border-white/10 rounded-lg p-8 shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">Connect Your Music Services</h2>
          <p className="text-white/60 mt-2">
            Connect your music streaming services to get personalized insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`p-6 rounded-lg border ${user?.spotifyConnected ? 'border-accent bg-accent/10' : 'border-white/10 bg-white/5'} transition-colors`}>
            <div className="flex items-center mb-4">
              <Music className="text-accent mr-3" size={24} />
              <h3 className="text-xl font-semibold text-white">Spotify</h3>
            </div>
            <p className="text-white/70 mb-6 text-sm">
              Connect your Spotify account to see your top tracks, artists, and listening habits.
            </p>
            <ButtonWithSpinner
              onClick={handleConnectSpotify}
              variant={user?.spotifyConnected ? 'outline' : 'primary'}
              className="w-full"
              disabled={user?.spotifyConnected}
            >
              {user?.spotifyConnected ? 'Connected ✓' : 'Connect Spotify'}
            </ButtonWithSpinner>
          </div>

          <div className={`p-6 rounded-lg border ${user?.youtubeConnected ? 'border-accent bg-accent/10' : 'border-white/10 bg-white/5'} transition-colors`}>
            <div className="flex items-center mb-4">
              <Youtube className="text-accent mr-3" size={24} />
              <h3 className="text-xl font-semibold text-white">YouTube Music</h3>
            </div>
            <p className="text-white/70 mb-6 text-sm">
              Connect your YouTube Music account to analyze your viewing and listening patterns.
            </p>
            <ButtonWithSpinner
              onClick={handleConnectYouTube}
              variant={user?.youtubeConnected ? 'outline' : 'primary'}
              className="w-full"
              disabled={user?.youtubeConnected}
            >
              {user?.youtubeConnected ? 'Connected ✓' : 'Connect YouTube'}
            </ButtonWithSpinner>
          </div>
        </div>

        <div className="text-center">
          <p className="text-white/60 mb-4">
            You can always connect more services later from your profile settings.
          </p>
          <ButtonWithSpinner
            onClick={handleContinue}
            variant="secondary"
            className="px-8"
          >
            Continue to Dashboard
          </ButtonWithSpinner>
        </div>
      </div>
    </div>
  );
};

export default ConnectServices;
