// This file re-exports types from the centralized types for backward compatibility
// In the future, import directly from @/types instead

import type {
  Discount,
  Event,
  FlashSale,
  Location,
  Payment,
  Performer,
  TeamMember,
  TicketType,
  User,
  WaitlistEntry,
} from "@/types";

// Re-export all types
export type {
  Event,
  FlashSale,
  TicketType as Ticket, // For backward compatibility
  Performer,
  Location,
  TeamMember,
  User,
  Discount,
  Payment,
  WaitlistEntry,
};

// Add any additional types that might be used but not in the centralized types
export interface VenueSearchResult {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  latitude?: string;
  longitude?: string;
}
