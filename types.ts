export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

// Represents the public profile data stored in the 'profiles' table.
export interface Profile {
  id: string;
  username: string;
  role: UserRole;
  is_banned: boolean;
  paypal_email?: string | null;
  bank_account_iban?: string | null;
  bank_account_swift?: string | null;
}

// FIX: Add the User interface. This type was missing, causing an import error
// in services/storageService.ts. This interface represents the user model
// for the legacy localStorage-based authentication.
export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  isBanned: boolean;
}

export enum SongStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum Platform {
  SPOTIFY = 'Spotify',
  INSTAGRAM = 'Instagram',
  TIKTOK = 'TikTok',
  AMAZON = 'Amazon',
  YOUTUBE = 'YouTube',
  CONTENT_ID = 'Content ID',
  APPLE_MUSIC = 'Apple Music',
  ITUNES = 'iTunes',
}

export enum Genre {
  POP = 'Pop',
  ROCK = 'Rock',
  HIP_HOP = 'Hip Hop / Rap',
  ELECTRONIC = 'Electronic',
  JAZZ = 'Jazz',
  CLASSICAL = 'Classical',
  COUNTRY = 'Country',
  METAL = 'Metal',
  RNB = 'R&B / Soul',
  REGGAE = 'Reggae',
  FOLK = 'Folk / Acoustic',
  OTHER = 'Other',
}

export interface SongStatusHistory {
  id: string;
  created_at: string;
  status: SongStatus;
  reason: string | null;
  profiles: { // Admin who made the change
    username: string;
  };
}

// Represents song data stored in the 'songs' table.
export interface Song {
  id: string;
  user_id: string;
  created_at: string;
  release_date: string;
  cover_art_url: string;
  audio_file_url: string;
  upc?: string;
  isrc?: string;
  album_title: string;
  artist_names: string;
  genre: Genre;
  platforms: Platform[];
  status: SongStatus;
  rejection_reason?: string | null;
  profiles?: { username: string }; // Optional relation for fetching uploader info
  song_status_history?: SongStatusHistory[]; // Status change log
}