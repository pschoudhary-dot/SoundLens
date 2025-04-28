'use client';

import React, { useState } from 'react';

interface MusicPreferencesStepProps {
  formData: {
    favoriteGenres: string[];
    favoriteArtists: string[];
    preferredPlatform: string;
  };
  updateFormData: (data: Partial<typeof formData>) => void;
}

const genres = [
  'Pop', 'Rock', 'Hip Hop', 'R&B', 'Country', 'Electronic', 'Jazz', 
  'Classical', 'Metal', 'Folk', 'Indie', 'Blues', 'Reggae', 'Punk', 
  'Soul', 'Funk', 'Disco', 'Alternative', 'K-pop', 'Latin'
];

const MusicPreferencesStep: React.FC<MusicPreferencesStepProps> = ({ formData, updateFormData }) => {
  const [artistInput, setArtistInput] = useState('');
  
  const handleGenreToggle = (genre: string) => {
    const updatedGenres = formData.favoriteGenres.includes(genre)
      ? formData.favoriteGenres.filter(g => g !== genre)
      : [...formData.favoriteGenres, genre];
    
    updateFormData({ favoriteGenres: updatedGenres });
  };
  
  const handleAddArtist = () => {
    if (artistInput.trim() && !formData.favoriteArtists.includes(artistInput.trim())) {
      updateFormData({
        favoriteArtists: [...formData.favoriteArtists, artistInput.trim()]
      });
      setArtistInput('');
    }
  };
  
  const handleRemoveArtist = (artist: string) => {
    updateFormData({
      favoriteArtists: formData.favoriteArtists.filter(a => a !== artist)
    });
  };
  
  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFormData({ preferredPlatform: e.target.value });
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Your Music Preferences</h2>
        <p className="text-white/60 mt-2">
          Tell us about the music you love
        </p>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-white/80 mb-3">
          Select your favorite genres (select all that apply)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {genres.map(genre => (
            <div
              key={genre}
              onClick={() => handleGenreToggle(genre)}
              className={`px-3 py-2 rounded-md cursor-pointer text-center text-sm transition-colors ${
                formData.favoriteGenres.includes(genre)
                  ? 'bg-accent text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {genre}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-white/80 mb-3">
          Add your favorite artists
        </label>
        <div className="flex mb-2">
          <input
            type="text"
            value={artistInput}
            onChange={(e) => setArtistInput(e.target.value)}
            placeholder="Enter artist name"
            className="flex-grow px-4 py-2 bg-white/10 border border-white/20 rounded-l-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
            onKeyPress={(e) => e.key === 'Enter' && handleAddArtist()}
          />
          <button
            type="button"
            onClick={handleAddArtist}
            className="px-4 py-2 bg-accent text-white rounded-r-md hover:bg-accent/90"
          >
            Add
          </button>
        </div>
        
        {formData.favoriteArtists.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.favoriteArtists.map(artist => (
              <div
                key={artist}
                className="flex items-center bg-white/10 px-3 py-1 rounded-full"
              >
                <span className="text-white text-sm">{artist}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveArtist(artist)}
                  className="ml-2 text-white/60 hover:text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <label htmlFor="preferredPlatform" className="block text-sm font-medium text-white/80 mb-1">
          Preferred Music Platform
        </label>
        <select
          id="preferredPlatform"
          name="preferredPlatform"
          value={formData.preferredPlatform}
          onChange={handlePlatformChange}
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="" disabled>Select your preferred platform</option>
          <option value="spotify">Spotify</option>
          <option value="youtube">YouTube Music</option>
          <option value="apple">Apple Music</option>
          <option value="amazon">Amazon Music</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>
  );
};

export default MusicPreferencesStep;
