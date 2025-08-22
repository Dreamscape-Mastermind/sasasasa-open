import {
  Nullable,
  PaginatedResponse,
  SuccessResponse,
  TimeStamp,
} from "./common";

/**
 * Flash sale status enum
 */
export enum FlashSaleStatus {
  SCHEDULED = "SCHEDULED",
  ACTIVE = "ACTIVE",
  ENDED = "ENDED",
  CANCELLED = "CANCELLED",
}

/**
 * Flash sale discount type enum
 */
export enum FlashSaleDiscountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED = "FIXED",
}

/**
 * Base interfaces
 */
export interface BaseFlashSaleEntity extends TimeStamp {
  id: string;
}

/**
 * Flash sale ticket type interface
 */
export interface FlashSaleTicketType extends BaseFlashSaleEntity {
  ticket_type: string; // TicketType ID
  ticket_type_name: string; // Read-only field from serializer
  max_tickets: number;
  tickets_sold: number; // Read-only field from serializer
}

/**
 * Recurring pattern interface
 */
export interface RecurrencePattern {
  type: "weekly" | "monthly";
  interval?: number; // Optional: repeat every N weeks/months (default: 1)
  end_after?: number; // Optional: stop after N occurrences
  end_date?: string; // Optional: stop by specific date (ISO 8601 format)
}

/**
 * Flash sale interface
 */
export interface FlashSale extends BaseFlashSaleEntity {
  event: string; // Event ID
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: FlashSaleStatus;
  max_tickets: number;
  tickets_sold: number; // Read-only field from serializer
  discount_type: FlashSaleDiscountType;
  discount_amount: number;
  is_recurring: boolean;
  recurrence_pattern: Nullable<RecurrencePattern>;
  ticket_types: FlashSaleTicketType[];
}

export interface TicketTypeWithFlashSale extends BaseFlashSaleEntity {
  name: string;
  status: FlashSaleStatus;
  discount_type: FlashSaleDiscountType;
  discount_amount: number;
  discounted_price: number;
  start_date: string;
  end_date: string;
  remaining_tickets: number;
}

/**
 * Request interfaces
 */
export interface CreateFlashSaleRequest {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  max_tickets: number;
  discount_type: FlashSaleDiscountType;
  discount_amount: number;
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePattern;
  ticket_types: {
    ticket_type: string; // TicketType ID
    max_tickets: number;
  }[];
}

export interface UpdateFlashSaleRequest
  extends Partial<CreateFlashSaleRequest> {}

export interface ValidatePurchaseRequest {
  ticket_type_id: string;
  quantity: number;
}

export interface FlashSaleOverallStats {
  total_flash_sales: number;
  active_flash_sales: number;
  total_tickets_sold: number;
  total_revenue: number;
  ticket_type_stats: Record<
    string,
    {
      tickets_sold: number;
      revenue: number;
      average_discount: number;
      count: number;
    }
  >;
  status_distribution: Array<{
    status: FlashSaleStatus;
    count: number;
  }>;
  sales_over_time: Array<{
    date: string;
    count: number;
    tickets_sold: number;
  }>;
}

/**
 * Response interfaces
 */
export interface FlashSaleResponse extends SuccessResponse<FlashSale> {}

export interface FlashSalesResponse
  extends SuccessResponse<PaginatedResponse<FlashSale>> {}

export interface FlashSaleStatsResponse
  extends SuccessResponse<{
    total_sales: number;
    total_revenue: number;
    average_discount: number;
    sales_by_date: Record<string, number>;
    total_unique_customers: number;
  }> {}

export interface ValidatePurchaseResponse
  extends SuccessResponse<{
    is_valid: boolean;
    message: string;
    discount_amount?: number;
  }> {}

export interface FlashSaleOverallStatsResponse
  extends SuccessResponse<FlashSaleOverallStats> {}

/**
 * Query parameter interfaces
 */
export interface FlashSaleQueryParams {
  event?: string;
  status?: FlashSaleStatus;
  search?: string;
  ordering?: string;
  page?: number;
  verbose?: boolean;
}

export interface ActiveFlashSaleQueryParams {
  ticket_type_id: string;
}
