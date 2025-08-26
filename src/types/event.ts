import {
  Nullable,
  PaginatedResponse,
  SuccessResponse,
  TimeStamp,
} from "./common";

import { TicketType } from "./ticket";

/**
 * Event status enum
 * Represents the current state of an event in the system
 */
export enum EventStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  CANCELLED = "CANCELLED",
}

/**
 * Team member role enum
 * Defines the possible roles a user can have in an event team
 */
export enum TeamMemberRole {
  EVENT_ORGANIZER = "EVENT_ORGANIZER",
  EVENT_TEAM = "EVENT_TEAM",
  SELLER = "SELLER",
  CUSTOMER = "CUSTOMER",
}

/**
 * Team member status enum
 * Represents the current state of a team member's invitation
 */
export enum TeamMemberStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
}

/**
 * Base interfaces
 */
export interface BaseEventEntity extends TimeStamp {
  id: string;
}

/**
 * Location types
 * Represents a physical location where events can be held
 */
export interface Location extends BaseEventEntity {
  name: string;
  description: Nullable<string>;
  address: string;
  city: string;
  country: string;
  landmarks: Nullable<string>;
  latitude: Nullable<number>;
  longitude: Nullable<number>;
  maps_url: Nullable<string>;
  phone: Nullable<string>;
}

/**
 * Performer types
 * Represents an artist, speaker, or other performer at events
 */
export interface Performer extends BaseEventEntity {
  name: string;
  bio: Nullable<string>;
  image_url: Nullable<string>;
  website_url: Nullable<string>;
  facebook_url: Nullable<string>;
  twitter_url: Nullable<string>;
  instagram_url: Nullable<string>;
  linkedin_url: Nullable<string>;
  spotify_url: Nullable<string>;
  apple_music_url: Nullable<string>;
  soundcloud_url: Nullable<string>;
  youtube_url: Nullable<string>;
  bandcamp_url: Nullable<string>;
  tiktok_url: Nullable<string>;
  artstation_url: Nullable<string>;
  behance_url: Nullable<string>;
}

/**
 * Event team member types
 * Represents a user's role and status in an event team
 */
export interface EventTeamMember extends BaseEventEntity {
  event: string; // Event ID
  user_id: string;
  email: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  invite_token: string; // Added to match backend
}

/**
 * Event types
 * Core event entity with all related data
 */
export interface Event extends BaseEventEntity {
  title: string;
  description: string;
  status: EventStatus;
  organizer: string; // User ID
  organizer_name: string;
  team_members: EventTeamMember[];
  start_date: string;
  end_date: string;
  venue: string;
  location: Nullable<Location>;
  capacity: number;
  price: number;
  cover_image: Nullable<string>;
  facebook_url: Nullable<string>;
  twitter_url: Nullable<string>;
  instagram_url: Nullable<string>;
  linkedin_url: Nullable<string>;
  website_url: Nullable<string>;
  short_url: string;
  share_url: Nullable<string>;
  timezone: string;
  available_tickets: TicketType[];
  other_tickets: TicketType[];
  featured: boolean;
  featured_until: Nullable<string>;
  performers: Performer[];
}

/**
 * Request interfaces
 */
export interface CreateEventRequest {
  title: string;
  description: string;
  start_date: string; // ISO string
  end_date: string;   // ISO string
  timezone: string;
  venue: string;
  capacity: number;
  cover_image?: File | string | null; // File for new upload, string for existing URL, null to remove
  facebook_url?: string;
  website_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  twitter_url?: string;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  cover_image?: File | string | null; // File for new upload, string to keep existing, null to remove
}

export interface InviteTeamMemberRequest {
  user_email: string;
  role: TeamMemberRole;
}

export interface AcceptTeamInvitationRequest {
  token: string;
}

/**
 * Response interfaces
 */
export interface EventResponse extends SuccessResponse<Event> {}

export interface EventsResponse
  extends SuccessResponse<PaginatedResponse<Event>> {}

export interface TeamMemberResponse extends SuccessResponse<EventTeamMember> {}

export interface TeamMembersResponse
  extends SuccessResponse<PaginatedResponse<EventTeamMember>> {}

export interface LocationResponse extends SuccessResponse<Location> {}

export interface LocationsResponse
  extends SuccessResponse<PaginatedResponse<Location>> {}

export interface PerformerResponse extends SuccessResponse<Performer> {}

export interface PerformersResponse
  extends SuccessResponse<PaginatedResponse<Performer>> {}

/**
 * Query parameter interfaces
 */
export interface EventQueryParams {
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
  is_active?: boolean;
}

export interface LocationQueryParams {
  search?: string;
  city?: string;
  country?: string;
  page?: number;
}

export interface TeamMemberQueryParams {
  event?: string;
  role?: TeamMemberRole;
  status?: TeamMemberStatus;
  search?: string;
  ordering?: string;
  page?: number;
}

export interface PerformerQueryParams {
  search?: string;
  page?: number;
  event?: string;
}
