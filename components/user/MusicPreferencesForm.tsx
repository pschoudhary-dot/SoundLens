import React, { useState } from 'react';
import Button from "../ui/Button"; // Assuming this is the base button, not ButtonWithSpinner
import { Input } from "../ui/input";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { CalendarIcon, X, Search, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

// Mock data for countries and languages
const countries = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  // Add more countries as needed
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'hi', name: 'Hindi' },
  // Add more languages as needed
];

// Mock data for music genres
const musicGenres = [
  'Pop', 'Rock', 'Hip Hop', 'R&B', 'Country', 'Electronic', 'Jazz', 'Classical',
  'Metal', 'Folk', 'Indie', 'Blues', 'Reggae', 'Punk', 'Soul', 'Funk',
  'Disco', 'Alternative', 'K-pop', 'Latin'
];

// Mock popular artists (in a real app, these would come from Spotify API)
const popularArtists = [
  'Taylor Swift', 'The Weeknd', 'Bad Bunny', 'Drake', 'Billie Eilish',
  'BTS', 'Dua Lipa', 'Ed Sheeran', 'Ariana Grande', 'Post Malone',
  'Justin Bieber', 'Harry Styles', 'Olivia Rodrigo', 'Kendrick Lamar',
  'Travis Scott', 'Beyoncé', 'Adele', 'Coldplay', 'Rihanna', 'Lady Gaga'
];

interface MusicPreferencesFormProps {
  onSubmit: (data: any) => void;
  currentStep: number;
}

export default function MusicPreferencesForm({ onSubmit, currentStep }: MusicPreferencesFormProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [country, setCountry] = useState<string>('');
  const [language, setLanguage] = useState<string>('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [artistSearch, setArtistSearch] = useState<string>('');
  const [platform, setPlatform] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter artists based on search
  const filteredArtists = popularArtists.filter(artist =>
    artist.toLowerCase().includes(artistSearch.toLowerCase())
  );

  const handleGenreToggle = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleAddArtist = (artist: string) => {
    if (!selectedArtists.includes(artist)) {
      setSelectedArtists([...selectedArtists, artist]);
      setArtistSearch('');
    }
  };

  const handleRemoveArtist = (artist: string) => {
    setSelectedArtists(selectedArtists.filter(a => a !== artist));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ // Assuming onSubmit might be async and return a Promise
        birthdate: date,
        country,
        language,
        genres: selectedGenres,
        artists: selectedArtists,
        platform
      });
      // Optionally, handle success feedback here if needed, or parent handles it
    } catch (error) {
      console.error("Error submitting music preferences:", error);
      // Optionally, set a local error state to display to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      language,
      genres: selectedGenres,
      artists: selectedArtists,
      platform
    });
  };

  return (
    <div className="w-full max-w-md mx-auto bg-black rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Your Music Preferences</h2>
          <div className="flex">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mx-1",
                  step < currentStep
                    ? "bg-[#22c55e] text-white"
                    : step === currentStep
                      ? "bg-[#22c55e] text-white"
                      : "bg-gray-700 text-gray-300"
                )}
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        {currentStep === 2 && (
          <div className="text-white mb-6">
            <p className="text-lg mb-4">Tell us about the music you love</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date of Birth with Calendar */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Date of Birth</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-gray-800 border-gray-700 hover:bg-gray-700",
                        !date && "text-gray-400"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select your date of birth"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="bg-gray-800 text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Country Dropdown */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Country</label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Language Dropdown */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Preferred Language</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select your language" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Genre Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select your favorite genres (select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {musicGenres.map((genre) => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => handleGenreToggle(genre)}
                      className={cn(
                        "py-2 px-3 rounded-md text-sm font-medium transition-colors",
                        selectedGenres.includes(genre)
                          ? "bg-[#22c55e] text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      )}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Artist Selection with Search */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Add your favorite artists</label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search for artists..."
                    value={artistSearch}
                    onChange={(e) => setArtistSearch(e.target.value)}
                    className="w-full bg-gray-800 border-gray-700 text-white pr-10"
                  />
                  <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>

                {artistSearch && (
                  <div className="mt-2 bg-gray-800 rounded-md max-h-40 overflow-y-auto">
                    {filteredArtists.length > 0 ? (
                      filteredArtists.map((artist) => (
                        <button
                          key={artist}
                          type="button"
                          onClick={() => handleAddArtist(artist)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-700 text-white text-sm"
                        >
                          <div className="flex items-center">
                            <span>{artist}</span>
                            <PlusCircle className="ml-auto h-4 w-4 text-gray-400" />
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-400 text-sm">No artists found</div>
                    )}
                  </div>
                )}

                {selectedArtists.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedArtists.map((artist) => (
                      <Badge key={artist} className="bg-gray-700 text-white hover:bg-gray-600">
                        {artist}
                        <button
                          type="button"
                          onClick={() => handleRemoveArtist(artist)}
                          className="ml-1 text-gray-300 hover:text-white"
                          aria-label={`Remove ${artist}`}
                          title={`Remove ${artist}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Music Platform Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Preferred Music Platform</label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
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

              <Button
                type="submit"
                className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Continue'
                )}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
