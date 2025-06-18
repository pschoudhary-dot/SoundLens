'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './MusicPlayerSidebar.module.css';
import { X, Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX } from 'lucide-react';

interface MusicPlayerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  track?: {
    id: string;
    name: string;
    artists: { name: string }[];
    album?: {
      name: string;
      images?: { url: string }[];
    };
    preview_url?: string;
    external_urls?: {
      spotify: string;
    };
  };
}

const MusicPlayerSidebar: React.FC<MusicPlayerSidebarProps> = ({ isOpen, onClose, track }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element when track changes
  useEffect(() => {
    if (track?.preview_url) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      const audio = new Audio(track.preview_url);
      audio.volume = volume;

      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      audioRef.current = audio;

      // Auto-play when a new track is loaded
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(error => {
        console.error('Failed to play audio:', error);
        setIsPlaying(false);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [track?.preview_url]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error('Failed to play audio:', error);
      });
    }

    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;

    const seekTime = parseFloat(e.target.value);
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX size={18} />;
    if (volume < 0.5) return <Volume1 size={18} />;
    return <Volume2 size={18} />;
  };

  // If no track is provided, don't render anything
  if (!track) return null;

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-black/95 border-l border-white/10 shadow-xl transform transition-transform duration-300 z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">Now Playing</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close player"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center">
          <div className="w-full max-w-56 aspect-square mb-6 relative">
            <img
              src={track.album?.images && track.album.images.length > 0
                ? track.album.images[0].url
                : '/placeholder-album.png'}
              alt={track.album?.name || 'Album cover'}
              className="w-full h-full object-cover rounded-lg shadow-lg"
            />
          </div>

          <div className="w-full text-center mb-8">
            <h4 className="text-xl font-bold mb-1 truncate">{track.name}</h4>
            <p className="text-sm text-white/70 truncate">
              {track.artists && track.artists.length > 0
                ? track.artists.map(artist => artist.name).join(', ')
                : 'Unknown Artist'}
            </p>
          </div>

          <div className="w-full mb-6">
            <div className="flex justify-between text-xs text-white/60 mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={duration || 30}
              value={currentTime}
              onChange={handleSeek}
              className={styles.progressBar}
              aria-label="Seek time in track"
              title="Seek time in track"
            />
          </div>

          <div className="flex items-center justify-center gap-6 mb-8">
            <button
              type="button"
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Previous track"
              disabled
            >
              <SkipBack size={24} className="text-white/60" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className="p-4 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>

            <button
              type="button"
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Next track"
              disabled
            >
              <SkipForward size={24} className="text-white/60" />
            </button>
          </div>

          <div className="w-full flex items-center gap-2">
            <button type="button" className="p-1" aria-label="Volume" title="Volume">
              {getVolumeIcon()}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className={styles.volumeSlider}
              aria-label="Adjust volume"
              title="Adjust volume"
            />
          </div>
        </div>

        {track.external_urls?.spotify && (
          <div className="mt-auto pt-4 border-t border-white/10">
            <a
              href={track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2 text-center text-sm text-white bg-green-500 hover:bg-green-600 rounded-md transition-colors"
            >
              Open in Spotify
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicPlayerSidebar;
