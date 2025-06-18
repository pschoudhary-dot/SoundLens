'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react'; // Keep for initial status, redirect logic if needed
import { useSpotifyAuth } from '@/contexts/SpotifyAuthContext';
import SpotifyReconnectPrompt from '@/components/auth/SpotifyReconnectPrompt';
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
import HorizontalTrackItemSkeleton from '@/components/spotify/HorizontalTrackItemSkeleton';
import HorizontalArtistItemSkeleton from '@/components/spotify/HorizontalArtistItemSkeleton';
import SpotifyTokenDebug from '@/components/debug/SpotifyTokenDebug';

export default function Dashboard() {
  const { data: session, status: nextAuthStatus } = useSession(); // nextAuthStatus for initial load/redirect
  const {
    isAuthenticated: spotifyIsAuthenticated,
    isConnecting: spotifyIsConnecting,
    error: spotifyAuthError,
    accessToken: spotifyAccessToken
  } = useSpotifyAuth();

  // Log session status for debugging
  console.log('Dashboard - NextAuth Status:', nextAuthStatus);
  console.log('Dashboard - NextAuth Session Data:', session);
  console.log('Dashboard - SpotifyAuthContext State:', { spotifyIsAuthenticated, spotifyIsConnecting, spotifyAuthError, spotifyAccessTokenPresent: !!spotifyAccessToken });

  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<any[]>([]);

  // Combined loading state
  const [isDataLoading, setIsDataLoading] = useState(true);
  // Local error state for data fetching issues, distinct from spotifyAuthError
  const [dataFetchError, setDataFetchError] = useState<string | null>(null);

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
    if (nextAuthStatus === 'unauthenticated' && !customToken) {
      // Before redirecting, check if we're coming from a Spotify auth flow
      const url = new URL(window.location.href);
      const fromSpotify = url.searchParams.get('from_spotify');

      if (!fromSpotify) {
        console.log("Dashboard: Redirecting to / due to unauthenticated status and no custom token.");
        redirect('/');
      }
    }
  }, [nextAuthStatus]);

  // Function to load more tracks
  const loadMoreTracks = async () => {
    if (!tracksHasMore || loadingMoreTracks) return;

    setLoadingMoreTracks(true);
    const nextPage = tracksPage + 1;
    const offset = (nextPage - 1) * 20;

    try {
      const timestamp = new Date().getTime();
      // Use spotifyAccessToken from context if available and authenticated, otherwise fallback mechanism
      const tokenToUse = spotifyIsAuthenticated && spotifyAccessToken ? spotifyAccessToken : localStorage.getItem('spotify_access_token');
      const customToken = localStorage.getItem('soundlens_token');

      let headers = {};
      if (tokenToUse) {
        headers = { Authorization: `Bearer ${tokenToUse}` };
      } else if (customToken) {
        headers = { Authorization: `Bearer ${customToken}` };
      } else {
        console.warn("LoadMoreTracks: No token available for authenticated request.");
        // Potentially set dataFetchError or rely on API to return 401
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
    } catch (err: any) {
      console.error('Error loading more tracks:', err);
      if (err.response?.status === 401) {
        setDataFetchError("Spotify authentication is required to load more tracks. Please reconnect.");
        // spotifyAuthError should also be set by context if token refresh failed
      }
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
      const tokenToUse = spotifyIsAuthenticated && spotifyAccessToken ? spotifyAccessToken : localStorage.getItem('spotify_access_token');
      const customToken = localStorage.getItem('soundlens_token');

      let headers = {};
      if (tokenToUse) {
        headers = { Authorization: `Bearer ${tokenToUse}` };
      } else if (customToken) {
        headers = { Authorization: `Bearer ${customToken}` };
      } else {
        console.warn("LoadMoreArtists: No token available for authenticated request.");
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
    } catch (err: any) {
      console.error('Error loading more artists:', err);
      if (err.response?.status === 401) {
        setDataFetchError("Spotify authentication is required to load more artists. Please reconnect.");
      }
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
      if (!spotifyIsAuthenticated && !localStorage.getItem('soundlens_token')) {
        console.log("Dashboard fetchData: Not authenticated with Spotify and no custom token. Aborting fetch.");
        // If there's a spotifyAuthError, it will be displayed by the main error handling logic.
        // If simply not connected yet, UI should reflect that.
        setIsDataLoading(false);
        return;
      }

      // If there's a Spotify auth error from context, prioritize showing that.
      if (spotifyAuthError) {
        console.error('Dashboard fetchData: Spotify Auth Error from context:', spotifyAuthError);
        setDataFetchError(spotifyAuthError); // Let main error display handle this
        setIsDataLoading(false);
        return;
      }

      setIsDataLoading(true);
      setDataFetchError(null);

      try {
        console.log('Fetching Spotify data...');
        const timestamp = new Date().getTime();
        const tokenToUse = spotifyAccessToken || localStorage.getItem('spotify_access_token');
        const customToken = localStorage.getItem('soundlens_token');

        let headers = {};
        if (tokenToUse) {
          console.log('Using Spotify token (from context or localStorage) for API requests');
          headers = { Authorization: `Bearer ${tokenToUse}` };
        } else if (customToken) {
          console.log('Using custom token for API requests');
          headers = { Authorization: `Bearer ${customToken}` };
        } else {
          // This case should ideally be caught by the initial !spotifyIsAuthenticated check if no custom token
          console.warn("FetchData: No token available for API requests. Data fetching will likely fail or return public data.");
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

        const errorMessage = err.response?.data?.error?.message || err.response?.data?.error || err.message || 'Failed to load data';

        if (err.response?.status === 401 ) {
          setDataFetchError(`Spotify authentication error: ${errorMessage}. Please try reconnecting.`);
          // This will often be coupled with spotifyAuthError from context if token refresh failed.
        } else {
          setDataFetchError(`Failed to load some Spotify data: ${errorMessage}`);
        }
        console.error('Full error object during fetchData:', err);
      } finally {
        setIsDataLoading(false);
      }
    };

    // Fetch data if Spotify is authenticated (via context) or if a custom token exists.
    // The spotifyIsConnecting state is also implicitly handled:
    // - If connecting, data won't be fetched yet.
    // - Once connected (spotifyIsAuthenticated becomes true), this effect runs.
    // - If connection fails (spotifyAuthError is set), fetchData will see this and abort/set error.
    const customToken = localStorage.getItem('soundlens_token');
    if (spotifyIsAuthenticated || customToken) {
      fetchData();
    } else if (!spotifyIsConnecting && !customToken) {
      // If not connecting, not authenticated, and no custom token, set loading to false.
      // UI should then show connect prompt or relevant message.
      setIsDataLoading(false);
    }
  }, [timeRange, spotifyIsAuthenticated, spotifyAccessToken, spotifyIsConnecting, spotifyAuthError]);

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    // Reset pagination when time range changes
    setTracksPage(1);
    setArtistsPage(1);
    setTracksHasMore(true);
    setArtistsHasMore(true);
  };

  // Display loading spinner if NextAuth is loading or Spotify context is connecting
  if (nextAuthStatus === 'loading' || spotifyIsConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        <p className="ml-3 text-lg">Connecting to services...</p>
      </div>
    );
  }

  // If there's a Spotify authentication error from the context, show reconnect prompt
  if (spotifyAuthError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <Card className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-400">Spotify Connection Error</h1>
            <p className="mb-4">{spotifyAuthError}</p>
            <SpotifyReconnectPrompt />
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // If not authenticated with Spotify and no custom token, prompt to connect (if applicable)
  // This is a fallback if redirect hasn't occurred or if user lands here directly somehow.
  if (!spotifyIsAuthenticated && !localStorage.getItem('soundlens_token') && !spotifyIsConnecting) {
     return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <Card className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Connect to Spotify</h1>
            <p className="mb-4">Please connect your Spotify account to view your dashboard.</p>
            {/* This will trigger NextAuth sign-in, then SpotifyAuthContext will update */}
            <button
              onClick={() => signIn('spotify')}
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Connect Spotify
            </button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <SpotifyPlayerProvider>
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow container mx-auto px-4 py-8 pb-24">
          <h1 className="text-3xl font-bold mb-6">Your Spotify Dashboard</h1>

          {/* Display data fetch error prominently if it occurs, potentially with reconnect prompt */}
          {dataFetchError && (
            <Card className="p-6 text-center mb-6 bg-red-900/30 border-red-700">
              <p className="text-red-400 mb-2">Error fetching data: {dataFetchError}</p>
              {(dataFetchError.includes("authentication") || dataFetchError.includes("401")) && <SpotifyReconnectPrompt />}
              <p className="text-sm text-white/60 mt-2">Some data may not be available. Please try refreshing or reconnecting Spotify.</p>
            </Card>
          )}

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

        {isDataLoading && !dataFetchError && !spotifyAuthError ? (
          // Show Skeletons when data is loading, and no auth/data errors are present
          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Music className="text-green-500 mr-2" size={24} />
                Top Tracks
              </h2>
              <div className="flex space-x-4 p-2 pb-4 min-w-full overflow-x-auto">
                {Array.from({ length: 5 }).map((_, index) => (
                  <HorizontalTrackItemSkeleton key={`track-skel-${index}`} />
                ))}
              </div>
            </section>
            <hr className="border-white/10 my-8" />
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Users className="text-green-500 mr-2" size={24} />
                Top Artists
              </h2>
              <div className="flex space-x-4 p-2 pb-4 min-w-full overflow-x-auto">
                {Array.from({ length: 5 }).map((_, index) => (
                  <HorizontalArtistItemSkeleton key={`artist-skel-${index}`} />
                ))}
              </div>
            </section>
            {/* TODO: Consider adding skeletons for Playlists, Podcasts, Recently Played if desired */}
          </div>
        ) : !isDataLoading && !topTracks.length && !topArtists.length && !spotifyAuthError && !dataFetchError && spotifyIsAuthenticated ? (
           <Card className="p-6 text-center">
             <p className="text-xl">No data available for the selected period, or your Spotify activity is low.</p>
             <p className="text-white/70">Try selecting a different time range or check back after using Spotify more.</p>
           </Card>
        ) : (
          // Only render sections if not initial data loading and no major auth error
          // Individual sections can still be empty if their specific data failed or is empty.
          <div className="space-y-10">
            {/* Top Tracks Section */}
            {(topTracks.length > 0 || isDataLoading) && (
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
                  {topTracks.length === 0 && !isDataLoading && (
                    <p className="text-center py-6 text-white/70 w-full">No tracks found for this time period.</p>
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
                  {topArtists.length === 0 && !isDataLoading && (
                    <p className="text-center py-6 text-white/70 w-full">No artists found for this time period.</p>
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

            </section>
            )}

            {/* Top Artists Section */}
            {(topArtists.length > 0 || isDataLoading) && (
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
                  {topArtists.length === 0 && !isDataLoading && (
                    <p className="text-center py-6 text-white/70 w-full">No artists found for this time period.</p>
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
            )}

            {/* Playlists, Podcasts, Recently Played Sections - Render if data exists or still loading */}
            {(playlists.length > 0 || isDataLoading) && (
            <>
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
                    {playlists.length === 0 && !isDataLoading && (
                      <p className="text-center py-6 text-white/70">No playlists found.</p>
                    )}
                  </div>
                </Card>
              </section>
            </>
            )}

            {(podcasts.length > 0 || isDataLoading) && (
            <>
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
                    {podcasts.length === 0 && !isDataLoading && (
                      <p className="text-center py-6 text-white/70">No podcast episodes found.</p>
                    )}
                  </div>
                </Card>
              </section>
            </>
            )}

            {(recentlyPlayed.length > 0 || isDataLoading) && (
            <>
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
                    {recentlyPlayed.length === 0 && !isDataLoading && (
                      <p className="text-center py-6 text-white/70 w-full">No recently played tracks found.</p>
                    )}
                  </div>
                  <div className="text-xs text-white/50 text-center mt-1 mb-2">
                    <span>← Scroll horizontally to see more →</span>
                  </div>
                </Card>
              </section>
            </>
            )}
          </div>
        )}
      </main>

      <Footer />

      {/* Conditionally render SpotifyPlayer if authenticated, otherwise it might try to init SDK without token */}
      {spotifyIsAuthenticated && <SpotifyPlayer />}

      {/* Spotify Auth Debug Component - Renders only in development */}
      <SpotifyTokenDebug />
    </div>
    </SpotifyPlayerProvider>
  );
}
      <SpotifyPlayer />
    </div>
    </SpotifyPlayerProvider>
  );
}