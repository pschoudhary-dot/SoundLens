'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Play, Pause, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useSpotifyPlayer } from '@/contexts/SpotifyPlayerContext';
import { useSpotifyAuth } from '@/contexts/SpotifyAuthContext';
import SpotifyReconnectPrompt from '@/components/auth/SpotifyReconnectPrompt';

interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  image: string;
  previewUrl: string | null;
  spotifyUrl: string;
  uri: string;
  playedAt: string;
  duration: number;
}

const MusicReel: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true); // For data fetching
  const [error, setError] = useState<string | null>(null); // For data fetching errors
  const [currentIndex, setCurrentIndex] = useState(0);
  const reelRef = useRef<HTMLDivElement>(null);

  const {
    isAuthenticated: spotifyIsAuthenticated,
    isConnecting: spotifyIsConnecting,
    error: spotifyAuthError,
    accessToken: spotifyAccessToken
  } = useSpotifyAuth();

  // Use the Spotify Player context
  const {
    play,
    isPaused,
    isActive,
    currentTrack: spotifyCurrentTrack
  } = useSpotifyPlayer();

  useEffect(() => {
    const fetchRecentlyPlayed = async () => {
      if (!spotifyIsAuthenticated && !localStorage.getItem('soundlens_token')) {
        setError("Please connect to Spotify to see your music reel.");
        setIsLoading(false);
        return;
      }
      if (spotifyAuthError) {
        setError(`Spotify authentication error: ${spotifyAuthError}`);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const tokenToUse = spotifyAccessToken || localStorage.getItem('spotify_access_token');
        const customToken = localStorage.getItem('soundlens_token');
        let headers = {};

        if (tokenToUse) {
          headers = { Authorization: `Bearer ${tokenToUse}` };
        } else if (customToken) {
          headers = { Authorization: `Bearer ${customToken}` };
        } else {
          // Should be caught by initial checks, but as a safeguard:
          throw new Error("No authentication token available.");
        }

        const timestamp = new Date().getTime();
        const response = await axios.get(
          `/api/spotify/recently-played?limit=20&t=${timestamp}`,
          { headers }
        );

        if (response.data.tracks) {
          setTracks(response.data.tracks);
        } else {
          setTracks([]); // Ensure tracks is an empty array if no data
        }
      } catch (err: any) {
        console.error('Error fetching recently played tracks:', err);
        if (err.response?.status === 401) {
          setError("Spotify authentication failed. Please reconnect to load your music reel.");
        } else {
          setError(err.response?.data?.error || err.message || 'Failed to load recently played tracks');
        }
        setTracks([]); // Clear tracks on error
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if authenticated or custom token exists, and not in an error state from context
    if ((spotifyIsAuthenticated || localStorage.getItem('soundlens_token')) && !spotifyAuthError) {
      fetchRecentlyPlayed();
    } else if (!spotifyIsAuthenticated && !localStorage.getItem('soundlens_token') && !spotifyIsConnecting) {
      // If definitely not authenticated and not connecting, set error state
      setError("Please connect to Spotify to see your music reel.");
      setIsLoading(false);
       setTracks([]);
    } else if (spotifyAuthError) {
        setError(`Spotify authentication error: ${spotifyAuthError}`);
        setIsLoading(false);
         setTracks([]);
    }

  }, [spotifyIsAuthenticated, spotifyAccessToken, spotifyAuthError, spotifyIsConnecting]);

  const handleNext = () => {
    if (currentIndex < tracks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const togglePlay = () => {
    if (!tracks[currentIndex]?.uri) {
      return;
    }

    // Play the track using the Spotify Web Playback SDK
    play(tracks[currentIndex].uri);
  };

  // Check if the current track in the reel is playing
  const isCurrentTrackPlaying = isActive &&
    spotifyCurrentTrack?.id === tracks[currentIndex]?.id &&
    !isPaused;

  const handleScroll = (e: React.WheelEvent) => {
    if (e.deltaY > 0) {
      handleNext();
    } else {
      handlePrev();
    }
  };

  if (isLoading || spotifyIsConnecting) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-primary/30 backdrop-blur-sm border border-white/10 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        <p className="mt-3 text-white/70">{spotifyIsConnecting ? "Connecting to Spotify..." : "Loading your music reel..."}</p>
      </div>
    );
  }

  // Prioritize spotifyAuthError from context
  const displayError = spotifyAuthError || error;

  if (displayError) {
    const isAuthError = spotifyAuthError || (error && error.toLowerCase().includes("authentication"));
    return (
      <div className="bg-primary/30 backdrop-blur-sm border border-white/10 rounded-lg p-6 text-center h-[500px] flex flex-col justify-center items-center">
        <AlertTriangle className="text-red-400 w-12 h-12 mb-4" />
        <p className="text-red-400 mb-2 text-lg"> {isAuthError ? "Spotify Connection Issue" : "Error"}</p>
        <p className="text-white/80 mb-4">{displayError}</p>
        {isAuthError && <SpotifyReconnectPrompt />}
        {!isAuthError && <p className="text-white/70">Please try again later.</p>}
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="bg-primary/30 backdrop-blur-sm border border-white/10 rounded-lg p-6 text-center h-[500px] flex flex-col justify-center items-center">
        <p className="text-white/70 text-lg">No recently played tracks found.</p>
        <p className="text-white/50">Play some music on Spotify to see your reel!</p>
      </div>
    );
  }

  const currentTrack = tracks[currentIndex];
  const canPlay = spotifyIsAuthenticated && currentTrack?.uri; // Player needs auth and a track URI

  return (
    <div
      className="relative h-[500px] overflow-hidden bg-primary/30 backdrop-blur-sm border border-white/10 rounded-lg"
      onWheel={handleScroll}
      ref={reelRef}
    >
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
        <span className="text-white/70 text-sm">Music Reel</span>
        <span className="text-white/50 text-xs">{currentIndex + 1}/{tracks.length}</span>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-md px-6 py-8 text-center">
          <div className="relative mb-6 mx-auto">
            <img
              src={currentTrack.image}
              alt={`${currentTrack.name} album cover`}
              className="w-64 h-64 mx-auto rounded-lg shadow-xl object-cover"
            />

            <button
              type="button"
              onClick={togglePlay}
              disabled={!canPlay || spotifyIsConnecting}
              className="absolute bottom-4 right-4 bg-accent rounded-full p-3 shadow-lg hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={!canPlay ? "Connect Spotify or ensure track has a URI to play" : (isCurrentTrackPlaying ? "Pause" : "Play")}
            >
              {isCurrentTrackPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
          </div>

          <h3 className="text-xl font-bold text-white mb-1 truncate" title={currentTrack.name}>{currentTrack.name}</h3>
          <p className="text-white/70 mb-4 truncate" title={currentTrack.artist}>{currentTrack.artist}</p>
          <p className="text-white/50 text-sm mb-6 truncate" title={currentTrack.album}>Album: {currentTrack.album}</p>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={handlePrev}
              disabled={currentIndex === 0 || spotifyIsConnecting}
              variant="outline"
              size="sm"
              className="px-3 disabled:opacity-50"
            >
              <ChevronLeft size={18} />
            </Button>

            <a
              href={currentTrack.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`bg-[#1DB954] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#1DB954]/80 transition-colors ${spotifyIsConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={(e) => { if (spotifyIsConnecting) e.preventDefault(); }}
            >
              Open in Spotify
            </a>

            <Button
              onClick={handleNext}
              disabled={currentIndex === tracks.length - 1 || spotifyIsConnecting}
              variant="outline"
              size="sm"
              className="px-3 disabled:opacity-50"
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent"></div>
    </div>
  );
};

export default MusicReel;
