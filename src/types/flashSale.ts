import {
  ApiResponse,
  DiscountType,
  PaginatedResponse,
  TimeStamped,
} from "./common";

export type FlashSaleStatus = "SCHEDULED" | "ACTIVE" | "ENDED" | "CANCELLED";

export interface RecurrencePatternObject {
  type: "weekly" | "monthly";
  interval?: number;
  day_of_week?: number;
  day_of_month?: number;
  [key: string]: any;
}

export interface FlashSaleTicketType {
  id: string;
  ticket_type: string;
  ticket_type_name: string;
  max_tickets: number;
  tickets_sold: number;
}

export interface FlashSaleTicketTypeRequest {
  ticket_type: string;
  max_tickets: number;
}

export interface FlashSale extends TimeStamped {
  id: string;
  event: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: FlashSaleStatus;
  max_tickets: number;
  tickets_sold: number;
  discount_type: DiscountType;
  discount_amount: number;
  is_recurring: boolean;
  recurrence_pattern: RecurrencePatternObject | null;
  ticket_types: FlashSaleTicketType[];
}

export interface TicketTypeWithFlashSale {
  id: string;
  name: string;
  status: FlashSaleStatus;
  discount_type: DiscountType;
  discount_amount: number;
  discounted_price: number;
  start_date: string;
  end_date: string;
  remaining_tickets: number;
}

export interface FlashSaleTicketTypeStats {
  ticket_type_id: string;
  ticket_type_name: string;
  tickets_sold: number;
  max_tickets: number;
  percentage_sold: number;
  revenue: number;
}

export interface FlashSaleStats {
  total_tickets_sold: number;
  total_revenue: number;
  discount_value: number;
  remaining_tickets: number;
  percentage_sold: number;
  ticket_types: FlashSaleTicketTypeStats[];
  time_remaining: string;
  is_active: boolean;
}

export interface FlashSaleCreateRequest {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  max_tickets: number;
  discount_type: DiscountType;
  discount_amount: number;
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePatternObject;
  ticket_types: FlashSaleTicketTypeRequest[];
}

export interface FlashSaleUpdateRequest {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  max_tickets?: number;
  discount_type?: DiscountType;
  discount_amount?: number;
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePatternObject;
  ticket_types?: FlashSaleTicketTypeRequest[];
}

export interface FlashSaleValidationRequest {
  ticket_type_id: string;
  quantity?: number;
}

export interface FlashSaleValidationResponse {
  valid: boolean;
  discounted_price: number;
  total_price: number;
  remaining_tickets: number;
}

export type FlashSaleResponse = ApiResponse<FlashSale>;
export type FlashSaleListResponse = ApiResponse<PaginatedResponse<FlashSale>>;
export type FlashSaleStatsResponse = ApiResponse<FlashSaleStats>;
export type FlashSaleValidationResult =
  ApiResponse<FlashSaleValidationResponse>;
