// Common response types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiResponse<T> {
  status: "success" | "error";
  message: string;
  result: T;
}

// Common date-related fields
export interface TimeStamped {
  created_at: string;
  updated_at?: string;
}

// Common social media field
export interface SocialMediaUrls {
  website_url?: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  spotify_url?: string;
  apple_music_url?: string;
  soundcloud_url?: string;
  youtube_url?: string;
  bandcamp_url?: string;
  tiktok_url?: string;
  artstation_url?: string;
  behance_url?: string;
}

// Common discount types
export type DiscountType = "PERCENTAGE" | "FIXED";

export type DeleteResponse = ApiResponse<null>;
