'use client';

import React, { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import SimpleSpotifyPlayer from './SimpleSpotifyPlayer';

// Dynamically import the SpotifyPlayer component with no SSR
const SpotifyPlayer = dynamic(
  () => import('./SpotifyPlayer').catch(err => {
    console.error('Error loading SpotifyPlayer:', err);
    // Return the SimpleSpotifyPlayer component on error
    return SimpleSpotifyPlayer;
  }),
  {
    ssr: false,
    loading: () => <div className="fixed bottom-0 left-0 right-0 h-20 bg-black/95 border-t border-white/10"></div>
  }
);

interface SpotifyPlayerWrapperProps {
  className?: string;
}

const SpotifyPlayerWrapper: React.FC<SpotifyPlayerWrapperProps> = ({ className }) => {
  const [hasSpotifyToken, setHasSpotifyToken] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      // Check if we have a Spotify token
      const token = localStorage.getItem('spotify_access_token');
      setHasSpotifyToken(!!token);
    } catch (err) {
      console.error('Error checking Spotify token:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, []);

  // Don't render anything if there's no token or there was an error
  if (!hasSpotifyToken || error) {
    return null;
  }

  return (
    <Suspense fallback={<div className="fixed bottom-0 left-0 right-0 h-20 bg-black/95 border-t border-white/10"></div>}>
      <ErrorBoundary fallback={<SimpleSpotifyPlayer className={className} />}>
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