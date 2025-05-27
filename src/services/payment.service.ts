import {
  InitializePaymentRequest,
  PaymentProviderQueryParams,
  PaymentProviderResponse,
  PaymentProvidersResponse,
  PaymentQueryParams,
  PaymentRefundResponse,
  PaymentResponse,
  PaymentVerificationResponse,
  PaymentsResponse,
  RefundPaymentRequest,
  VerifyPaymentRequest,
} from "@/types/payment";

import { apiClient } from "./api.service";

/**
 * Payment service for handling all payment-related operations
 */
class PaymentService {
  private static instance: PaymentService;
  private readonly baseUrl = "/api/v1";

  private constructor() {}

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * Payment operations
   */
  public async listPayments(params?: PaymentQueryParams): Promise<PaymentsResponse> {
    return apiClient.get<PaymentsResponse>(`${this.baseUrl}/payments`, { params });
  }

  public async getPayment(id: string): Promise<PaymentResponse> {
    return apiClient.get<PaymentResponse>(`${this.baseUrl}/payments/${id}`);
  }

  public async verifyPayment(data: VerifyPaymentRequest): Promise<PaymentVerificationResponse> {
    return apiClient.post<PaymentVerificationResponse>(`${this.baseUrl}/payments/verify`, data);
  }

  public async retryPayment(id: string): Promise<PaymentResponse> {
    return apiClient.post<PaymentResponse>(`${this.baseUrl}/payments/${id}/retry`);
  }

  public async refundPayment(id: string, data: RefundPaymentRequest): Promise<PaymentRefundResponse> {
    return apiClient.post<PaymentRefundResponse>(`${this.baseUrl}/payments/${id}/refund`, data);
  }

  /**
   * Payment provider operations
   */
  public async listPaymentProviders(params?: PaymentProviderQueryParams): Promise<PaymentProvidersResponse> {
    return apiClient.get<PaymentProvidersResponse>(`${this.baseUrl}/payment-providers`, { params });
  }

  public async getPaymentProvider(id: string): Promise<PaymentProviderResponse> {
    return apiClient.get<PaymentProviderResponse>(`${this.baseUrl}/payment-providers/${id}`);
  }

  /**
   * Payment initialization
   */
  public async initializePayment(data: InitializePaymentRequest): Promise<PaymentResponse> {
    return apiClient.post<PaymentResponse>(`${this.baseUrl}/payments/initialize`, data);
  }
}

export const paymentService = PaymentService.getInstance();
