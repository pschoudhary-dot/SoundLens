'use client';

import React from 'react';
import { SpotifyTrack } from '@/lib/spotify';
import { Play, Pause } from 'lucide-react';
import { useSpotifyPlayer } from '@/contexts/SpotifyPlayerContext';

interface TrackItemProps {
  track: SpotifyTrack;
  rank: number;
}

const TrackItem: React.FC<TrackItemProps> = ({ track, rank }) => {
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
    <div className="flex items-center p-3 hover:bg-white/5 rounded-md transition-colors">
      <div className="flex-shrink-0 w-8 text-center font-bold text-white/50">
        {rank}
      </div>
      <div className="flex-shrink-0 ml-2 relative group">
        <img
          src={track.album?.images && track.album.images.length > 0
            ? track.album.images[0].url
            : '/placeholder-album.png'}
          alt={track.album?.name || 'Album cover'}
          className="w-12 h-12 rounded-md"
        />
        <button
          type="button"
          onClick={handlePlay}
          aria-label={isThisTrackPlaying ? `Pause ${track.name}` : `Play ${track.name}`}
          title={isThisTrackPlaying ? `Pause ${track.name}` : `Play ${track.name}`}
          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
        >
          {isThisTrackPlaying ?
            <Pause className="text-white" size={20} /> :
            <Play className="text-white" size={20} />
          }
        </button>
      </div>
      <div className="ml-4 flex-grow min-w-0">
        <h3 className="font-medium text-white truncate">{track.name}</h3>
        <p className="text-sm text-white/70 truncate">
          {track.artists && track.artists.length > 0
            ? track.artists.map(artist => artist.name).join(', ')
            : 'Unknown Artist'}
        </p>
      </div>
    </div>
  );
};

export default TrackItem;
