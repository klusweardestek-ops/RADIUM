export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  username: string;
  password; // In a real app, this would be a hash
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

export interface Song {
  id: string;
  userId: string;
  releaseDate: string;
  coverArt: File; // Changed from Base64 string to File object
  coverArtName: string;
  audioFile: File; // Changed from Base64 string to File object
  audioFileName: string;
  upc?: string;
  isrc?: string;
  albumTitle: string;
  artistNames: string;
  genre: Genre;
  platforms: Platform[];
  status: SongStatus;
}