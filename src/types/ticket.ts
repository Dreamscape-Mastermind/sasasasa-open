import { ApiResponse, PaginatedResponse, TimeStamped } from "./common";

import type { PaymentProvider } from "./payment";
import type { TicketTypeWithFlashSale } from "./flashSale";

export type TicketStatus =
  | "PENDING"
  | "VALID"
  | "USED"
  | "CANCELLED"
  | "REFUNDED";
export type RefundStatus = "PENDING" | "APPROVED" | "REJECTED" | "PROCESSED";

export interface TicketType extends TimeStamped {
  id: string;
  event: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  remaining_tickets: number;
  is_active: boolean;
  sale_start_date: Date;
  sale_end_date: Date;
  flash_sale?: TicketTypeWithFlashSale | null;
}

export interface Ticket extends TimeStamped {
  id: string;
  ticket_type: string;
  ticket_type_name: string;
  ticket_type_price: number;
  event: string;
  event_title: string;
  owner?: string;
  ticket_number: string;
  qr_code?: string;
  status: TicketStatus;
  checked_in_at?: string | null;
  checked_in_by?: string | null;
  purchase_price: number;
}

export interface Refund extends TimeStamped {
  id: string;
  ticket: string;
  ticket_number: string;
  event_title: string;
  requester?: string;
  processor?: string | null;
  reason: string;
  status: RefundStatus;
  processed_at?: string | null;
  refund_amount: number;
  notes?: string;
}

export interface TicketTypeCreateRequest {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  is_active?: boolean;
  sale_start_date: string;
  sale_end_date: string;
}

export interface TicketTypeUpdateRequest {
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  is_active?: boolean;
  sale_start_date?: string;
  sale_end_date?: string;
}

export interface TicketPurchaseItem {
  ticket_type_id: string;
  quantity?: number;
}

export interface TicketPurchaseRequest {
  email?: string;
  first_name?: string;
  last_name?: string;
  tickets: TicketPurchaseItem[];
  discount_code?: string;
  provider?: PaymentProvider;
}

export interface PaymentDetails {
  authorization_url?: string;
  reference: string;
  access_code?: string;
  order_tracking_id?: string;
  redirect_url?: string;
}

export interface TicketPurchaseResponse {
  tickets: Ticket[];
  total_amount: number;
  payment_details: PaymentDetails;
}

export interface RefundRequest {
  reason: string;
}

export interface ProcessRefundRequest {
  status: "APPROVED" | "REJECTED";
  notes?: string;
}

export interface ComplementaryTicketRequest {
  ticket_type_id: string;
  recipient_email: string;
  quantity: number;
  note?: string;
}

export interface ExportTicketsResponse {
  message: string;
  job_id: string;
}

export interface ComplementaryTicketsResponse {
  message: string;
  tickets: string[];
}

export interface TicketFilterParams {
  status?: TicketStatus;
  event?: string;
  ticket_type?: string;
  search?: string;
  ordering?: string;
}

export interface RefundFilterParams {
  status?: RefundStatus;
  ticket__event?: string;
  ordering?: string;
}

export type TicketResponse = ApiResponse<Ticket>;
export type TicketListResponse = ApiResponse<PaginatedResponse<Ticket>>;
export type TicketTypeResponse = ApiResponse<TicketType>;
export type TicketTypeListResponse = ApiResponse<PaginatedResponse<TicketType>>;
export type RefundResponse = ApiResponse<Refund>;
export type RefundListResponse = ApiResponse<PaginatedResponse<Refund>>;
export type TicketPurchaseResult = ApiResponse<TicketPurchaseResponse>;
export type ExportTicketsResult = ApiResponse<ExportTicketsResponse>;
export type ComplementaryTicketsResult =
  ApiResponse<ComplementaryTicketsResponse>;
