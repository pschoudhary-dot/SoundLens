'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { SpotifyTrack, SpotifyArtist, TimeRange } from '@/lib/spotify';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import TrackItem from '@/components/spotify/TrackItem';
import ArtistItem from '@/components/spotify/ArtistItem';
import HorizontalTrackItem from '@/components/spotify/HorizontalTrackItem';
import HorizontalArtistItem from '@/components/spotify/HorizontalArtistItem';
import PlaylistItem from '@/components/spotify/PlaylistItem';
import PodcastItem from '@/components/spotify/PodcastItem';
import TimeRangeSelector from '@/components/spotify/TimeRangeSelector';
import dynamic from 'next/dynamic';

// Dynamically import the SpotifyPlayer component with no SSR
const SpotifyPlayer = dynamic(
  () => import('@/components/spotify/SpotifyPlayerWrapper'),
  { ssr: false }
);
import { SpotifyPlayerProvider } from '@/contexts/SpotifyPlayerContext';
import { Music, Users, Disc3, ListMusic, Headphones } from 'lucide-react';

export default function Dashboard() {
  const { data: session, status } = useSession();

  // Log session status for debugging
  console.log('Dashboard - Session Status:', status);
  console.log('Dashboard - Session Data:', session);
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [tracksPage, setTracksPage] = useState(1);
  const [artistsPage, setArtistsPage] = useState(1);
  const [tracksHasMore, setTracksHasMore] = useState(true);
  const [artistsHasMore, setArtistsHasMore] = useState(true);
  const [loadingMoreTracks, setLoadingMoreTracks] = useState(false);
  const [loadingMoreArtists, setLoadingMoreArtists] = useState(false);

  // References for scroll containers
  const tracksContainerRef = useRef<HTMLDivElement>(null);
  const artistsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for custom JWT authentication
    const customToken = localStorage.getItem('soundlens_token');
    const userData = localStorage.getItem('soundlens_user');
    const expiryStr = localStorage.getItem('soundlens_session_expiry');

    // Check if token is expired
    if (customToken && expiryStr) {
      const expiryDate = new Date(expiryStr);
      const now = new Date();

      if (now > expiryDate) {
        console.log('Token expired, clearing session');
        // Token expired, clear it
        localStorage.removeItem('soundlens_token');
        localStorage.removeItem('soundlens_user');
        localStorage.removeItem('soundlens_session_expiry');

        // Redirect to login
        redirect('/');
        return;
      }
    }

    // Check for Spotify cookie (this is client-side, so we can't directly access httpOnly cookies)
    // Instead, we'll rely on the middleware to handle this check

    // If NextAuth is unauthenticated and we don't have a custom token, redirect
    if (status === 'unauthenticated' && !customToken) {
      // Before redirecting, check if we're coming from a Spotify auth flow
      const url = new URL(window.location.href);
      const fromSpotify = url.searchParams.get('from_spotify');

      if (!fromSpotify) {
        redirect('/');
      }
    }
  }, [status]);

  // Function to load more tracks
  const loadMoreTracks = async () => {
    if (!tracksHasMore || loadingMoreTracks) return;

    setLoadingMoreTracks(true);
    const nextPage = tracksPage + 1;
    const offset = (nextPage - 1) * 20;

    try {
      const timestamp = new Date().getTime();
      const spotifyToken = localStorage.getItem('spotify_access_token');
      const customToken = localStorage.getItem('soundlens_token');

      let headers = {};
      if (spotifyToken) {
        headers = { Authorization: `Bearer ${spotifyToken}` };
      } else if (customToken) {
        headers = { Authorization: `Bearer ${customToken}` };
      }

      const response = await axios.get(
        `/api/spotify/top-tracks?timeRange=${timeRange}&limit=20&offset=${offset}&t=${timestamp}`,
        { headers }
      );

      if (response.data.tracks && response.data.tracks.length > 0) {
        setTopTracks(prev => [...prev, ...response.data.tracks]);
        setTracksPage(nextPage);
      } else {
        setTracksHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more tracks:', err);
      setTracksHasMore(false);
    } finally {
      setLoadingMoreTracks(false);
    }
  };

  // Function to load more artists
  const loadMoreArtists = async () => {
    if (!artistsHasMore || loadingMoreArtists) return;

    setLoadingMoreArtists(true);
    const nextPage = artistsPage + 1;
    const offset = (nextPage - 1) * 20;

    try {
      const timestamp = new Date().getTime();
      const spotifyToken = localStorage.getItem('spotify_access_token');
      const customToken = localStorage.getItem('soundlens_token');

      let headers = {};
      if (spotifyToken) {
        headers = { Authorization: `Bearer ${spotifyToken}` };
      } else if (customToken) {
        headers = { Authorization: `Bearer ${customToken}` };
      }

      const response = await axios.get(
        `/api/spotify/top-artists?timeRange=${timeRange}&limit=20&offset=${offset}&t=${timestamp}`,
        { headers }
      );

      if (response.data.artists && response.data.artists.length > 0) {
        setTopArtists(prev => [...prev, ...response.data.artists]);
        setArtistsPage(nextPage);
      } else {
        setArtistsHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more artists:', err);
      setArtistsHasMore(false);
    } finally {
      setLoadingMoreArtists(false);
    }
  };

  // Add scroll event listeners for horizontal scrolling
  useEffect(() => {
    const handleTracksScroll = (e: Event) => {
      const container = e.target as HTMLElement;
      const scrollPosition = container.scrollLeft;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;

      // If we're near the end of the scroll (within 100px), load more tracks
      if (scrollWidth - (scrollPosition + clientWidth) < 100 && tracksHasMore && !loadingMoreTracks) {
        loadMoreTracks();
      }
    };

    const handleArtistsScroll = (e: Event) => {
      const container = e.target as HTMLElement;
      const scrollPosition = container.scrollLeft;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;

      // If we're near the end of the scroll (within 100px), load more artists
      if (scrollWidth - (scrollPosition + clientWidth) < 100 && artistsHasMore && !loadingMoreArtists) {
        loadMoreArtists();
      }
    };

    // Add event listeners to the scroll containers
    const tracksContainer = tracksContainerRef.current;
    const artistsContainer = artistsContainerRef.current;

    if (tracksContainer) {
      tracksContainer.addEventListener('scroll', handleTracksScroll);
    }

    if (artistsContainer) {
      artistsContainer.addEventListener('scroll', handleArtistsScroll);
    }

    // Clean up event listeners
    return () => {
      if (tracksContainer) {
        tracksContainer.removeEventListener('scroll', handleTracksScroll);
      }

      if (artistsContainer) {
        artistsContainer.removeEventListener('scroll', handleArtistsScroll);
      }
    };
  }, [tracksHasMore, artistsHasMore, loadingMoreTracks, loadingMoreArtists, timeRange]);

  useEffect(() => {
    const fetchData = async () => {
      // Allow fetching data even if NextAuth is not authenticated
      // as we might be using custom authentication or Spotify cookies

      // Check for session errors if we're using NextAuth
      if (status === 'authenticated' && session?.error) {
        console.error('Session error detected:', session.error);
        setError(`Authentication error: ${session.error}`);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log('Fetching Spotify data...');

        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();

        // Try to get Spotify token first
        const spotifyToken = localStorage.getItem('spotify_access_token');

        // Fall back to custom token if Spotify token is not available
        const customToken = localStorage.getItem('soundlens_token');

        // Create headers with the token if available
        let headers = {};
        if (spotifyToken) {
          console.log('Using Spotify token for API requests');
          headers = { Authorization: `Bearer ${spotifyToken}` };
        } else if (customToken) {
          console.log('Using custom token for API requests');
          headers = { Authorization: `Bearer ${customToken}` };
        }

        // Use Promise.allSettled instead of Promise.all to handle individual request failures
        const [
          tracksResult,
          artistsResult,
          playlistsResult,
          podcastsResult,
          recentlyPlayedResult
        ] = await Promise.allSettled([
          axios.get(`/api/spotify/top-tracks?timeRange=${timeRange}&limit=20&t=${timestamp}`, { headers }),
          axios.get(`/api/spotify/top-artists?timeRange=${timeRange}&limit=20&t=${timestamp}`, { headers }),
          axios.get(`/api/spotify/playlists?limit=5&t=${timestamp}`, { headers }),
          axios.get(`/api/spotify/podcasts?limit=5&t=${timestamp}`, { headers }),
          axios.get(`/api/spotify/recently-played?limit=10&t=${timestamp}`, { headers }),
        ]);

        // Extract responses from successful promises
        const tracksResponse = tracksResult.status === 'fulfilled' ? tracksResult.value : null;
        const artistsResponse = artistsResult.status === 'fulfilled' ? artistsResult.value : null;
        const playlistsResponse = playlistsResult.status === 'fulfilled' ? playlistsResult.value : null;
        const podcastsResponse = podcastsResult.status === 'fulfilled' ? podcastsResult.value : null;
        const recentlyPlayedResponse = recentlyPlayedResult.status === 'fulfilled' ? recentlyPlayedResult.value : null;

        // Log responses if available
        if (tracksResponse) console.log('Tracks response:', tracksResponse.status);
        if (artistsResponse) console.log('Artists response:', artistsResponse.status);
        if (playlistsResponse) console.log('Playlists response:', playlistsResponse.status);
        if (podcastsResponse) console.log('Podcasts response:', podcastsResponse.status);
        if (recentlyPlayedResponse) console.log('Recently played response:', recentlyPlayedResponse.status);

        // Process tracks data
        if (tracksResponse?.data?.tracks) {
          console.log(`Received ${tracksResponse.data.tracks.length} tracks`);
          setTopTracks(tracksResponse.data.tracks);
        } else {
          console.warn('No tracks data in response');
          setTopTracks([]);
        }

        // Process artists data
        if (artistsResponse?.data?.artists) {
          console.log(`Received ${artistsResponse.data.artists.length} artists`);
          setTopArtists(artistsResponse.data.artists);
        } else {
          console.warn('No artists data in response');
          setTopArtists([]);
        }

        // Process playlists data
        if (playlistsResponse?.data?.playlists) {
          console.log(`Received ${playlistsResponse.data.playlists.length} playlists`);
          setPlaylists(playlistsResponse.data.playlists);
        } else {
          console.warn('No playlists data in response');
          setPlaylists([]);
        }

        // Process podcasts data
        if (podcastsResponse?.data?.episodes) {
          console.log(`Received ${podcastsResponse.data.episodes.length} podcast episodes`);
          setPodcasts(podcastsResponse.data.episodes);
        } else {
          console.warn('No podcast episodes data in response or insufficient permissions');
          setPodcasts([]);
        }

        // Process recently played data
        if (recentlyPlayedResponse?.data?.recentlyPlayed) {
          console.log(`Received ${recentlyPlayedResponse.data.recentlyPlayed.length} recently played tracks`);
          setRecentlyPlayed(recentlyPlayedResponse.data.recentlyPlayed);

          // Store in localStorage for SimpleSpotifyPlayer to use
          try {
            localStorage.setItem('soundlens_recent_tracks', JSON.stringify(recentlyPlayedResponse.data.recentlyPlayed));
          } catch (storageError) {
            console.error('Error saving recent tracks to localStorage:', storageError);
          }
        } else if (recentlyPlayedResponse?.data?.tracks) {
          console.log(`Received ${recentlyPlayedResponse.data.tracks.length} recently played tracks`);
          setRecentlyPlayed(recentlyPlayedResponse.data.tracks);

          // Store in localStorage for SimpleSpotifyPlayer to use
          try {
            localStorage.setItem('soundlens_recent_tracks', JSON.stringify(recentlyPlayedResponse.data.tracks));
          } catch (storageError) {
            console.error('Error saving recent tracks to localStorage:', storageError);
          }
        } else {
          console.warn('No recently played tracks data in response');
          setRecentlyPlayed([]);
        }
      } catch (err: any) {
        console.error('Error fetching Spotify data:', err);

        // Get detailed error information
        if (err.response) {
          console.error('Response status:', err.response.status);
          console.error('Response data:', err.response.data);
        }

        const errorMessage = err.response?.data?.error || err.message || 'Failed to load data';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    // Check if we're coming from Spotify auth flow
    const url = new URL(window.location.href);
    const fromSpotify = url.searchParams.get('from_spotify');

    // If we're authenticated with NextAuth or coming from Spotify auth, or have a custom token, fetch data
    const customToken = localStorage.getItem('soundlens_token');
    if (status === 'authenticated' || fromSpotify || customToken) {
      fetchData();
    }
  }, [timeRange, status, session]);

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    // Reset pagination when time range changes
    setTracksPage(1);
    setArtistsPage(1);
    setTracksHasMore(true);
    setArtistsHasMore(true);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  // SpotifyPlayerWrapper now handles all the error checking and token validation

  return (
    <SpotifyPlayerProvider>
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow container mx-auto px-4 py-8 pb-24">
          <h1 className="text-3xl font-bold mb-6">Your Spotify Stats</h1>

          {/* Music Reel moved to its own page */}

          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Time Period</h2>
              <Link href="/music-reel" className="flex items-center gap-2 text-green-500 hover:text-green-400 transition-colors">
                <Disc3 size={20} />
                <span>Go to Music Reel</span>
              </Link>
            </div>

            <div className="mb-6">
              <TimeRangeSelector selectedRange={timeRange} onChange={handleTimeRangeChange} />
            </div>

            <hr className="border-white/10 my-6" />
          </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
          </div>
        ) : error ? (
          <Card className="p-6 text-center">
            <p className="text-red-400 mb-2">Error: {error}</p>
            <p>Please try again later or log out and log back in.</p>
          </Card>
        ) : (
          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Music className="text-green-500 mr-2" size={24} />
                Top Tracks
              </h2>
              <Card className="overflow-x-auto">
                <div ref={tracksContainerRef} className="flex space-x-4 p-2 pb-4 min-w-full">
                  {topTracks.map((track, index) => (
                    <HorizontalTrackItem key={track.id} track={track} rank={index + 1} />
                  ))}
                  {topTracks.length === 0 && (
                    <p className="text-center py-6 text-white/70">No tracks found for this time period.</p>
                  )}
                  {loadingMoreTracks && (
                    <div className="flex-shrink-0 w-40 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
                    </div>
                  )}
                </div>
                <div className="text-xs text-white/50 text-center mt-1 mb-2">
                  <span>← Scroll horizontally to see more →</span>
                </div>
              </Card>
            </section>

            <hr className="border-white/10 my-8" />

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Users className="text-green-500 mr-2" size={24} />
                Top Artists
              </h2>
              <Card className="overflow-x-auto">
                <div ref={artistsContainerRef} className="flex space-x-4 p-2 pb-4 min-w-full">
                  {topArtists.map((artist, index) => (
                    <HorizontalArtistItem key={artist.id} artist={artist} rank={index + 1} />
                  ))}
                  {topArtists.length === 0 && (
                    <p className="text-center py-6 text-white/70">No artists found for this time period.</p>
                  )}
                  {loadingMoreArtists && (
                    <div className="flex-shrink-0 w-40 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
                    </div>
                  )}
                </div>
                <div className="text-xs text-white/50 text-center mt-1 mb-2">
                  <span>← Scroll horizontally to see more →</span>
                </div>
              </Card>
            </section>

            <hr className="border-white/10 my-8" />

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <ListMusic className="text-green-500 mr-2" size={24} />
                Your Playlists
              </h2>
              <Card className="overflow-hidden">
                <div>
                  {playlists.map((playlist, index) => (
                    <PlaylistItem key={playlist.id} playlist={playlist} rank={index + 1} />
                  ))}
                  {playlists.length === 0 && (
                    <p className="text-center py-6 text-white/70">No playlists found.</p>
                  )}
                </div>
              </Card>
            </section>

            <hr className="border-white/10 my-8" />

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Headphones className="text-green-500 mr-2" size={24} />
                Your Podcasts
              </h2>
              <Card className="overflow-hidden">
                <div>
                  {podcasts.map((episode, index) => (
                    <PodcastItem key={episode.id} episode={episode} rank={index + 1} />
                  ))}
                  {podcasts.length === 0 && (
                    <p className="text-center py-6 text-white/70">No podcast episodes found.</p>
                  )}
                </div>
              </Card>
            </section>

            <hr className="border-white/10 my-8" />

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Disc3 className="text-green-500 mr-2" size={24} />
                Recently Played
              </h2>
              <Card className="overflow-x-auto">
                <div className="flex space-x-4 p-2 pb-4 min-w-full">
                  {recentlyPlayed.map((track, index) => (
                    <HorizontalTrackItem key={`${track.id}-${index}`} track={track} rank={index + 1} />
                  ))}
                  {recentlyPlayed.length === 0 && (
                    <p className="text-center py-6 text-white/70">No recently played tracks found.</p>
                  )}
                </div>
                <div className="text-xs text-white/50 text-center mt-1 mb-2">
                  <span>← Scroll horizontally to see more →</span>
                </div>
              </Card>
            </section>
          </div>
        )}
      </main>

      <Footer />

      {/* Spotify Player */}
      <SpotifyPlayer />
    </div>
    </SpotifyPlayerProvider>
  );
}