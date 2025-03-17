export interface VenueSearchResult {
  place_id: string;
  description?: string;
}

export interface FlashSale {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';  // Using literal types for status
  discount_type: 'FIXED' | 'PERCENTAGE';  // Using literal types for discount_type
  discount_amount: number;
  discounted_price: number;
  start_date: string;
  end_date: string;
  remaining_tickets: number;
}

export interface Ticket {
  id: string;
  name: string;
  description?: string;
  price: string | number;
  quantity: number;
  remaining_tickets: number;
  sale_start_date: string;
  sale_end_date: string;
  event: string;
  is_active: boolean;
  flash_sale: FlashSale | null;
  created_at: string;
  event_id: string;
  metadata?: Record<string, any>
  eventName?: string
  date?: string
  time?: string
  venue?: string
  section?: string
  row?: string
  seat?: string
  isBlockchainVerified?: boolean
  transferLimit?: number
  transfersUsed?: number
  tokenId?: string
  images?: string[]
  user_id?: string
  ticket_type?: string
  status?: string
  purchase_date?: string
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  venue?: string;
  cover_image?: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  available_tickets?: Ticket[];
}

export interface TeamMember {
  id: string;
  event: string;
  user_id: string;
  email: string;
  role?: string;
  status?: string;
  created_at?: string;
}

export interface AvailableTicket {
  id: string;
  name: string;
  description?: string;
  price: string;
  quantity: number;
  remaining_tickets: number;
  sale_start_date: string;
  sale_end_date: string;
  event: string;
  is_active: boolean;
  flash_sale: FlashSale | null;
  created_at: string;
}

export interface SasasasaEvent {
  id: string;
  title: string;
  description?: string;
  status?: string;
  organizer: string;
  organizer_name?: string | null;
  team_members?: TeamMember[];
  start_date: string;
  end_date?: string;
  venue?: string;
  capacity?: number;
  price?: string;
  created_at?: string;
  updated_at?: string;
  cover_image?: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  website_url?: string;
  short_url?: string;
  share_url?: string;
  timezone?: string;
  available_tickets?: AvailableTicket[];
}