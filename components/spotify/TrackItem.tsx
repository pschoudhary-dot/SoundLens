'use client';

import React from 'react';
import { SpotifyTrack } from '@/lib/spotify';

interface TrackItemProps {
  track: SpotifyTrack;
  rank: number;
}

const TrackItem: React.FC<TrackItemProps> = ({ track, rank }) => {
  return (
    <div className="flex items-center p-3 hover:bg-white/5 rounded-md transition-colors">
      <div className="flex-shrink-0 w-8 text-center font-bold text-secondary/50">
        {rank}
      </div>
      <div className="flex-shrink-0 ml-2">
        <img
          src={track.album.images[0]?.url || '/placeholder-album.png'}
          alt={track.album.name}
          className="w-12 h-12 rounded-md"
        />
      </div>
      <div className="ml-4 flex-grow min-w-0">
        <h3 className="font-medium text-secondary truncate">{track.name}</h3>
        <p className="text-sm text-secondary/70 truncate">
          {track.artists.map(artist => artist.name).join(', ')}
        </p>
      </div>
    </div>
  );
};

export default TrackItem;
