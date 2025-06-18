'use client';

import React, { useState, useEffect } from 'react';
import ButtonWithSpinner from '@/components/ui/ButtonWithSpinner';

const AuthStatus: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark that we're now on the client
    setIsClient(true);

    try {
      // Check for authentication token
      const token = localStorage.getItem('soundlens_token');
      const expiryStr = localStorage.getItem('soundlens_session_expiry');

      if (token) {
        // Check if token is expired
        if (expiryStr) {
          const expiryDate = new Date(expiryStr);
          const now = new Date();

          if (now > expiryDate) {
            console.log('Token expired, clearing session');
            // Token expired, clear it
            localStorage.removeItem('soundlens_token');
            localStorage.removeItem('soundlens_user');
            localStorage.removeItem('soundlens_session_expiry');
            setIsAuthenticated(false);
            return;
          }
        }

        // Token exists and is not expired
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      // If localStorage is not available, assume not authenticated
      setIsAuthenticated(false);
    }
  }, []);

  // Only render the actual content on the client
  if (!isClient) {
    return null; // Return nothing during SSR
  }

  // Only show the dashboard button if authenticated
  if (isAuthenticated) {
    return (
      <ButtonWithSpinner
        href="/dashboard"
        size="sm"
        className="px-4 py-1.5 bg-[#22c55e] hover:bg-[#16a34a] text-white text-sm shadow-sm relative overflow-hidden group"
      >
        <span className="relative z-10">Go to Dashboard</span>
        <span className="absolute inset-0 bg-gradient-to-r from-[#22c55e] to-[#16a34a] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
      </ButtonWithSpinner>
    );
  }

  // Return null when not authenticated - the login/signup links are handled directly in the page
  return null;
};

export default AuthStatus;
