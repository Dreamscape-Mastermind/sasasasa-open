import {
  PaymentListResponse,
  PaymentProviderListResponse,
  PaymentProviderResponse,
  PaymentResponse,
  PaymentRetryResult,
  PaymentVerifyRequest,
  PaymentVerifyResult,
} from "@/types";

import axios from "./axios";

export const paymentApi = {
  // List all payments for the authenticated user
  listPayments: async () => {
    const response = await axios.get<PaymentListResponse>("/api/v1/payments");
    return response.data;
  },

  // Get payment details
  getPayment: async (paymentId: string) => {
    const response = await axios.get<PaymentResponse>(
      `/api/v1/payments/${paymentId}`
    );
    return response.data;
  },

  // Verify payment
  verifyPayment: async (data: PaymentVerifyRequest) => {
    const response = await axios.post<PaymentVerifyResult>(
      `/api/v1/payments/verify?reference=${data.reference}&trxref=${data.trxref}`
    );
    return response.data;
  },

  // Retry payment
  retryPayment: async (paymentId: string) => {
    const response = await axios.post<PaymentRetryResult>(
      `/api/v1/payments/${paymentId}/retry`
    );
    return response.data;
  },

  // List payment providers
  listPaymentProviders: async () => {
    const response = await axios.get<PaymentProviderListResponse>(
      "/api/v1/payment-providers"
    );
    return response.data;
  },

  // Get payment provider details
  getPaymentProvider: async (providerId: string) => {
    const response = await axios.get<PaymentProviderResponse>(
      `/api/v1/payment-providers/${providerId}`
    );
    return response.data;
  },
};
