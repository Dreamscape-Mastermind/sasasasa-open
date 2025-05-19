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
  other_tickets?: Ticket[];
}

// Use an enum for storage keys to prevent typos and enable IDE autocomplete
export enum StorageKey {
  USER = 'SS_USER_DATA',
  TOKENS = 'SS_AUTH_TOKENS',
}
// Type the token structure
export interface AuthTokens {
  access: string;
  refresh: string;
}

// Generic API response interface for reusability
export interface ApiResponse<T> {
  status: string;
  message: string;
  result: {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
  };
}

// Single item response (for create, update, get single item operations)
export interface SingleItemResponse<T> {
  status: string;
  message: string;
  result: T;
}

// Now we can use these generic interfaces for different data types
export type TicketResponse = ApiResponse<Ticket>;
export type EventResponse = ApiResponse<SasasasaEvent>;
export type TeamMemberResponse = ApiResponse<TeamMember>;
export type FlashSaleResponse = ApiResponse<FlashSale>;

// For single item responses
export type SingleTicketResponse = SingleItemResponse<Ticket>;
export type SingleEventResponse = SingleItemResponse<SasasasaEvent>;

// Define the referral code interface
export interface ReferralCode {
  id: string;
  code: string;
  discount: number;
  usageLimit: number;
  usedCount: number;
  expiryDate: string;
  status: 'active' | 'expired' | 'depleted';
}

// Sample referral codes (to be replaced with API data later)
export const sampleReferralCodes: ReferralCode[] = [
  {
    id: '1',
    code: 'EARLY20',
    discount: 20,
    usageLimit: 100,
    usedCount: 45,
    expiryDate: '2024-12-31T23:59:59Z',
    status: 'active'
  },
  {
    id: '2',
    code: 'FRIEND15',
    discount: 15,
    usageLimit: 50,
    usedCount: 50,
    expiryDate: '2024-12-31T23:59:59Z',
    status: 'depleted'
  },
  {
    id: '3',
    code: 'VIP25',
    discount: 25,
    usageLimit: 75,
    usedCount: 30,
    expiryDate: '2024-11-30T23:59:59Z',
    status: 'expired'
  }
];

export interface Wallet {
  address: string;
  chain_id: number;
  is_primary: boolean;
  is_verified?: boolean;
  created_at?: string;
}

// Enhanced User interface based on backend responses
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  walletAddress?: `0x${string}`;
  authType: 'web2' | 'web3';
  capabilities?: Record<string, any>; // For ReCap authentication
  is_verified?: boolean;
  phone?: string;
  name?: string;
  has_verified_email?: boolean;
  [key: string]: any;
}

// Web3 authentication related types
export interface SiweMessageData {
  domain: string;
  address: string;
  statement?: string;
  uri?: string;
  version?: string;
  chain_id: number;
  nonce: string;
  issued_at: string;
  expiration_time?: string;
  not_before?: string;
  resources?: string[];
  [key: string]: any;
}

export interface NonceResponse {
  status: string;
  message: string;
  result: {
    message: string;
    message_data: SiweMessageData;
    recap_data?: string;
  };
}

export interface Web3AuthResponse {
  status: string;
  message: string;
  result: {
    tokens: {
      access: string;
      refresh: string;
    };
    user: User;
    requires_email?: boolean;
    capabilities?: Record<string, any>;
  };
}

export interface WalletLinkResponse {
  status: string;
  message: string;
  result: {
    message: string;
    message_data: SiweMessageData;
  };
}

export interface WalletVerifyResponse {
  status: string;
  message: string;
  result: Wallet;
}

export interface WalletsResponse {
  status: string;
  message: string;
  result: {
    primary_wallet: Wallet | null;
    wallets: Wallet[];
  };
}

// OTP Authentication responses
export interface OtpLoginResponse {
  status: string;
  message: string;
  result: {
    identifier: string;
  } | null;
}

export interface OtpVerifyResponse {
  status: string;
  message: string;
  result: {
    user: User;
    tokens: {
      access: string;
      refresh: string;
    };
  };
}

export interface TokenRefreshResponse {
  status: string;
  message: string;
  result: {
    access: string;
    refresh: string;
  };
}

// Generic error response
export interface ErrorResponse {
  status: string;
  message: string;
  result?: {
    errors?: Record<string, string[]>;
    detail?: string;
  };
}

// Use a more flexible approach for any API response
export interface ApiResponseFlexible<T = any> {
  status: string;
  message: string;
  result: T;
}

// Add new interfaces for email verification
export interface EmailLinkResponse {
  status: string;
  message: string;
  result: {
    email: string;
    otp_sent: boolean;
  };
}

// Export authentication response types for use in other files
export type SiweResponse = NonceResponse;
export type Web3VerifyResponse = Web3AuthResponse;
export type EmailVerifyResponse = SingleItemResponse<User>;