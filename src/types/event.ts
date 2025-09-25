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
  EVENT_MANAGER = "EVENT_MANAGER",
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
  description: Nullable<string>; // Updated from bio to description to match API
  bio: Nullable<string>; // Keep for backward compatibility
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
 * Category types
 * Represents event categories for organization
 */
export interface Category extends BaseEventEntity {
  name: string;
  slug: string;
  description: Nullable<string>;
  parent: Nullable<string>; // Parent category ID
  is_active: boolean;
  sort_order: number;
}

/**
 * Event type types
 * Represents different types of events (concert, conference, etc.)
 */
export interface EventType extends BaseEventEntity {
  name: string;
  slug: string;
  description: Nullable<string>;
  is_active: boolean;
  sort_order: number;
}

/**
 * Event format types
 * Represents event formats (in-person, virtual, hybrid)
 */
export interface EventFormat extends BaseEventEntity {
  name: string;
  slug: string;
  description: Nullable<string>;
  is_active: boolean;
  sort_order: number;
}

/**
 * Event tag types
 * Represents tags for events
 */
export interface EventTag extends BaseEventEntity {
  name: string;
  slug: string;
  description: Nullable<string>;
  color: Nullable<string>;
  is_trending: boolean;
  usage_count: number;
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

  // Categorization
  category: Nullable<Category>;
  event_type: Nullable<EventType>;
  format: Nullable<EventFormat>;
  tags: string[]; // Tag names array
  tags_data: EventTag[]; // Full tag objects array

  // Age & Content Restrictions
  age_restriction: Nullable<string>;
  content_rating: Nullable<string>;
  minimum_age: Nullable<number>;
  maximum_age: Nullable<number>;
  is_age_restricted: boolean;

  // Event Characteristics
  is_recurring: boolean;
  is_series: boolean;
  series_name: Nullable<string>;
  series_number: Nullable<number>;

  // Virtual/Hybrid Event Fields
  virtual_meeting_url: Nullable<string>;
  virtual_platform: Nullable<string>;
  virtual_instructions: Nullable<string>;
  virtual_capacity: Nullable<number>;

  // Rich Content Fields (JSON arrays) - FAQ was missing!
  agenda: any[]; // Structured agenda data
  speakers: any[]; // Speaker information
  sponsors: any[]; // Sponsor information
  faq: any[]; // FAQ items - this was missing!
  highlights: any[]; // Event highlights

  // Additional Social Media URLs
  youtube_url: Nullable<string>;
  tiktok_url: Nullable<string>;
  snapchat_url: Nullable<string>;
  discord_url: Nullable<string>;
  telegram_url: Nullable<string>;
  spotify_url: Nullable<string>;

  // SEO & Meta Fields
  meta_title: Nullable<string>;
  meta_description: Nullable<string>;
  meta_keywords: Nullable<string>;
  canonical_url: Nullable<string>;
  language: string;
  subtitles_available: boolean;
  sign_language_available: boolean;

  // Computed Fields
  category_path: Nullable<string>;
  format_display: Nullable<string>;
  tag_names: string[];
  similar_events: Event[];

  // Media Fields
  media_gallery?: EventMedia[];
  hero_image?: Nullable<EventMedia>;

  // Content Sections
  content_sections?: EventContent[];
}

/**
 * Event media types
 * Represents media files associated with events
 */
export interface EventMedia extends BaseEventEntity {
  event: string; // Event ID
  file: string; // File URL
  file_url: string; // Alternative file URL field
  file_name: string;
  media_type: "IMAGE" | "VIDEO" | "DOCUMENT"; // Updated to match API
  file_type: "image" | "video" | "document"; // Keep for backward compatibility
  file_size: number;
  is_featured: boolean;
  is_public: boolean; // New field from API
  order: number; // Updated field name from sort_order
  sort_order: number; // Keep for backward compatibility
  title?: string; // New field from API
  description?: string;
  alt_text?: string;
}

/**
 * Media management request types
 */
export interface UploadMediaRequest {
  files: File[];
  title?: string;
  description?: string;
  alt_text?: string;
  is_public?: boolean;
  order?: number;
  is_featured?: boolean;
}

export interface UploadGalleryMediaRequest {
  files: File[];
  title?: string;
  description?: string;
  is_public?: boolean;
}

export interface UploadCoverImageRequest {
  cover_image: File;
}

export interface SetFeaturedMediaRequest {
  media_id: string;
}

export interface ReorderMediaRequest {
  order: number;
}

/**
 * Event content types
 * Represents structured content sections for events
 */
export interface EventContent extends BaseEventEntity {
  event: string; // Event ID
  section_type:
    | "agenda"
    | "speakers"
    | "sponsors"
    | "faq"
    | "highlights"
    | "custom";
  title: string;
  content: any; // JSON content specific to section type
  sort_order: number;
  is_visible: boolean;
}

export interface SimilarEvent {
  id: string;
  title: string;
  short_url: string;
  start_date: string;
  venue: string;
  cover_image?: string | null;
  featured?: boolean;
}

/**
 * Request interfaces
 */
export interface CreateEventRequest {
  title: string;
  description: string;
  start_date: string; // ISO string
  end_date: string; // ISO string
  timezone: string;
  venue: string;
  capacity: number;
  cover_image?: File | string | null; // File for new upload, string for existing URL, null to remove
  facebook_url?: string;
  website_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  twitter_url?: string;

  // Categorization
  category?: string;
  event_type?: string;
  format?: string;
  tags_input?: string[]; // Updated to match API - auto-creates tags if they don't exist
  age_restriction?: string;
  content_rating?: string;
  minimum_age?: number;
  maximum_age?: number;

  // Event Characteristics
  is_recurring?: boolean;
  is_series?: boolean;
  series_name?: string;
  series_number?: number;

  // Virtual/Hybrid Event Fields
  virtual_meeting_url?: string;
  virtual_platform?: string;
  virtual_instructions?: string;
  virtual_capacity?: number;

  // Rich Content
  agenda?: any[];
  speakers?: any[];
  sponsors?: any[];
  faq?: any[];
  highlights?: any[];

  // Additional Social Media URLs
  youtube_url?: string;
  tiktok_url?: string;
  snapchat_url?: string;
  discord_url?: string;
  telegram_url?: string;
  spotify_url?: string;

  // SEO & Meta
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  canonical_url?: string;
  language?: string;
  subtitles_available?: boolean;
  sign_language_available?: boolean;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  cover_image?: File | string | null; // File for new upload, string to keep existing, null to remove
  // Allow FormData for media updates
  gallery_images?: File[];
  image_descriptions?: string[];
  featured_image?: string;
}

export type UpdateEventRequestOrFormData = UpdateEventRequest | FormData;

export interface InviteTeamMemberRequest {
  user_email: string;
  role: TeamMemberRole;
}

export interface AcceptTeamInvitationRequest {
  token: string;
}

export interface AcceptPublicInvitationRequest {
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

export interface CategoryResponse extends SuccessResponse<Category> {}

export interface CategoriesResponse
  extends SuccessResponse<PaginatedResponse<Category>> {}

export interface EventTypeResponse extends SuccessResponse<EventType> {}

export interface EventTypesResponse
  extends SuccessResponse<PaginatedResponse<EventType>> {}

export interface EventFormatResponse extends SuccessResponse<EventFormat> {}

export interface EventFormatsResponse
  extends SuccessResponse<PaginatedResponse<EventFormat>> {}

export interface EventTagResponse extends SuccessResponse<EventTag> {}

export interface EventTagsResponse
  extends SuccessResponse<PaginatedResponse<EventTag>> {}

export interface EventMediaResponse extends SuccessResponse<EventMedia> {}

export interface EventMediaListResponse
  extends SuccessResponse<PaginatedResponse<EventMedia>> {}

export interface UploadMediaResponse
  extends SuccessResponse<{
    results: EventMedia[];
  }> {}

// Tag search query parameters
export interface TagSearchQueryParams {
  search?: string;
  trending?: boolean;
  limit?: number;
}

// Tag search response
export interface TagSearchResponse
  extends SuccessResponse<PaginatedResponse<EventTag>> {}

/**
 * Revenue types
 */
export interface EventRevenue {
  id: string;
  created_at: string;
  updated_at: string;
  total_revenue: string; // decimal as string from backend
  platform_fee: string; // decimal as string
  net_revenue: string; // decimal as string
  total_withdrawn: string; // decimal as string
  available_for_payout: string; // decimal as string
  event: string; // event id
}

export interface EventRevenueResponse extends SuccessResponse<EventRevenue> {}

/**
 * Query parameter interfaces
 */
export interface EventQueryParams {
  // Standard filtering
  status?: EventStatus;
  venue?: string;
  organizer?: string;
  short_url?: string;
  featured?: boolean;
  featured_until?: string;
  category?: string;
  event_type?: string;
  format?: string;
  is_recurring?: boolean;
  is_series?: boolean;
  age_restriction?: string;
  minimum_age?: number;
  maximum_age?: number;

  // Search and ordering
  search?: string;
  ordering?: string;

  // Pagination
  page?: number;
  page_size?: number;

  // Legacy filters (kept for backward compatibility)
  is_past?: boolean;
  is_featured?: boolean;
  owner?: boolean;
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
  page_size?: number;
}

export interface PerformerQueryParams {
  search?: string;
  page?: number;
  event?: string;
}

export interface CategoryQueryParams {
  parent_id?: string;
  include_inactive?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
}

export interface EventTypeQueryParams {
  include_inactive?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
}

export interface EventFormatQueryParams {
  include_inactive?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
}

export interface EventTagQueryParams {
  trending?: boolean;
  limit?: number;
  search?: string;
  ordering?: string;
  page?: number;
}

/**
 * Homepage API types
 * Specialized event data structure for homepage display
 */
export interface HomepageFlashSale {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  discount_type: "PERCENTAGE" | "FIXED";
  discount_amount: string;
  max_tickets: number;
  tickets_sold: number;
}

export interface HomepageEvent {
  id: string;
  title: string;
  short_url: string;
  cover_image: Nullable<string>;
  start_date: string;
  end_date: string;
  price: string;
  venue: string;
  location: Nullable<Location>;
  flash_sale: Nullable<HomepageFlashSale>;
  has_flash_sale: boolean;
  featured: boolean;
}

export interface HomepageAllEvents {
  results: HomepageEvent[];
  count: number;
  showing: number;
  has_more: boolean;
}

export interface HomepageData {
  carousel: HomepageEvent[];
  featured_events: HomepageEvent[];
  all_events: HomepageAllEvents;
  flash_sale_events: HomepageEvent[];
}

export interface HomepageResponse extends SuccessResponse<HomepageData> {}
