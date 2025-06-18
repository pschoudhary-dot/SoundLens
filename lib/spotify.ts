import axios from 'axios';
import { getSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const BASE_URL = 'https://api.spotify.com/v1';

export type TimeRange = 'short_term' | 'medium_term' | 'long_term' | 'today' | 'this_week' | 'this_month';

export interface SpotifyArtist {
  id: string;
  name: string;
  images: { url: string; height: number; width: number }[];
  genres: string[];
  popularity: number;
  external_urls?: {
    spotify: string;
  };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  album: {
    id: string;
    name: string;
    images: { url: string; height: number; width: number }[];
  };
  artists: {
    id: string;
    name: string;
  }[];
  popularity: number;
  duration_ms: number;
  preview_url?: string;
  external_urls?: {
    spotify: string;
  };
}

export const getSpotifyApi = async () => {
  try {
    console.log('Getting Spotify API client...');
    const session = await getSession();

    console.log('Session available:', !!session);
    console.log('Access token available:', !!session?.accessToken);

    if (!session) {
      throw new Error('No session available');
    }

    if (session.error) {
      throw new Error(`Session error: ${session.error}`);
    }

    if (!session.accessToken) {
      throw new Error('No access token available');
    }

    const api = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor to handle token expiration
    // Add response interceptor
    api.interceptors.response.use(
      (response) => {
        console.log(`Spotify API response: ${response.status} ${response.config.url?.substring(response.config.baseURL?.length || 0)}`);
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        originalRequest._currentRetry = originalRequest._currentRetry || 0;

        console.error(`Spotify API error: ${error.message} on URL: ${originalRequest.url}`);
        if (error.response) {
          console.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
        }


        // Handle 401 Unauthorized: Token refresh
        if (error.response?.status === 401 && !originalRequest._tokenRefreshAttempted) {
          console.log(`Attempting token refresh due to 401. Original request: ${originalRequest.url}`);
          originalRequest._tokenRefreshAttempted = true; // Mark that we've attempted refresh for this request

          try {
            const currentSessionDetails = originalRequest._currentSession ? `Current session access token present: ${!!originalRequest._currentSession.accessToken}, error: ${originalRequest._currentSession.error}` : "No current session info on request.";
            console.log(`Details before getSession call: ${currentSessionDetails}`);

            const newSession = await getSession(); // getSession() should pick up refreshed token from JWT callback if it ran

            if (newSession?.accessToken) {
              console.log(`New session obtained. Access token present: ${!!newSession.accessToken}. New expiry: ${newSession.expires}`);
              api.defaults.headers.common['Authorization'] = `Bearer ${newSession.accessToken}`;
              originalRequest.headers['Authorization'] = `Bearer ${newSession.accessToken}`;
              console.log(`Retrying original request ${originalRequest.url} with new token.`);
              return api(originalRequest); // Retry with the global axios instance to ensure future requests also use the new token
            } else {
              console.error(`Failed to get new access token after 401. New session: ${JSON.stringify(newSession)}`);
              // If session is null or has an error, it might indicate a more serious auth issue (e.g. refresh token revoked)
              if (newSession?.error) {
                 console.error(`NextAuth session error during refresh: ${newSession.error}`);
                 // Potentially redirect to login or show a global error
              }
              return Promise.reject(new Error('Failed to refresh access token after 401.'));
            }
          } catch (refreshError: any) {
            console.error(`Error during token refresh process: ${refreshError.message}`, refreshError);
            return Promise.reject(refreshError);
          }
        }

        // Handle Retries for 429 (Too Many Requests) and 5xx Server Errors
        const retryStatusCodes = [429, 500, 502, 503, 504];
        if (retryStatusCodes.includes(error.response?.status) && originalRequest._currentRetry < (originalRequest._maxRetries || 3)) {
          originalRequest._currentRetry++;
          const delay = Math.pow(2, originalRequest._currentRetry -1) * 1000; // Exponential backoff (1s, 2s, 4s...)
          console.log(`Retry attempt ${originalRequest._currentRetry} for ${originalRequest.url} after ${delay}ms due to ${error.response.status}`);

          return new Promise(resolve => setTimeout(() => resolve(api(originalRequest)), delay));
        }

        console.error(`Spotify API error not handled by interceptors or retries exhausted for ${originalRequest.url}:`, error);
        return Promise.reject(error);
      }
    );
    // Store current session on request config for logging in interceptor
    api.interceptors.request.use(async (config) => {
      if (!config._currentSession) {
        const session = await getSession(); // Get current session state before request
        if (session) {
          (config as any)._currentSession = { accessToken: session.accessToken, error: session.error, expires: session.expires };
        }
      }
      return config;
    }, (error) => {
      return Promise.reject(error);
    });

    console.log('Spotify API client created successfully with interceptors.');
    return api;
  } catch (error) {
    console.error('Error creating Spotify API client:', error);
    throw error;
  }
};

export const getTopTracks = async (timeRange: TimeRange = 'medium_term', limit: number = 5): Promise<SpotifyTrack[]> => {
  const endpoint = '/me/top/tracks';
  console.log(`Getting top tracks (timeRange: ${timeRange}, limit: ${limit}) from ${endpoint}...`);
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
      console.error(`Error in getTopTracks: No valid session or access token. timeRange=${timeRange}, limit=${limit}`);
      throw new Error('Authentication required for getTopTracks');
    }

    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      params: { time_range: timeRange, limit: limit },
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.data.items) {
      console.warn(`No items in top tracks response from ${endpoint}. timeRange=${timeRange}, limit=${limit}, data:`, response.data);
      return [];
    }
    console.log(`Retrieved ${response.data.items.length} top tracks from ${endpoint}. timeRange=${timeRange}, limit=${limit}`);
    return response.data.items;
  } catch (error: any) {
    console.error(`Error in getTopTracks (endpoint: ${endpoint}, timeRange: ${timeRange}, limit: ${limit}):`);
    if (error.response) {
      console.error(`Spotify API Error: Status ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error('Spotify API Error: No response received from server.', error.request);
    } else {
      console.error('Spotify API Error: Error setting up request.', error.message);
    }
    throw error; // Re-throw the error to be handled by the calling function
  }
};

export const getTopArtists = async (timeRange: TimeRange = 'medium_term', limit: number = 5): Promise<SpotifyArtist[]> => {
  const endpoint = '/me/top/artists';
  console.log(`Getting top artists (timeRange: ${timeRange}, limit: ${limit}) from ${endpoint}...`);
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
      console.error(`Error in getTopArtists: No valid session or access token. timeRange=${timeRange}, limit=${limit}`);
      throw new Error('Authentication required for getTopArtists');
    }

    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      params: { time_range: timeRange, limit: limit },
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.data.items) {
      console.warn(`No items in top artists response from ${endpoint}. timeRange=${timeRange}, limit=${limit}, data:`, response.data);
      return [];
    }
    console.log(`Retrieved ${response.data.items.length} top artists from ${endpoint}. timeRange=${timeRange}, limit=${limit}`);
    return response.data.items;
  } catch (error: any) {
    console.error(`Error in getTopArtists (endpoint: ${endpoint}, timeRange: ${timeRange}, limit: ${limit}):`);
    if (error.response) {
      console.error(`Spotify API Error: Status ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error('Spotify API Error: No response received from server.', error.request);
    } else {
      console.error('Spotify API Error: Error setting up request.', error.message);
    }
    throw error; // Re-throw the error to be handled by the calling function
  }
};
