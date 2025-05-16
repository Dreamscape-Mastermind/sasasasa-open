import {
  ApiResponse,
  PaginatedResponse,
  SocialMediaUrls,
  TimeStamped,
} from "./common";

import { TicketType } from "./ticket";

export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED";
export type TeamMemberRole =
  | "EVENT_ORGANIZER"
  | "EVENT_TEAM"
  | "SELLER"
  | "CUSTOMER";
export type TeamMemberStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export interface Location extends TimeStamped {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  country: string;
  landmarks?: string;
  latitude?: number | null;
  longitude?: number | null;
  maps_url?: string;
  phone?: string;
}

export interface Performer extends TimeStamped, SocialMediaUrls {
  id: string;
  name: string;
  description?: string;
  user_id?: string | null;
  spotify_url?: string;
  apple_music_url?: string;
  soundcloud_url?: string;
  youtube_url?: string;
  bandcamp_url?: string;
  tiktok_url?: string;
  artstation_url?: string;
  behance_url?: string;
}

export interface TeamMember {
  id: string;
  event: string;
  user_id: string;
  email: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  created_at: string;
}

export interface EventFlashSale {
  active: boolean;
  discount: string;
  ends_at: string;
}

export interface Event extends TimeStamped, SocialMediaUrls {
  id: string;
  title: string;
  description: string;
  status: EventStatus;
  organizer: string;
  organizer_name: string;
  team_members: TeamMember[];
  start_date: string;
  end_date: string;
  venue: string;
  location: Location | null;
  capacity: number;
  price: number;
  cover_image?: string | null;
  short_url: string;
  share_url: string | null;
  timezone: string;
  available_tickets: TicketType[];
  other_tickets: TicketType[];
  featured: boolean;
  featured_until?: string | null;
  performers: Performer[];
}

export interface PerformerCreateRequest {
  id?: string;
  name: string;
  description?: string;
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

export interface LocationCreateRequest {
  name: string;
  description?: string;
  address?: string;
  city?: string;
  country: string;
  landmarks?: string;
  latitude?: number;
  longitude?: number;
  maps_url?: string;
  phone?: string;
}

export interface EventCreateRequest {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  venue: string;
  location?: LocationCreateRequest;
  capacity?: number;
  price?: number;
  cover_image?: File;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  website_url?: string;
  timezone?: string;
  featured?: boolean;
  featured_until?: string;
  performers?: PerformerCreateRequest[];
}

export interface EventUpdateRequest {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  venue?: string;
  location?: Partial<LocationCreateRequest>;
  capacity?: number;
  price?: number;
  cover_image?: File;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  website_url?: string;
  timezone?: string;
  featured?: boolean;
  featured_until?: string;
  performers?: PerformerCreateRequest[];
}

export interface TeamMemberInviteRequest {
  user_email: string;
  role: TeamMemberRole;
}

export interface TeamMemberAcceptRequest {
  token: string;
}

export interface TeamMemberUpdateRequest {
  role?: TeamMemberRole;
}

export interface LocationFilterParams {
  name?: string;
  city?: string;
  country?: string;
}

export interface EventFilterParams {
  status?: EventStatus;
  venue?: string;
  organizer?: string;
  short_url?: string;
  featured?: boolean;
  featured_until?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
  is_past?: boolean;
  is_featured?: boolean;
  location__city?: string;
  location__country?: string;
  start_date?: string;
  end_date?: string;
  price_min?: number;
  price_max?: number;
  capacity_min?: number;
  capacity_max?: number;
}

export interface TeamMemberFilterParams {
  role?: TeamMemberRole;
  status?: TeamMemberStatus;
  search?: string;
}

export type EventResponse = ApiResponse<Event>;
export type EventListResponse = ApiResponse<PaginatedResponse<Event>>;
export type LocationResponse = ApiResponse<Location>;
export type LocationListResponse = ApiResponse<PaginatedResponse<Location>>;
export type PerformerResponse = ApiResponse<Performer>;
export type PerformerListResponse = ApiResponse<{
  results: Performer[];
}>;
export type TeamMemberResponse = ApiResponse<TeamMember>;
export type TeamMemberListResponse = ApiResponse<PaginatedResponse<TeamMember>>;
