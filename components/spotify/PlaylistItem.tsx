'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';

interface SpotifyPlaylist {
  id: string;
  name: string;
  description?: string;
  images?: { url: string; height: number; width: number }[];
  owner?: {
    display_name: string;
  };
  tracks?: {
    total: number;
  };
  external_urls?: {
    spotify: string;
  };
}

interface PlaylistItemProps {
  playlist: SpotifyPlaylist;
  rank: number;
}

const PlaylistItem: React.FC<PlaylistItemProps> = ({ playlist, rank }) => {
  const openPlaylistPage = () => {
    if (playlist.external_urls?.spotify) {
      window.open(playlist.external_urls.spotify, '_blank');
    }
  };

  return (
    <div className="flex items-center p-3 hover:bg-white/5 rounded-md transition-colors">
      <div className="flex-shrink-0 w-8 text-center font-bold text-white/50">
        {rank}
      </div>
      <div className="flex-shrink-0 ml-2 relative group">
        <img
          src={playlist.images && playlist.images.length > 0
            ? playlist.images[0].url
            : '/placeholder-playlist.png'}
          alt={playlist.name || 'Playlist cover'}
          className="w-12 h-12 rounded-md object-cover"
        />
        <button
          type="button"
          onClick={openPlaylistPage}
          aria-label={`Open ${playlist.name} on Spotify`}
          title={`Open ${playlist.name} on Spotify`}
          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
        >
          <ExternalLink className="text-white" size={18} />
        </button>
      </div>
      <div className="ml-4 flex-grow min-w-0">
        <h3 className="font-medium text-white truncate">{playlist.name}</h3>
        <p className="text-sm text-white/70 truncate">
          {playlist.owner?.display_name || 'Unknown'} • {playlist.tracks?.total || 0} tracks
        </p>
      </div>
    </div>
  );
};

export default PlaylistItem;
