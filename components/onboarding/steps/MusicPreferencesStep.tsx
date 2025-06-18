'use client';

import React, { useState, useEffect } from 'react';
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Badge } from "../../../components/ui/badge";
import { X, Search, PlusCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface MusicPreferencesStepProps {
  formData: {
    favoriteGenres: string[];
    favoriteArtists: string[];
    preferredPlatform: string;
  };
  updateFormData: (data: Partial<MusicPreferencesStepProps['formData']>) => void;
}

const genres = [
  'Pop', 'Rock', 'Hip Hop', 'R&B', 'Country', 'Electronic', 'Jazz',
  'Classical', 'Metal', 'Folk', 'Indie', 'Blues', 'Reggae', 'Punk',
  'Soul', 'Funk', 'Disco', 'Alternative', 'K-pop', 'Latin'
];

// Mock popular artists (in a real app, these would come from Spotify API)
const popularArtists = [
  'Taylor Swift', 'The Weeknd', 'Bad Bunny', 'Drake', 'Billie Eilish',
  'BTS', 'Dua Lipa', 'Ed Sheeran', 'Ariana Grande', 'Post Malone',
  'Justin Bieber', 'Harry Styles', 'Olivia Rodrigo', 'Kendrick Lamar',
  'Travis Scott', 'Beyoncé', 'Adele', 'Coldplay', 'Rihanna', 'Lady Gaga'
];

const MusicPreferencesStep: React.FC<MusicPreferencesStepProps> = ({ formData, updateFormData }) => {
  const [artistSearch, setArtistSearch] = useState('');
  const [filteredArtists, setFilteredArtists] = useState<string[]>([]);

  useEffect(() => {
    if (artistSearch.trim()) {
      const filtered = popularArtists.filter(artist =>
        artist.toLowerCase().includes(artistSearch.toLowerCase()) &&
        !formData.favoriteArtists.includes(artist)
      );
      setFilteredArtists(filtered);
    } else {
      setFilteredArtists([]);
    }
  }, [artistSearch, formData.favoriteArtists]);

  const handleGenreToggle = (genre: string) => {
    const updatedGenres = formData.favoriteGenres.includes(genre)
      ? formData.favoriteGenres.filter(g => g !== genre)
      : [...formData.favoriteGenres, genre];

    updateFormData({ favoriteGenres: updatedGenres });
  };

  const handleAddArtist = (artist: string) => {
    if (!formData.favoriteArtists.includes(artist)) {
      updateFormData({
        favoriteArtists: [...formData.favoriteArtists, artist]
      });
      setArtistSearch('');
    }
  };

  const handleRemoveArtist = (artist: string) => {
    updateFormData({
      favoriteArtists: formData.favoriteArtists.filter(a => a !== artist)
    });
  };

  const handlePlatformChange = (value: string) => {
    updateFormData({ preferredPlatform: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Your Music Preferences</h2>
        <p className="text-white/70 mt-2">
          Tell us about the music you love
        </p>
      </div>

      {/* Genre Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white/80 mb-3">
          Select your favorite genres (select all that apply)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {genres.map(genre => (
            <button
              key={genre}
              type="button"
              onClick={() => handleGenreToggle(genre)}
              className={cn(
                "py-2 px-3 rounded-md text-sm font-medium transition-colors",
                formData.favoriteGenres.includes(genre)
                  ? "bg-[#22c55e] text-white"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              )}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Artist Selection with Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white/80 mb-3">
          Add your favorite artists
        </label>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search for artists..."
            value={artistSearch}
            onChange={(e) => setArtistSearch(e.target.value)}
            className="w-full bg-white/10 border-white/20 text-white pr-10"
          />
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-white/60" />
        </div>

        {artistSearch && filteredArtists.length > 0 && (
          <div className="mt-2 bg-white/10 rounded-md max-h-40 overflow-y-auto">
            {filteredArtists.map((artist) => (
              <button
                key={artist}
                type="button"
                onClick={() => handleAddArtist(artist)}
                className="w-full text-left px-3 py-2 hover:bg-white/20 text-white text-sm"
              >
                <div className="flex items-center">
                  <span>{artist}</span>
                  <PlusCircle className="ml-auto h-4 w-4 text-white/60" />
                </div>
              </button>
            ))}
          </div>
        )}

        {formData.favoriteArtists.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.favoriteArtists.map(artist => (
              <Badge key={artist} className="bg-white/10 text-white hover:bg-white/20">
                {artist}
                <button
                  type="button"
                  onClick={() => handleRemoveArtist(artist)}
                  className="ml-1 text-white/60 hover:text-white"
                  title={`Remove ${artist}`}
                  aria-label={`Remove ${artist}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Music Platform Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white/80 mb-3">
          Preferred Music Platform
        </label>
        <Select value={formData.preferredPlatform} onValueChange={handlePlatformChange}>
          <SelectTrigger className="w-full bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Select your preferred platform" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 text-white">
            <SelectItem value="spotify">Spotify</SelectItem>
            <SelectItem value="youtube">YouTube Music</SelectItem>
            <SelectItem value="apple">Apple Music</SelectItem>
            <SelectItem value="amazon">Amazon Music</SelectItem>
            <SelectItem value="tidal">Tidal</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default MusicPreferencesStep;
