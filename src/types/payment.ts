import {
  Nullable,
  PaginatedResponse,
  SuccessResponse,
  TimeStamp,
} from "./common";

/**
 * Payment status enum
 */
export enum PaymentStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  REQUIRES_ACTION = "REQUIRES_ACTION",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
  EXPIRED = "EXPIRED",
}

/**
 * Payment failure reason enum
 */
export enum PaymentFailureReason {
  CARD_DECLINED = "CARD_DECLINED",
  INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
  AUTHENTICATION_FAILED = "AUTHENTICATION_FAILED",
  EXPIRED = "EXPIRED",
  ABANDONED = "ABANDONED",
  OTHER = "OTHER",
}

/**
 * Payment provider enum
 */
export enum PaymentProvider {
  PAYSTACK = "PAYSTACK",
  PESAPAL = "PESAPAL",
}

/**
 * Base interfaces
 */
export interface BasePaymentEntity extends TimeStamp {
  id: string;
}

/**
 * Payment provider details interfaces
 */
export interface PaystackPaymentDetails extends BasePaymentEntity {
  card_type: Nullable<string>;
  last4: Nullable<string>;
  exp_month: Nullable<number>;
  exp_year: Nullable<number>;
  bank: Nullable<string>;
  country_code: Nullable<string>;
  brand: Nullable<string>;
  reusable: boolean;
  channel: Nullable<string>;
}

export interface PesapalPaymentDetails extends BasePaymentEntity {
  confirmation_code: Nullable<string>;
  payment_account: Nullable<string>;
  payment_status_code: Nullable<string>;
  provider_description: Nullable<string>;
  status_code: Nullable<number>;
}

/**
 * Payment provider configuration interface
 */
export interface PaymentProviderConfig extends BasePaymentEntity {
  name: string;
  code: string;
  description: string;
  is_active: boolean;
}

/**
 * Payment interface
 */
export interface Payment extends BasePaymentEntity {
  reference: string;
  provider: PaymentProvider;
  provider_reference: string;
  user: string; // User ID
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: Nullable<string>;
  tickets: string[]; // Ticket IDs
  completed_at: Nullable<string>;
  metadata: Record<string, any>;
  paystack_details: Nullable<PaystackPaymentDetails>;
  pesapal_details: Nullable<PesapalPaymentDetails>;
  requires_action: boolean;
  failure_reason: Nullable<PaymentFailureReason>;
  last_error_message: Nullable<string>;
  attempts: number;
  provider_status: Nullable<string>;
  customer_first_name: Nullable<string>;
  customer_last_name: Nullable<string>;
  customer_email: Nullable<string>;
}

export interface TransactionResult {
  status: PaymentStatus;
  message: string;
  reference: string;
  amount: number;
  eventId?: string;
  eventTitle?: string;
  currency?: string;
  paymentMethod?: string;
  providerStatus?: string;
  customerName?: string;
  customerEmail?: string;
  ticketCount?: number;
  ticketTypes?: Array<{
    id: string;
    name: string;
    price: string;
    currency?: string;
  }>;
  completedAt?: string;
  provider?: string;
}

/**
 * Request interfaces
 */
export interface InitializePaymentRequest {
  payment: string; // Payment ID
  provider: PaymentProvider;
}

export interface VerifyPaymentRequest {
  reference?: string;
  trxref?: string;
}

export interface RefundPaymentRequest {
  reason: string;
  amount?: number;
}

/**
 * Response interfaces
 */
export interface PaymentResponse extends SuccessResponse<Payment> {}

export interface PaymentsResponse
  extends SuccessResponse<PaginatedResponse<Payment>> {}

export interface PaymentProviderResponse
  extends SuccessResponse<PaymentProviderConfig> {}

export interface PaymentProvidersResponse
  extends SuccessResponse<PaginatedResponse<PaymentProviderConfig>> {}

export interface PaymentVerificationResponse extends SuccessResponse<Payment> {}

/**
 * Actual API response structure for payment verification (matches real API)
 */
export interface PaymentVerificationApiResponse {
  status: string;
  message: string;
  result: Payment;
}

export interface PaymentRefundResponse
  extends SuccessResponse<{
    refund_id: string;
    payment_id: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    reason: string;
    created_at: string;
  }> {}

export interface PaymentDetailsResponse {
  authorization_url?: string;
  reference: string;
  access_code?: string;
  order_tracking_id?: string;
  redirect_url?: string;
}

export interface PaymentMethodResponse
  extends SuccessResponse<PaymentMethodData> {}

export interface PaymentMethodsResponse
  extends SuccessResponse<PaginatedResponse<PaymentMethodData>> {}

export interface PaymentIntentResponse extends SuccessResponse<PaymentItem> {}

export interface PaymentAnalyticsResponse
  extends SuccessResponse<{
    total_revenue: number;
    pending_payments: number;
    avg_ticket_price: number;
    refunds: number;
    revenue_change: string;
    pending_transactions: number;
    refund_count: number;
  }> {}

/**
 * Query parameter interfaces
 */
export interface PaymentQueryParams {
  status?: PaymentStatus;
  provider?: PaymentProvider;
  user?: string;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
  event?: string;
  verbose?: boolean;
}

export interface PaymentProviderQueryParams {
  is_active?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
}

export interface PaymentAnalyticsQueryParams {
  event?: string;
}
