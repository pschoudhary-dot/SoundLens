'use client';

import React from 'react';
import { SpotifyArtist } from '@/lib/spotify';

interface ArtistItemProps {
  artist: SpotifyArtist;
  rank: number;
}

const ArtistItem: React.FC<ArtistItemProps> = ({ artist, rank }) => {
  return (
    <div className="flex items-center p-3 hover:bg-white/5 rounded-md transition-colors">
      <div className="flex-shrink-0 w-8 text-center font-bold text-secondary/50">
        {rank}
      </div>
      <div className="flex-shrink-0 ml-2">
        <img
          src={artist.images[0]?.url || '/placeholder-artist.png'}
          alt={artist.name}
          className="w-12 h-12 rounded-full object-cover"
        />
      </div>
      <div className="ml-4 flex-grow min-w-0">
        <h3 className="font-medium text-secondary truncate">{artist.name}</h3>
        {artist.genres.length > 0 && (
          <p className="text-sm text-secondary/70 truncate">
            {artist.genres.slice(0, 2).join(', ')}
          </p>
        )}
      </div>
    </div>
  );
};

export default ArtistItem;
