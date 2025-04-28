'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Button from '@/components/ui/Button';
import { Music, Youtube } from 'lucide-react';

const ConnectServices: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('soundlens_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);
  
  const handleConnectSpotify = () => {
    // Redirect to Spotify OAuth flow
    router.push('/api/auth/signin/spotify');
  };
  
  const handleConnectYouTube = () => {
    // This would be implemented in a similar way to Spotify
    // For now, we'll just show an alert
    alert('YouTube Music connection will be implemented soon!');
  };
  
  const handleContinue = () => {
    router.push('/dashboard');
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
            <Button
              onClick={handleConnectSpotify}
              variant={user?.spotifyConnected ? 'outline' : 'primary'}
              className="w-full"
            >
              {user?.spotifyConnected ? 'Connected ✓' : 'Connect Spotify'}
            </Button>
          </div>
          
          <div className={`p-6 rounded-lg border ${user?.youtubeConnected ? 'border-accent bg-accent/10' : 'border-white/10 bg-white/5'} transition-colors`}>
            <div className="flex items-center mb-4">
              <Youtube className="text-accent mr-3" size={24} />
              <h3 className="text-xl font-semibold text-white">YouTube Music</h3>
            </div>
            <p className="text-white/70 mb-6 text-sm">
              Connect your YouTube Music account to analyze your viewing and listening patterns.
            </p>
            <Button
              onClick={handleConnectYouTube}
              variant={user?.youtubeConnected ? 'outline' : 'primary'}
              className="w-full"
            >
              {user?.youtubeConnected ? 'Connected ✓' : 'Connect YouTube'}
            </Button>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-white/60 mb-4">
            You can always connect more services later from your profile settings.
          </p>
          <Button
            onClick={handleContinue}
            variant="secondary"
            className="px-8"
          >
            Continue to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConnectServices;
