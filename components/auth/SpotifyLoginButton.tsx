'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';

interface SpotifyLoginButtonProps {
  className?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const SpotifyLoginButton: React.FC<SpotifyLoginButtonProps> = ({
  className = '',
  children = 'Login with Spotify',
  variant = 'primary',
  size = 'md'
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSpotifyLogin = async () => {
    try {
      setIsLoading(true);

      // Instead of using NextAuth directly, use our custom endpoint
      window.location.href = '/api/spotify/auth';

      // The function below will never be reached due to the redirect
      // But we'll keep it for clarity
      return;

      // Note: We're not using NextAuth's signIn function directly anymore
      // as it might be causing the TypeError
    } catch (error) {
      console.error('Spotify login error:', error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleSpotifyLogin}
      className={className}
      variant={variant}
      size={size}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Connecting...
        </span>
      ) : (
        children
      )}
    </Button>
  );
};

export default SpotifyLoginButton;
