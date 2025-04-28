'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import axios from 'axios';
import { SpotifyTrack, SpotifyArtist, TimeRange } from '@/lib/spotify';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import TrackItem from '@/components/spotify/TrackItem';
import ArtistItem from '@/components/spotify/ArtistItem';
import TimeRangeSelector from '@/components/spotify/TimeRangeSelector';
import { Music, Users } from 'lucide-react';

export default function Dashboard() {
  const { data: session, status } = useSession();

  // Log session status for debugging
  console.log('Dashboard - Session Status:', status);
  console.log('Dashboard - Session Data:', session);
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/');
    }
  }, [status]);

  useEffect(() => {
    const fetchData = async () => {
      if (status !== 'authenticated') return;

      // Check for session errors
      if (session?.error) {
        console.error('Session error detected:', session.error);
        setError(`Authentication error: ${session.error}`);
        setIsLoading(false);
        return;
      }

      if (!session?.accessToken) {
        console.error('No access token available');
        setError('No access token available. Please log in again.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log('Fetching Spotify data...');

        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();

        const [tracksResponse, artistsResponse] = await Promise.all([
          axios.get(`/api/spotify/top-tracks?timeRange=${timeRange}&limit=5&t=${timestamp}`),
          axios.get(`/api/spotify/top-artists?timeRange=${timeRange}&limit=5&t=${timestamp}`),
        ]);

        console.log('Tracks response:', tracksResponse.status);
        console.log('Artists response:', artistsResponse.status);

        if (tracksResponse.data.tracks) {
          console.log(`Received ${tracksResponse.data.tracks.length} tracks`);
          setTopTracks(tracksResponse.data.tracks);
        } else {
          console.warn('No tracks data in response');
          setTopTracks([]);
        }

        if (artistsResponse.data.artists) {
          console.log(`Received ${artistsResponse.data.artists.length} artists`);
          setTopArtists(artistsResponse.data.artists);
        } else {
          console.warn('No artists data in response');
          setTopArtists([]);
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

    fetchData();
  }, [timeRange, status, session]);

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Spotify Stats</h1>

        <TimeRangeSelector selectedRange={timeRange} onChange={handleTimeRangeChange} />

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-center mb-4">
                <Music className="text-accent mr-2" size={20} />
                <h2 className="text-xl font-bold">Top Tracks</h2>
              </div>
              <div className="space-y-2">
                {topTracks.map((track, index) => (
                  <TrackItem key={track.id} track={track} rank={index + 1} />
                ))}
                {topTracks.length === 0 && (
                  <p className="text-center py-4 text-secondary/70">No tracks found for this time period.</p>
                )}
              </div>
            </Card>

            <Card>
              <div className="flex items-center mb-4">
                <Users className="text-accent mr-2" size={20} />
                <h2 className="text-xl font-bold">Top Artists</h2>
              </div>
              <div className="space-y-2">
                {topArtists.map((artist, index) => (
                  <ArtistItem key={artist.id} artist={artist} rank={index + 1} />
                ))}
                {topArtists.length === 0 && (
                  <p className="text-center py-4 text-secondary/70">No artists found for this time period.</p>
                )}
              </div>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
