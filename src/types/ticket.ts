import {
  Nullable,
  PaginatedResponse,
  SuccessResponse,
  TimeStamp,
} from "./common";

import { PaymentDetailsResponse } from "./payment";
import { TicketTypeWithFlashSale } from "./flashsale";

/**
 * Ticket status enum
 */
export enum TicketStatus {
  PENDING = "PENDING",
  VALID = "VALID",
  USED = "USED",
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
  name: string;
  description?: string;
  price: number;
  quantity: number;
  is_active?: boolean;
  sale_start_date: Date;
  sale_end_date: Date;
}

export interface TicketTypeUpdateRequest {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  is_active?: boolean;
  sale_start_date?: Date;
  sale_end_date?: Date;
}

export interface UpdateTicketTypeRequest
  extends Partial<CreateTicketTypeRequest> {}

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
    tickets: Ticket[];
    total_amount: string;
    payment_details: PaymentDetailsResponse;
  }> {}

export interface TicketRefundResponse extends SuccessResponse<TicketRefund> {}

export interface TicketRefundsResponse
  extends SuccessResponse<PaginatedResponse<TicketRefund>> {}

export interface TicketExportResponse
  extends SuccessResponse<{
    job_id: string;
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
}

export interface TicketRefundQueryParams {
  ticket?: string;
  status?: RefundStatus;
  requester?: string;
  processor?: string;
  search?: string;
  ordering?: string;
  page?: number;
}
