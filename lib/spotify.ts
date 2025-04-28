import axios from 'axios';
import { getSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const BASE_URL = 'https://api.spotify.com/v1';

export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

export interface SpotifyArtist {
  id: string;
  name: string;
  images: { url: string; height: number; width: number }[];
  genres: string[];
  popularity: number;
}

export interface SpotifyTrack {
  id: string;
  name: string;
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
    api.interceptors.response.use(
      (response) => {
        console.log(`Spotify API response: ${response.status} ${response.config.url}`);
        return response;
      },
      async (error) => {
        console.error('Spotify API error:', error.message);
        console.error('Status:', error.response?.status);
        console.error('URL:', error.config?.url);

        const originalRequest = error.config;

        // If error is 401 Unauthorized and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          console.log('Attempting to refresh token due to 401 error');
          originalRequest._retry = true;

          try {
            // Force a session refresh
            const newSession = await getSession({ force: true });

            if (newSession?.accessToken) {
              console.log('Token refreshed successfully');
              // Update the authorization header
              originalRequest.headers['Authorization'] = `Bearer ${newSession.accessToken}`;
              return axios(originalRequest);
            } else {
              console.error('Failed to get new access token');
              throw new Error('Failed to refresh access token');
            }
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    console.log('Spotify API client created successfully');
    return api;
  } catch (error) {
    console.error('Error creating Spotify API client:', error);
    throw error;
  }
};

export const getTopTracks = async (timeRange: TimeRange = 'medium_term', limit: number = 5): Promise<SpotifyTrack[]> => {
  try {
    console.log(`Getting top tracks (timeRange: ${timeRange}, limit: ${limit})...`);

    // Get server session for server-side API calls
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      console.error('No valid session or access token available');
      throw new Error('Authentication required');
    }

    // Make direct API call using the access token
    const response = await axios.get(`${BASE_URL}/me/top/tracks`, {
      params: {
        time_range: timeRange,
        limit: limit
      },
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.data.items) {
      console.warn('No items in top tracks response:', response.data);
      return [];
    }

    console.log(`Retrieved ${response.data.items.length} top tracks`);
    return response.data.items;
  } catch (error) {
    console.error('Error getting top tracks:', error);
    throw error;
  }
};

export const getTopArtists = async (timeRange: TimeRange = 'medium_term', limit: number = 5): Promise<SpotifyArtist[]> => {
  try {
    console.log(`Getting top artists (timeRange: ${timeRange}, limit: ${limit})...`);

    // Get server session for server-side API calls
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      console.error('No valid session or access token available');
      throw new Error('Authentication required');
    }

    // Make direct API call using the access token
    const response = await axios.get(`${BASE_URL}/me/top/artists`, {
      params: {
        time_range: timeRange,
        limit: limit
      },
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.data.items) {
      console.warn('No items in top artists response:', response.data);
      return [];
    }

    console.log(`Retrieved ${response.data.items.length} top artists`);
    return response.data.items;
  } catch (error) {
    console.error('Error getting top artists:', error);
    throw error;
  }
};
