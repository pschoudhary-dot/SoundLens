'use client';

import React from 'react';
import { SpotifyArtist } from '@/lib/spotify';
import { ExternalLink } from 'lucide-react';

interface ArtistItemProps {
  artist: SpotifyArtist;
  rank: number;
}

const ArtistItem: React.FC<ArtistItemProps> = ({ artist, rank }) => {
  const openArtistPage = () => {
    if (artist.external_urls?.spotify) {
      window.open(artist.external_urls.spotify, '_blank');
    }
  };

  return (
    <div className="flex items-center p-3 hover:bg-white/5 rounded-md transition-colors">
      <div className="flex-shrink-0 w-8 text-center font-bold text-white/50">
        {rank}
      </div>
      <div className="flex-shrink-0 ml-2 relative group">
        <img
          src={artist.images && artist.images.length > 0
            ? artist.images[0].url
            : '/placeholder-artist.png'}
          alt={artist.name || 'Artist image'}
          className="w-12 h-12 rounded-full object-cover"
        />
        <button
          type="button"
          onClick={openArtistPage}
          aria-label={`Open ${artist.name} on Spotify`}
          title={`Open ${artist.name} on Spotify`}
          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
        >
          <ExternalLink className="text-white" size={18} />
        </button>
      </div>
      <div className="ml-4 flex-grow min-w-0">
        <h3 className="font-medium text-white truncate">{artist.name}</h3>
        {artist.genres && artist.genres.length > 0 ? (
          <p className="text-sm text-white/70 truncate">
            {artist.genres.slice(0, 2).join(', ')}
          </p>
        ) : (
          <p className="text-sm text-white/70 truncate">No genres available</p>
        )}
      </div>
    </div>
  );
};

export default ArtistItem;
