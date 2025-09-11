import {
  Nullable,
  PaginatedResponse,
  SuccessResponse,
  TimeStamp,
} from "./common";

import { TicketTypeWithFlashSale } from "./flashsale";

/**
 * Ticket status enum
 */
export enum TicketStatus {
  PENDING = "PENDING",
  VALID = "VALID",
  USED = "USED",
  INVALID = "INVALID",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

/**
 * Refund status enum
 */
export enum RefundStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PROCESSED = "PROCESSED",
}

/**
 * Base interfaces
 */
export interface BaseTicketEntity extends TimeStamp {
  id: string;
}

/**
 * Ticket type interface
 */
export interface TicketType extends BaseTicketEntity {
  event: string; // Event ID
  name: string;
  description: string;
  price: number;
  quantity: number;
  remaining_tickets: number; // Read-only field from serializer
  is_active: boolean;
  sale_start_date: Date;
  sale_end_date: Date;
  flash_sale?: TicketTypeWithFlashSale | null;
}

/**
 * Ticket interface
 */
export interface Ticket extends BaseTicketEntity {
  ticket_type: string; // TicketType ID
  ticket_type_name: string; // Read-only field from serializer
  ticket_type_price: number; // Read-only field from serializer
  event: string; // Event ID
  event_title: string; // Read-only field from serializer
  owner: Nullable<string>; // User ID
  ticket_number: string;
  qr_code: Nullable<string>;
  status: TicketStatus;
  checked_in_at: Nullable<string>;
  checked_in_by: Nullable<string>; // User ID
  purchase_price: number;
  owner_details: Owner;
}

export interface Owner {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface TicketEnhanced {
  [key: string]: any;
}

/**
 * Ticket refund interface
 */
export interface TicketRefund extends BaseTicketEntity {
  ticket: string; // Ticket ID
  ticket_number: string; // Read-only field from serializer
  event_title: string; // Read-only field from serializer
  requester: Nullable<string>; // User ID
  processor: Nullable<string>; // User ID
  reason: string;
  status: RefundStatus;
  processed_at: Nullable<string>;
  refund_amount: number;
  notes: string;
}

/**
 * Ticket export interface
 */
export interface TicketExport extends BaseTicketEntity {
  ticket_number: string;
  status: TicketStatus;
  purchase_price: number;
  masked_email: string; // Read-only field from serializer
  created_at: string;
  event_title: string;
  ticket_type_name: string;
  checked_in_at: Nullable<string>;
}

/**
 * Request interfaces
 */
export interface CreateTicketTypeRequest {
  id?: string | number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  is_active?: boolean;
  sale_start_date: Date;
  sale_end_date: Date;
}

export interface UpdateTicketTypeRequest
  extends Partial<CreateTicketTypeRequest> {
  ticketTypeId: string;
}

export interface TicketPurchaseItem {
  ticket_type_id: string;
  quantity: number;
  unit_price?: number; // Read-only field from serializer
}

export interface TicketPurchaseRequest {
  email?: string;
  first_name?: string;
  last_name?: string;
  tickets: TicketPurchaseItem[];
  discount_code?: string | null;
  provider?: string;
  total_amount?: number; // Read-only field from serializer
}

export interface RequestRefundRequest {
  reason: string;
}

export interface ProcessRefundRequest {
  status: RefundStatus;
  notes?: string;
}

export interface ComplementaryTicketRequest {
  ticket_type_id: string;
  recipient_email: string;
  quantity: number;
  note?: string;
}

/**
 * Response interfaces
 */
export interface TicketResponse extends SuccessResponse<Ticket> {}

export interface TicketsResponse
  extends SuccessResponse<PaginatedResponse<Ticket>> {}

export interface TicketTypeResponse extends SuccessResponse<TicketType> {}

export interface TicketTypesResponse
  extends SuccessResponse<PaginatedResponse<TicketType>> {}

export interface TicketPurchaseResponse
  extends SuccessResponse<{
    ticket_type: "paid" | "free";
    redirect_type: "payment_provider" | "checkout_success";
    payment_reference: string;
    authorization_url?: string; // For paid tickets
    access_code?: string; // For paid tickets
    provider?: string; // For paid tickets
    amount?: number; // For paid tickets
    currency?: string; // For paid tickets
    message?: string; // For free tickets
    tickets: Array<{
      ticket_number: string;
      status: TicketStatus;
    }>;
  }> {}

export interface TicketRefundResponse extends SuccessResponse<TicketRefund> {}

export interface TicketRefundsResponse
  extends SuccessResponse<PaginatedResponse<TicketRefund>> {}

export interface TicketExportResponse
  extends SuccessResponse<{
    download_url: string; // Direct download link
    file_name: string; // Suggested filename
    file_size: number; // File size in bytes
    expires_at: string; // URL expiration time
  }> {}

export interface TicketExportListResponse
  extends SuccessResponse<PaginatedResponse<TicketExport>> {}

export interface TicketAnalyticsResponse
  extends SuccessResponse<{
    total_tickets_sold: number;
    total_revenue: number;
    average_ticket_price: number;
    sales_by_date: Record<string, number>;
    ticket_type_distribution: Record<string, number>;
  }> {}

/**
 * User ticket interface for cross-event tickets (enhanced)
 */
export interface UserTicket extends BaseTicketEntity {
  ticket_number: string;
  status: TicketStatus;
  purchase_price: number;
  checked_in_at: Nullable<string>;
  checked_in_by: Nullable<string>;
  qr_code: Nullable<string>;
  qr_code_url: Nullable<string>;
  metadata: Record<string, any>;

  // Ticket type information
  ticket_type: string;
  ticket_type_name: string;
  ticket_type_description: string;
  ticket_type_price: string;
  ticket_type_details: {
    id: string;
    name: string;
    description: string;
    price: string;
    quantity: number;
    remaining: number;
    is_active: boolean;
    is_free: boolean;
    sale_start_date: string;
    sale_end_date: string;
    per_user_purchase_limit: number;
    reserve_timeout_minutes: number;
  };

  // Event information (top-level fields from API)
  event: string;
  event_title: string;
  event_date: string;
  event_location: Nullable<string>;
  event_cover_image: Nullable<string>;
  event_details: Nullable<{
    id: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    location: string;
    venue: string;
    cover_image_url: Nullable<string>;
    short_url: string;
    status: string;
    is_online: boolean;
    max_attendees: number;
    current_attendees: number;
  }>;

  // Purchase information (can be null for invalid tickets)
  purchase_info: Nullable<{
    payment_reference: string;
    payment_status: string;
    payment_provider: string;
    payment_method: Nullable<string>;
    amount_paid: string;
    currency: string;
    completed_at: string;
    provider_reference: string;
    balance_used: number;
    is_free_ticket: boolean;
    flash_sale_info: Nullable<any>;
    discount_info: Nullable<{
      code: string;
      type: string;
      value: number;
      discount_amount: string;
    }>;
  }>;

  owner_details: Owner;
}

/**
 * User tickets response interface (enhanced API structure)
 */
export interface UserTicketsResponse
  extends SuccessResponse<PaginatedResponse<UserTicket>> {}

/**
 * Query parameter interfaces
 */
export interface TicketTypeQueryParams {
  event?: string;
  is_active?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
}

export interface TicketQueryParams {
  event?: string;
  ticket_type?: string;
  status?: TicketStatus;
  owner?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface TicketRefundQueryParams {
  ticket?: string;
  status?: RefundStatus;
  requester?: string;
  processor?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface ExportTicketsQueryRequest {
  event_id: string;
  format: ExportFormat;
  filters: {
    search?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
  };
  include_fields: string[];
}

export type ExportFormat = "excel" | "csv";
