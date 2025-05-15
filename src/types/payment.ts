import { ApiResponse, PaginatedResponse, TimeStamped } from "./common";

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "REQUIRES_ACTION"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED"
  | "EXPIRED";

export type PaymentProvider = "PAYSTACK" | "PESAPAL";
export type PaymentMethod = "CARD" | "MOBILE_MONEY" | "BANK_TRANSFER";
export type FailureReason =
  | "CARD_DECLINED"
  | "INSUFFICIENT_FUNDS"
  | "AUTHENTICATION_FAILED"
  | "EXPIRED"
  | "ABANDONED"
  | "OTHER";

export interface PaystackDetails {
  card_type?: string;
  last4?: string;
  exp_month?: number;
  exp_year?: number;
  bank?: string;
  country_code?: string;
  brand?: string;
  reusable?: boolean;
  channel?: string;
}

export interface PesapalDetails {
  confirmation_code?: string;
  payment_account?: string;
  payment_status_code?: string;
  provider_description?: string;
  status_code?: number;
}

export interface Payment extends TimeStamped {
  id: string;
  reference: string;
  provider: PaymentProvider;
  provider_reference?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method?: PaymentMethod;
  provider_status?: string;
  completed_at?: string | null;
  metadata?: Record<string, any>;
  paystack_details?: PaystackDetails;
  pesapal_details?: PesapalDetails;
  requires_action: boolean;
  failure_reason?: FailureReason | null;
  last_error_message?: string;
  attempts: number;
}

export interface PaymentProviderInfo {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
}

export interface PaymentRetryResponse {
  authorization_url?: string;
  reference: string;
  access_code?: string;
  order_tracking_id?: string;
  redirect_url?: string;
}

export interface PaymentVerifyRequest {
  reference?: string;
  trxref?: string;
}

export type PaymentResponse = ApiResponse<Payment>;
export type PaymentListResponse = ApiResponse<{
  results: Payment[];
}>;
export type PaymentProviderResponse = ApiResponse<PaymentProviderInfo>;
export type PaymentProviderListResponse = ApiResponse<
  PaginatedResponse<PaymentProviderInfo>
>;
export type PaymentRetryResult = ApiResponse<PaymentRetryResponse>;
export type PaymentVerifyResult = ApiResponse<Payment>;
