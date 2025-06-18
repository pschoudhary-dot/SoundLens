'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';

interface SimpleSpotifyPlayerProps {
  className?: string;
}

/**
 * A simplified version of the SpotifyPlayer that doesn't use the Spotify Web Playback SDK.
 * This is used as a fallback when the SDK fails to load or when there are chunk loading errors.
 */
const SimpleSpotifyPlayer: React.FC<SimpleSpotifyPlayerProps> = ({ className = '' }) => {
  // Get the most recently played track from localStorage if available
  const getRecentTrack = () => {
    try {
      const recentTracksStr = localStorage.getItem('soundlens_recent_tracks');
      if (recentTracksStr) {
        const recentTracks = JSON.parse(recentTracksStr);
        return recentTracks && recentTracks.length > 0 ? recentTracks[0] : null;
      }
    } catch (error) {
      console.error('Error getting recent track:', error);
    }
    return null;
  };

  const recentTrack = getRecentTrack();

  // If no recent track is available, don't render anything
  if (!recentTrack) {
    return null;
  }

  const openInSpotify = () => {
    if (recentTrack.external_urls?.spotify) {
      window.open(recentTrack.external_urls.spotify, '_blank');
    }
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-black/95 border-t border-white/10 shadow-lg z-40 h-20 ${className}`}>
      <div className="container mx-auto h-full flex items-center justify-between px-4">
        {/* Track Info */}
        <div className="flex items-center flex-1 min-w-0">
          {recentTrack.album?.images && recentTrack.album.images.length > 0 && (
            <img
              src={recentTrack.album.images[0].url}
              alt={recentTrack.album.name || 'Album cover'}
              className="w-12 h-12 rounded-md mr-4"
            />
          )}
          <div className="min-w-0">
            <h4 className="text-white font-medium truncate">{recentTrack.name}</h4>
            <p className="text-white/70 text-sm truncate">
              {recentTrack.artists?.map((artist: { name: string }) => artist.name).join(', ')}
            </p>
          </div>
        </div>

        {/* Open in Spotify button */}
        <button
          type="button"
          onClick={openInSpotify}
          className="flex items-center justify-center py-2 px-4 bg-[#1DB954] hover:bg-[#1AA34A] text-white rounded-md transition-colors"
        >
          <ExternalLink size={16} className="mr-2" /> Open in Spotify
        </button>
      </div>
    </div>
  );
};

export default SimpleSpotifyPlayer;
