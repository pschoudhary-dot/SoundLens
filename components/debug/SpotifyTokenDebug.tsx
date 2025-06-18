'use client';

import React, { useEffect, useState } from 'react';
import { useSpotifyAuth } from '@/contexts/SpotifyAuthContext';
import Button from '@/components/ui/Button'; // Assuming a base Button component exists

const SpotifyTokenDebug: React.FC = () => {
  // Conditional rendering based on NODE_ENV should ideally be handled
  // by the component that imports this, or via build-time stripping.
  // For client components, process.env.NODE_ENV is available.
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const {
    accessToken,
    tokenExpiry,
    isAuthenticated,
    isConnecting,
    error: authError,
    checkSession,
  } = useSpotifyAuth();

  const [localStorageToken, setLocalStorageToken] = useState<string | null>(null);
  const [clientSide, setClientSide] = useState(false);

  useEffect(() => {
    // Ensure localStorage is only accessed on the client side
    setClientSide(true);
    if (typeof window !== 'undefined') {
      setLocalStorageToken(localStorage.getItem('spotify_access_token'));
    }
  }, []); // Runs once on mount client-side

  // Re-check localStorage if auth state changes, useful if SpotifyTokenHandler updates it
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocalStorageToken(localStorage.getItem('spotify_access_token'));
    }
  }, [isAuthenticated, accessToken, clientSide]);


  const formatTokenForDisplay = (token: string | null | undefined): string => {
    if (!token) return 'Absent';
    // Example: Show first 6 and last 4 chars: `${token.substring(0, 6)}...${token.substring(token.length - 4)}`
    // For simplicity and to avoid leaking too much, just confirm presence.
    return `Present (len: ${token.length})`;
  };

  const handleCheckSession = async () => {
    if (checkSession) {
      console.log("SpotifyTokenDebug: Manually triggering checkSession...");
      await checkSession();
      // Re-read local storage after checkSession completes as it might have been updated
      if (typeof window !== 'undefined') {
        setLocalStorageToken(localStorage.getItem('spotify_access_token'));
      }
      console.log("SpotifyTokenDebug: checkSession completed.");
    } else {
      console.warn("SpotifyTokenDebug: checkSession function not available on context.");
    }
  };

  if (!clientSide) {
    // Don't render anything on the server, wait for client-side hydration for localStorage access
    return null;
  }

  return (
    <div style={{
      border: '2px dashed #ff8c00', // DarkOrange border
      padding: '15px',
      margin: '20px 0',
      backgroundColor: '#333', // Dark background
      color: '#fff', // Light text
      fontSize: '14px',
      fontFamily: 'monospace',
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      maxWidth: '400px',
      maxHeight: '80vh',
      overflowY: 'auto',
      zIndex: 9999,
      borderRadius: '8px',
      boxShadow: '0 0 10px rgba(0,0,0,0.5)'
    }}>
      <h4 style={{ marginTop: 0, marginBottom: '10px', borderBottom: '1px solid #555', paddingBottom: '5px' }}>
        Spotify Auth Debug (Dev Only)
      </h4>
      <div style={{ marginBottom: '5px' }}><strong>Is Authenticated (Context):</strong> {isAuthenticated ? 'Yes' : 'No'}</div>
      <div style={{ marginBottom: '5px' }}><strong>Is Connecting (Context):</strong> {isConnecting ? 'Yes' : 'No'}</div>
      <div style={{ marginBottom: '5px' }}><strong>Auth Error (Context):</strong> <span style={{color: authError? '#ff6b6b' : 'inherit'}}>{authError || 'None'}</span></div>
      <div style={{ marginBottom: '5px' }}><strong>Access Token (Context):</strong> {formatTokenForDisplay(accessToken)}</div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Token Expiry (Context):</strong> {tokenExpiry ? new Date(tokenExpiry).toLocaleString() : 'N/A'}
        {tokenExpiry && tokenExpiry < Date.now() && <span style={{color: '#ff6b6b'}}> (EXPIRED)</span>}
      </div>
      <hr style={{borderColor: '#555', margin: '10px 0'}} />
      <div style={{ marginBottom: '10px' }}><strong>Access Token (localStorage):</strong> {formatTokenForDisplay(localStorageToken)}</div>

      <Button
        onClick={handleCheckSession}
        disabled={isConnecting}
        variant="outline"
        size="sm"
        className="bg-orange-500 hover:bg-orange-600 text-white border-orange-600"
      >
        {isConnecting ? 'Checking Session...' : 'Manually Check/Refresh Session'}
      </Button>
    </div>
  );
};

export default SpotifyTokenDebug;
