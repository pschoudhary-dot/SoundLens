'use client';

import React from 'react';
import { SpotifyArtist } from '@/lib/spotify';
import { ExternalLink } from 'lucide-react';

interface HorizontalArtistItemProps {
  artist: SpotifyArtist;
  rank: number;
}

const HorizontalArtistItem: React.FC<HorizontalArtistItemProps> = ({ artist, rank }) => {
  const openArtistPage = () => {
    if (artist.external_urls?.spotify) {
      window.open(artist.external_urls.spotify, '_blank');
    }
  };

  return (
    <div className="flex-shrink-0 w-40 p-3 hover:bg-white/5 rounded-md transition-colors">
      <div className="relative group mb-2">
        <div className="w-full pb-[100%] relative overflow-hidden rounded-full">
          <img
            src={artist.images && artist.images.length > 0
              ? artist.images[0].url
              : '/placeholder-artist.png'}
            alt={artist.name || 'Artist image'}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="absolute top-0 right-0 bg-black/60 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full z-10">
          {rank}
        </div>
        <button
          type="button"
          onClick={openArtistPage}
          aria-label={`Open ${artist.name} on Spotify`}
          title={`Open ${artist.name} on Spotify`}
          className="absolute top-0 left-0 w-full h-0 pb-[100%] flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full z-10"
        >
          <ExternalLink className="text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" size={24} />
        </button>
      </div>
      <div className="text-center min-w-0">
        <h3 className="font-medium text-white truncate text-sm">{artist.name}</h3>
        {artist.genres && artist.genres.length > 0 ? (
          <p className="text-xs text-white/70 truncate">
            {artist.genres.slice(0, 1).join(', ')}
          </p>
        ) : (
          <p className="text-xs text-white/70 truncate">No genres available</p>
        )}
      </div>
    </div>
  );
};

export default HorizontalArtistItem;
