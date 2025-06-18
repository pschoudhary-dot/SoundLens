'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// Import Spotify types from the types/spotify.d.ts file
// The types are now globally available

interface SpotifyPlayerContextType {
  player: Spotify.Player | null;
  deviceId: string | null;
  isActive: boolean;
  isPaused: boolean;
  currentTrack: Spotify.Track | null;
  position: number;
  duration: number;
  volume: number;
  error: string | null;
  isReady: boolean;
  play: (uri: string) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  seek: (position: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
}

const defaultContextValue: SpotifyPlayerContextType = {
  player: null,
  deviceId: null,
  isActive: false,
  isPaused: true,
  currentTrack: null,
  position: 0,
  duration: 0,
  volume: 0.5,
  error: null,
  isReady: false,
  play: async () => {},
  pause: async () => {},
  resume: async () => {},
  nextTrack: async () => {},
  previousTrack: async () => {},
  seek: async () => {},
  setVolume: async () => {},
};

export const SpotifyPlayerContext = createContext<SpotifyPlayerContextType>(defaultContextValue);

interface SpotifyPlayerProviderProps {
  children: ReactNode;
}

export const SpotifyPlayerProvider: React.FC<SpotifyPlayerProviderProps> = ({ children }) => {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<Spotify.Track | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.5);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize the Spotify Web Playback SDK
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Check if the SDK is already loaded
    const isSDKLoaded = document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]');

    if (!isSDKLoaded) {
      // Load the Spotify Web Playback SDK script
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;

      // Handle script loading errors
      script.onerror = () => {
        console.error('Failed to load Spotify Web Playback SDK');
        setError('Failed to load Spotify Web Playback SDK');
      };

      document.body.appendChild(script);
    }

    // Initialize the player when the SDK is ready
    const initializePlayer = () => {
      try {
        const token = localStorage.getItem('spotify_access_token');

        if (!token) {
          console.warn('No Spotify access token available');
          setError('No Spotify access token available');
          return;
        }

        // Check if Spotify SDK is available
        if (!window.Spotify) {
          console.error('Spotify SDK not available');
          setError('Spotify SDK not available');
          return;
        }

        const spotifyPlayer = new window.Spotify.Player({
          name: 'SoundLens Web Player',
          getOAuthToken: (cb: (token: string) => void) => { cb(token); },
          volume: volume
        });

        // Error handling
        spotifyPlayer.addListener('initialization_error', ({ message }: { message: string }) => {
          console.error('Initialization error:', message);
          setError(`Initialization error: ${message}`);
        });

        spotifyPlayer.addListener('authentication_error', ({ message }: { message: string }) => {
          console.error('Authentication error:', message);
          setError(`Authentication error: ${message}`);
        });

        spotifyPlayer.addListener('account_error', ({ message }: { message: string }) => {
          console.error('Account error:', message);
          setError(`Account error: ${message}`);
        });

        spotifyPlayer.addListener('playback_error', ({ message }: { message: string }) => {
          console.error('Playback error:', message);
          setError(`Playback error: ${message}`);
        });

        // Playback status updates
        spotifyPlayer.addListener('player_state_changed', (state: any) => {
          if (!state) {
            setIsActive(false);
            return;
          }

          setCurrentTrack(state.track_window.current_track);
          setPosition(state.position);
          setDuration(state.duration);
          setIsPaused(state.paused);
          setIsActive(true);
        });

        // Ready
        spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
          console.log('Ready with Device ID', device_id);
          setDeviceId(device_id);
          setIsReady(true);
        });

        // Not Ready
        spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
          console.log('Device ID has gone offline', device_id);
          setDeviceId(null);
          setIsReady(false);
        });

        // Connect to the player
        spotifyPlayer.connect().then((success: boolean) => {
          if (success) {
            console.log('The Web Playback SDK successfully connected to Spotify!');
          } else {
            console.error('Failed to connect to Spotify');
            setError('Failed to connect to Spotify');
          }
        }).catch(err => {
          console.error('Error connecting to Spotify:', err);
          setError(`Error connecting to Spotify: ${err.message}`);
        });

        setPlayer(spotifyPlayer);

        // Cleanup on unmount
        return () => {
          try {
            spotifyPlayer.disconnect();
          } catch (err) {
            console.error('Error disconnecting player:', err);
          }
        };
      } catch (err: any) {
        console.error('Error initializing Spotify player:', err);
        setError(`Error initializing Spotify player: ${err.message}`);
      }
    };

    // Set up the SDK ready callback
    window.onSpotifyWebPlaybackSDKReady = initializePlayer;

    // If the SDK is already loaded, initialize the player
    if (window.Spotify) {
      initializePlayer();
    }

    return () => {
      // Cleanup
      if (player) {
        try {
          player.disconnect();
        } catch (err) {
          console.error('Error disconnecting player during cleanup:', err);
        }
      }
    };
  }, [volume, player]);

  // Player control functions
  const play = async (uri: string) => {
    if (!deviceId) return;

    try {
      const token = localStorage.getItem('spotify_access_token');

      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        body: JSON.stringify({ uris: [uri] }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
    } catch (err) {
      console.error('Error playing track:', err);
    }
  };

  const pause = async () => {
    if (player) {
      await player.pause();
    }
  };

  const resume = async () => {
    if (player) {
      await player.resume();
    }
  };

  const nextTrack = async () => {
    if (player) {
      await player.nextTrack();
    }
  };

  const previousTrack = async () => {
    if (player) {
      await player.previousTrack();
    }
  };

  const seek = async (position: number) => {
    if (player) {
      await player.seek(position);
    }
  };

  const setVolume = async (newVolume: number) => {
    if (player) {
      await player.setVolume(newVolume);
      setVolumeState(newVolume);
    }
  };

  const value = {
    player,
    deviceId,
    isActive,
    isPaused,
    currentTrack,
    position,
    duration,
    volume,
    error,
    isReady,
    play,
    pause,
    resume,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
  };

  return (
    <SpotifyPlayerContext.Provider value={value}>
      {children}
    </SpotifyPlayerContext.Provider>
  );
};

export const useSpotifyPlayer = () => useContext(SpotifyPlayerContext);
