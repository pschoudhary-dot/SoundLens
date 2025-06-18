'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession, getSession } from 'next-auth/react'; // getSession for explicit refresh

interface SpotifyAuthState {
  accessToken: string | null;
  tokenExpiry: number | null; // Store as timestamp (ms)
  isAuthenticated: boolean;
  isConnecting: boolean;
  error: string | null;
}

interface SpotifyAuthActions {
  login: () => void; // For now, this will likely just point to next-auth signIn
  logout: () => void; // For now, this will likely just point to next-auth signOut
  checkSession: () => Promise<void>; // Manually trigger a session check/refresh
}

const SpotifyAuthContext = createContext<SpotifyAuthState & SpotifyAuthActions | undefined>(undefined);

const REFRESH_THRESHOLD_MINUTES = 10; // Try to refresh if token expires within 10 minutes

export const SpotifyAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status, update } = useSession();
  const [authState, setAuthState] = useState<SpotifyAuthState>({
    accessToken: null,
    tokenExpiry: null,
    isAuthenticated: false,
    isConnecting: status === 'loading',
    error: null,
  });

  useEffect(() => {
    console.log('SpotifyAuthContext: Session status or data changed', { status, session });
    const newIsConnecting = status === 'loading';
    let newAccessToken: string | null = null;
    let newTokenExpiry: number | null = null;
    let newIsAuthenticated = false;
    let newError: string | null = null;

    if (status === 'authenticated' && session) {
      newAccessToken = session.accessToken as string || null;
      // Assuming session.accessTokenExpires is populated from NextAuth session callback
      newTokenExpiry = (session as any).accessTokenExpires || null;
      newError = (session as any).error || null; // Capture error from session (e.g., RefreshAccessTokenError)

      if (newAccessToken && newTokenExpiry && Date.now() < newTokenExpiry) {
        newIsAuthenticated = true;
      } else if (newAccessToken && !newTokenExpiry) {
        // If expiry is not set, but token exists, cautiously treat as authenticated but log warning
        console.warn("SpotifyAuthContext: Access token exists but expiry time is not set. Treating as authenticated.");
        newIsAuthenticated = true;
      } else if (newAccessToken && newTokenExpiry && Date.now() >= newTokenExpiry) {
        console.log("SpotifyAuthContext: Token is expired based on context's knowledge.");
        newIsAuthenticated = false;
        if (!newError) newError = "Token has expired."; // Set error if not already set by NextAuth
      }
    } else if (status === 'unauthenticated') {
      console.log("SpotifyAuthContext: Session unauthenticated.");
      newIsAuthenticated = false;
    }

    setAuthState({
      accessToken: newAccessToken,
      tokenExpiry: newTokenExpiry,
      isAuthenticated: newIsAuthenticated,
      isConnecting: newIsConnecting,
      error: newError,
    });

  }, [session, status]);

  // Proactive token refresh check
  useEffect(() => {
    if (authState.isAuthenticated && authState.tokenExpiry) {
      const timeUntilExpiry = authState.tokenExpiry - Date.now();
      const refreshThresholdMs = REFRESH_THRESHOLD_MINUTES * 60 * 1000;

      console.log(`SpotifyAuthContext: Time until token expiry: ${Math.round(timeUntilExpiry / 60000)} minutes.`);

      if (timeUntilExpiry < refreshThresholdMs) {
        console.log(`SpotifyAuthContext: Token nearing expiry (within ${REFRESH_THRESHOLD_MINUTES} mins). Attempting proactive refresh.`);
        // Calling update() from useSession should trigger a re-fetch of the session,
        // which in turn should invoke the NextAuth jwt callback if the token needs refreshing.
        update();
      }
    }

    // Set up an interval to check periodically
    const intervalId = setInterval(() => {
      if (authState.isAuthenticated && authState.tokenExpiry) {
        const timeUntilExpiry = authState.tokenExpiry - Date.now();
        const refreshThresholdMs = REFRESH_THRESHOLD_MINUTES * 60 * 1000;
        if (timeUntilExpiry < refreshThresholdMs) {
          console.log(`SpotifyAuthContext (Interval): Token nearing expiry. Attempting proactive refresh.`);
          update();
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(intervalId);
  }, [authState.isAuthenticated, authState.tokenExpiry, update]);


  const login = useCallback(() => {
    // Actual login is handled by NextAuth's signIn, typically via a UI button
    // This function could be used to trigger that UI element or directly call signIn
    console.log("SpotifyAuthContext: login() called. Ensure UI triggers signIn('spotify').");
    // For now, it's a placeholder or could be used to set connecting state if needed.
  }, []);

  const logout = useCallback(() => {
    // Actual logout is handled by NextAuth's signOut
    console.log("SpotifyAuthContext: logout() called. Ensure UI triggers signOut().");
  }, []);

  const checkSession = useCallback(async () => {
    console.log("SpotifyAuthContext: checkSession() called. Forcing session update.");
    setAuthState(prev => ({ ...prev, isConnecting: true }));
    try {
      // update() forces a session refetch which should run the JWT callback
      await update();
    } catch (e: any) {
      console.error("SpotifyAuthContext: Error during checkSession/update:", e);
      setAuthState(prev => ({ ...prev, error: e.message || "Failed to check session" }));
    } finally {
      // Status update in the main useEffect will set isConnecting to false
    }
  }, [update]);

  return (
    <SpotifyAuthContext.Provider value={{ ...authState, login, logout, checkSession }}>
      {children}
    </SpotifyAuthContext.Provider>
  );
};

export const useSpotifyAuth = (): SpotifyAuthState & SpotifyAuthActions => {
  const context = useContext(SpotifyAuthContext);
  if (context === undefined) {
    throw new Error('useSpotifyAuth must be used within a SpotifyAuthProvider');
  }
  return context;
};
