'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import { useSpotifyAuth } from '@/contexts/SpotifyAuthContext';

interface SpotifyReconnectPromptProps {
  message?: string;
  onReconnectStart?: () => void;
}

const SpotifyReconnectPrompt: React.FC<SpotifyReconnectPromptProps> = ({
  message = "Spotify connection lost or needs to be re-established.",
  onReconnectStart,
}) => {
  const { isConnecting } = useSpotifyAuth(); // To disable button while connecting

  const handleReconnect = () => {
    if (onReconnectStart) {
      onReconnectStart();
    }
    // Force prompt for login and show dialog, useful if token was revoked or needs fresh consent
    signIn('spotify', { prompt: 'login', showDialog: true });
  };

  return (
    <div className="spotify-reconnect-prompt p-4 my-4 border border-red-500 rounded-md bg-red-50 text-red-700">
      <p className="mb-3">{message}</p>
      <button
        onClick={handleReconnect}
        disabled={isConnecting}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
      >
        {isConnecting ? 'Connecting...' : 'Reconnect to Spotify'}
      </button>
    </div>
  );
};

export default SpotifyReconnectPrompt;
