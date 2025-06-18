declare namespace Spotify {
  interface Album {
    uri: string;
    name: string;
    images: { url: string; height: number; width: number }[];
  }

  interface Artist {
    uri: string;
    name: string;
  }

  interface Track {
    id: string;
    uri: string;
    type: string;
    media_type: string;
    name: string;
    duration_ms: number;
    album: Album;
    artists: Artist[];
  }

  interface PlaybackState {
    context: {
      uri: string;
      metadata: any;
    };
    disallows: {
      pausing: boolean;
      peeking_next: boolean;
      peeking_prev: boolean;
      resuming: boolean;
      seeking: boolean;
      skipping_next: boolean;
      skipping_prev: boolean;
    };
    duration: number;
    paused: boolean;
    position: number;
    repeat_mode: number;
    shuffle: boolean;
    track_window: {
      current_track: Track;
      previous_tracks: Track[];
      next_tracks: Track[];
    };
  }

  interface PlayerInit {
    name: string;
    getOAuthToken: (callback: (token: string) => void) => void;
    volume?: number;
  }

  interface Player {
    connect(): Promise<boolean>;
    disconnect(): void;
    addListener(event: 'ready', callback: (data: { device_id: string }) => void): void;
    addListener(event: 'not_ready', callback: (data: { device_id: string }) => void): void;
    addListener(event: 'player_state_changed', callback: (state: PlaybackState) => void): void;
    addListener(event: 'initialization_error', callback: (error: { message: string }) => void): void;
    addListener(event: 'authentication_error', callback: (error: { message: string }) => void): void;
    addListener(event: 'account_error', callback: (error: { message: string }) => void): void;
    addListener(event: 'playback_error', callback: (error: { message: string }) => void): void;
    removeListener(event: string, callback?: Function): void;
    getCurrentState(): Promise<PlaybackState | null>;
    setName(name: string): Promise<void>;
    getVolume(): Promise<number>;
    setVolume(volume: number): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    togglePlay(): Promise<void>;
    seek(position_ms: number): Promise<void>;
    previousTrack(): Promise<void>;
    nextTrack(): Promise<void>;
  }
}

interface Window {
  Spotify: {
    Player: new (config: Spotify.PlayerInit) => Spotify.Player;
  };
  onSpotifyWebPlaybackSDKReady: () => void;
}
