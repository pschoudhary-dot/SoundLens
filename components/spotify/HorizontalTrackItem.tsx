'use client';

import React from 'react';
import { SpotifyTrack } from '@/lib/spotify';
import { Play, Pause } from 'lucide-react';
import { useSpotifyPlayer } from '@/contexts/SpotifyPlayerContext';

interface HorizontalTrackItemProps {
  track: SpotifyTrack;
  rank: number;
}

const HorizontalTrackItem: React.FC<HorizontalTrackItemProps> = ({ track, rank }) => {
  const {
    play,
    currentTrack,
    isPaused,
    isActive
  } = useSpotifyPlayer();

  // Check if this track is currently playing
  const isThisTrackPlaying = isActive && currentTrack?.id === track.id && !isPaused;

  // Function to handle play/pause
  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!track.uri && track.external_urls?.spotify) {
      // If no URI is available, open the track in Spotify
      window.open(track.external_urls.spotify, '_blank');
      return;
    }

    // Play the track using the Spotify Web Playback SDK
    play(track.uri);
  };

  return (
    <div className="flex-shrink-0 w-48 p-3 hover:bg-white/5 rounded-md transition-colors">
      <div className="relative group mb-2">
        <div className="w-full pb-[100%] relative">
          <img
            src={track.album?.images && track.album.images.length > 0
              ? track.album.images[0].url
              : '/placeholder-album.png'}
            alt={track.album?.name || 'Album cover'}
            className="absolute inset-0 w-full h-full object-cover rounded-md"
          />
        </div>
        <div className="absolute top-0 right-0 bg-black/60 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-bl-md z-10">
          {rank}
        </div>
        <button
          type="button"
          onClick={handlePlay}
          aria-label={isThisTrackPlaying ? `Pause ${track.name}` : `Play ${track.name}`}
          title={isThisTrackPlaying ? `Pause ${track.name}` : `Play ${track.name}`}
          className="absolute top-0 left-0 w-full h-0 pb-[100%] flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md z-10"
        >
          {isThisTrackPlaying ?
            <Pause className="text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" size={32} /> :
            <Play className="text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" size={32} />
          }
        </button>
      </div>
      <div className="min-w-0">
        <h3 className="font-medium text-white truncate text-sm">{track.name}</h3>
        <p className="text-xs text-white/70 truncate">
          {track.artists && track.artists.length > 0
            ? track.artists.map(artist => artist.name).join(', ')
            : 'Unknown Artist'}
        </p>
      </div>
    </div>
  );
};

export default HorizontalTrackItem;
