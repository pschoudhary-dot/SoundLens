'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import SimpleSpotifyPlayer from './SimpleSpotifyPlayer';
import { useSpotifyAuth } from '@/contexts/SpotifyAuthContext';
import { AlertTriangle } from 'lucide-react';

// Dynamically import the SpotifyPlayer component with no SSR
const SpotifyPlayer = dynamic(
  () => import('./SpotifyPlayer').catch(err => {
    console.error('SpotifyPlayerWrapper: Error dynamically importing SpotifyPlayer:', err);
    // This fallback within dynamic import might be tricky if SimpleSpotifyPlayer also has issues or isn't the desired outcome here.
    // The main logic below will handle auth state.
    return () => <SimpleSpotifyPlayer />; // Return a component function
  }),
  {
    ssr: false,
    // Loading state for the dynamic import itself
    loading: () => <div className="fixed bottom-0 left-0 right-0 h-20 bg-black/95 border-t border-white/10 flex items-center justify-center"><p className="text-white/70">Loading Player...</p></div>
  }
);

interface SpotifyPlayerWrapperProps {
  className?: string;
}

const SpotifyPlayerWrapper: React.FC<SpotifyPlayerWrapperProps> = ({ className }) => {
  const {
    isAuthenticated: spotifyIsAuthenticated,
    isConnecting: spotifyIsConnecting,
    error: spotifyAuthError,
    accessToken: spotifyAccessToken // We have access to the token if needed for specific checks, but isAuthenticated is key
  } = useSpotifyAuth();

  console.log('SpotifyPlayerWrapper Auth State:', { spotifyIsAuthenticated, spotifyIsConnecting, spotifyAuthError, hasToken: !!spotifyAccessToken });

  if (spotifyIsConnecting) {
    console.log('SpotifyPlayerWrapper: Spotify is connecting. Player not rendered yet.');
    return <div className="fixed bottom-0 left-0 right-0 h-20 bg-black/95 border-t border-white/10 flex items-center justify-center"><p className="text-white/70">Initializing Spotify Connection...</p></div>;
  }

  if (spotifyAuthError) {
    console.error('SpotifyPlayerWrapper: Spotify authentication error. Full SDK Player will not load.', spotifyAuthError);
    // Optionally, render SimpleSpotifyPlayer or a specific error message for the player area
    // For now, returning a minimal error indication or null for player area.
    // Main pages should show the SpotifyReconnectPrompt.
    return (
      <div className={`fixed bottom-0 left-0 right-0 h-20 bg-black/95 border-t border-red-500/50 ${className} flex items-center justify-center p-2`} title={`Spotify Auth Error: ${spotifyAuthError}`}>
        <AlertTriangle className="text-red-500 mr-2" size={20}/>
        <p className="text-red-400 text-xs">Spotify Player unavailable due to auth error.</p>
      </div>
    );
  }

  if (!spotifyIsAuthenticated || !spotifyAccessToken) {
    console.log('SpotifyPlayerWrapper: Not authenticated with Spotify or no access token. Full SDK Player will not load.');
    // Render SimpleSpotifyPlayer if not authenticated, or null if preferred
    // return <SimpleSpotifyPlayer className={className} />;
    return (
       <div className={`fixed bottom-0 left-0 right-0 h-20 bg-black/95 border-t border-white/10 ${className} flex items-center justify-center p-2`}>
        <p className="text-white/70 text-xs">Connect to Spotify to enable player controls.</p>
      </div>
    );
  }

  // If authenticated and no errors, render the full SpotifyPlayer
  console.log('SpotifyPlayerWrapper: Spotify authenticated, rendering full SpotifyPlayer.');
  return (
    // Suspense is for the dynamic import of SpotifyPlayer, ErrorBoundary for runtime errors in it.
    <Suspense fallback={<div className="fixed bottom-0 left-0 right-0 h-20 bg-black/95 border-t border-white/10 flex items-center justify-center"><p className="text-white/70">Loading Player Component...</p></div>}>
      <ErrorBoundary fallback={<SimpleSpotifyPlayer className={className} />}> {/* Fallback if SpotifyPlayer crashes */}
        <SpotifyPlayer className={className} />
      </ErrorBoundary>
    </Suspense>
  );
};

// Simple error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('SpotifyPlayer error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default SpotifyPlayerWrapper;