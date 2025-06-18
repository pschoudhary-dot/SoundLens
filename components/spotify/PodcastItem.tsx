'use client';

import React, { useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';
import MusicPlayerSidebar from './MusicPlayerSidebar';

interface SpotifyEpisode {
  id: string;
  name: string;
  description?: string;
  images?: { url: string; height: number; width: number }[];
  show?: {
    name: string;
    publisher: string;
  };
  duration_ms?: number;
  release_date?: string;
  preview_url?: string;
  external_urls?: {
    spotify: string;
  };
}

interface PodcastItemProps {
  episode: SpotifyEpisode;
  rank: number;
}

const PodcastItem: React.FC<PodcastItemProps> = ({ episode, rank }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!episode.preview_url && episode.external_urls?.spotify) {
      // If no preview URL is available, open the episode in Spotify
      window.open(episode.external_urls.spotify, '_blank');
      return;
    }
    
    // Open the sidebar player
    setIsSidebarOpen(true);
  };
  
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Format duration from milliseconds to MM:SS
  const formatDuration = (ms?: number) => {
    if (!ms) return '00:00';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Format release date
  const formatReleaseDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <>
      <div className="flex items-center p-3 hover:bg-white/5 rounded-md transition-colors">
        <div className="flex-shrink-0 w-8 text-center font-bold text-white/50">
          {rank}
        </div>
        <div className="flex-shrink-0 ml-2 relative group">
          <img
            src={episode.images && episode.images.length > 0
              ? episode.images[0].url
              : '/placeholder-podcast.png'}
            alt={episode.name || 'Podcast cover'}
            className="w-12 h-12 rounded-md object-cover"
          />
          <button
            type="button"
            onClick={togglePlay}
            aria-label={`Play ${episode.name}`}
            title={`Play ${episode.name}`}
            className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
          >
            <Play className="text-white" size={20} />
          </button>
        </div>
        <div className="ml-4 flex-grow min-w-0">
          <h3 className="font-medium text-white truncate">{episode.name}</h3>
          <p className="text-sm text-white/70 truncate">
            {episode.show?.name || 'Unknown Show'} • {formatDuration(episode.duration_ms)}
          </p>
          <p className="text-xs text-white/50 truncate">
            {formatReleaseDate(episode.release_date)}
          </p>
        </div>
      </div>
      
      {/* Music Player Sidebar */}
      <MusicPlayerSidebar 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar} 
        track={{
          id: episode.id,
          name: episode.name,
          artists: [{ name: episode.show?.name || 'Unknown Show' }],
          album: {
            name: episode.show?.publisher || 'Unknown Publisher',
            images: episode.images
          },
          preview_url: episode.preview_url,
          external_urls: episode.external_urls
        }} 
      />
    </>
  );
};

export default PodcastItem;
