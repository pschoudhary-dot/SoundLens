'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useSpotifyPlayer } from '@/contexts/SpotifyPlayerContext';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const reelRef = useRef<HTMLDivElement>(null);

  // Use the Spotify Player context
  const {
    play,
    isPaused,
    isActive,
    currentTrack: spotifyCurrentTrack
  } = useSpotifyPlayer();

  useEffect(() => {
    const fetchRecentlyPlayed = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Try to get Spotify token first
        const spotifyToken = localStorage.getItem('spotify_access_token');

        // Fall back to custom token if Spotify token is not available
        const customToken = localStorage.getItem('soundlens_token');

        // Create headers with the token if available
        let headers = {};
        if (spotifyToken) {
          console.log('Using Spotify token for API requests');
          headers = { Authorization: `Bearer ${spotifyToken}` };
        } else if (customToken) {
          console.log('Using custom token for API requests');
          headers = { Authorization: `Bearer ${customToken}` };
        }

        const timestamp = new Date().getTime();
        const response = await axios.get(
          `/api/spotify/recently-played?limit=20&t=${timestamp}`,
          { headers }
        );

        if (response.data.tracks) {
          setTracks(response.data.tracks);
        }
      } catch (err: any) {
        console.error('Error fetching recently played tracks:', err);
        setError(err.response?.data?.error || err.message || 'Failed to load recently played tracks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentlyPlayed();
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-primary/30 backdrop-blur-sm border border-white/10 rounded-lg p-6 text-center">
        <p className="text-red-400 mb-2">Error: {error}</p>
        <p className="text-white/70">Unable to load your music reel.</p>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="bg-primary/30 backdrop-blur-sm border border-white/10 rounded-lg p-6 text-center">
        <p className="text-white/70">No recently played tracks found.</p>
      </div>
    );
  }

  const currentTrack = tracks[currentIndex];

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
              className="absolute bottom-4 right-4 bg-accent rounded-full p-3 shadow-lg hover:bg-accent/80 transition-colors"
            >
              {isCurrentTrackPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
          </div>

          <h3 className="text-xl font-bold text-white mb-1 truncate">{currentTrack.name}</h3>
          <p className="text-white/70 mb-4 truncate">{currentTrack.artist}</p>
          <p className="text-white/50 text-sm mb-6 truncate">Album: {currentTrack.album}</p>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              variant="outline"
              size="sm"
              className="px-3"
            >
              <ChevronLeft size={18} />
            </Button>

            <a
              href={currentTrack.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1DB954] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#1DB954]/80 transition-colors"
            >
              Open in Spotify
            </a>

            <Button
              onClick={handleNext}
              disabled={currentIndex === tracks.length - 1}
              variant="outline"
              size="sm"
              className="px-3"
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
