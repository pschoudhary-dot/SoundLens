'use client';

import React, { useEffect, useState } from 'react';
import { useSpotifyPlayer } from '@/contexts/SpotifyPlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import '@/styles/player.css';

interface SpotifyPlayerProps {
  className?: string;
}

const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ className = '' }) => {
  const {
    isActive,
    isPaused,
    currentTrack,
    position,
    duration,
    volume,
    isReady,
    resume,
    pause,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
  } = useSpotifyPlayer();

  const [expanded, setExpanded] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);

  // Update current position for the progress bar
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setCurrentPosition(prev => {
          if (prev >= duration) {
            clearInterval(interval);
            return 0;
          }
          return prev + 1000;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, duration]);

  // Reset position when track changes
  useEffect(() => {
    setCurrentPosition(position);
  }, [position, currentTrack]);

  const togglePlayPause = () => {
    if (isPaused) {
      resume();
    } else {
      pause();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPosition = parseInt(e.target.value);
    setCurrentPosition(newPosition);
    seek(newPosition);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX size={18} />;
    if (volume < 0.5) return <Volume1 size={18} />;
    return <Volume2 size={18} />;
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Don't render if not ready or no track is playing
  if (!isReady || !isActive) {
    return null;
  }

  // Safety check for currentTrack
  if (!currentTrack || !currentTrack.album) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-black/95 border-t border-white/10 shadow-lg z-40 transition-all duration-300 ${
        expanded ? 'h-96' : 'h-20'
      } ${className}`}
    >
      <div className="container mx-auto h-full flex flex-col">
        {/* Compact Player View */}
        <div className="h-20 flex items-center justify-between px-4">
          {/* Track Info */}
          <div className="flex items-center flex-1 min-w-0">
            {currentTrack?.album.images && currentTrack.album.images.length > 0 && (
              <img
                src={currentTrack.album.images[0].url}
                alt={currentTrack.album.name}
                className="w-12 h-12 rounded-md mr-4"
              />
            )}
            <div className="min-w-0">
              <h4 className="text-white font-medium truncate">{currentTrack?.name}</h4>
              <p className="text-white/70 text-sm truncate">
                {currentTrack?.artists.map((artist: { name: string }) => artist.name).join(', ')}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 flex-1">
            <button
              type="button"
              onClick={previousTrack}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Previous track"
            >
              <SkipBack size={20} />
            </button>

            <button
              type="button"
              onClick={togglePlayPause}
              className="p-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
              aria-label={isPaused ? 'Play' : 'Pause'}
            >
              {isPaused ? <Play size={20} /> : <Pause size={20} />}
            </button>

            <button
              type="button"
              onClick={nextTrack}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Next track"
            >
              <SkipForward size={20} />
            </button>
          </div>

          {/* Volume and Expand */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            <div className="hidden md:flex items-center gap-2 w-32">
              <button type="button" className="p-1" aria-label="Volume">
                {getVolumeIcon()}
              </button>
              <label htmlFor="volume-control" className="sr-only">Volume Control</label>
              <input
                id="volume-control"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                title="Volume Control"
                aria-label="Volume Control"
                className="player-volume-slider"
              />
            </div>

            <button
              type="button"
              onClick={toggleExpanded}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label={expanded ? 'Minimize player' : 'Expand player'}
            >
              {expanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
          </div>
        </div>

        {/* Progress Bar (always visible) */}
        <div className="px-4 -mt-2">
          <div className="flex justify-between text-xs text-white/60 mb-1">
            <span>{formatTime(currentPosition)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <label htmlFor="progress-control" className="sr-only">Playback Progress</label>
          <input
            id="progress-control"
            type="range"
            min="0"
            max={duration}
            value={currentPosition}
            onChange={handleSeek}
            title="Playback Progress"
            aria-label="Playback Progress"
            className="player-progress-bar"
          />
        </div>

        {/* Expanded View */}
        {expanded && (
          <div className="flex-1 flex p-4 pt-6">
            <div className="flex-1 flex items-center justify-center">
              {currentTrack?.album.images && currentTrack.album.images.length > 0 && (
                <img
                  src={currentTrack.album.images[0].url}
                  alt={currentTrack.album.name}
                  className="player-album-cover"
                />
              )}
            </div>

            <div className="flex-1 flex flex-col justify-center pl-8">
              <h3 className="text-2xl font-bold mb-2">{currentTrack?.name}</h3>
              <p className="text-lg text-white/70 mb-4">
                {currentTrack?.artists.map((artist: { name: string }) => artist.name).join(', ')}
              </p>
              <p className="text-sm text-white/50 mb-6">
                {currentTrack?.album.name}
              </p>

              <div className="flex items-center gap-6 mt-4">
                <button
                  type="button"
                  onClick={previousTrack}
                  className="p-3 rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Previous track"
                >
                  <SkipBack size={24} />
                </button>

                <button
                  type="button"
                  onClick={togglePlayPause}
                  className="p-4 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
                  aria-label={isPaused ? 'Play' : 'Pause'}
                >
                  {isPaused ? <Play size={28} /> : <Pause size={28} />}
                </button>

                <button
                  type="button"
                  onClick={nextTrack}
                  className="p-3 rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Next track"
                >
                  <SkipForward size={24} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotifyPlayer;
