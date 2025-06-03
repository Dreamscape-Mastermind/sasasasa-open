import type {
  InitializePaymentRequest,
  PaymentProviderQueryParams,
  PaymentQueryParams,
  RefundPaymentRequest,
  VerifyPaymentRequest,
} from "@/types/payment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { paymentService } from "@/services/payment.service";

export const usePayment = () => {
  const queryClient = useQueryClient();

  // Payments
  const usePayments = (params?: PaymentQueryParams) => {
    return useQuery({
      queryKey: ["payments", params],
      queryFn: () => paymentService.listPayments(params),
    });
  };

  const usePayment = (id: string) => {
    return useQuery({
      queryKey: ["payment", id],
      queryFn: () => paymentService.getPayment(id),
    });
  };

  const useVerifyPayment = () => {
    return useMutation({
      mutationFn: (data: VerifyPaymentRequest) =>
        paymentService.verifyPayment(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["payments"] });
      },
    });
  };

  const useRetryPayment = () => {
    return useMutation({
      mutationFn: (id: string) => paymentService.retryPayment(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["payments"] });
      },
    });
  };

  const useRefundPayment = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: RefundPaymentRequest }) =>
        paymentService.refundPayment(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["payments"] });
      },
    });
  };

  // Payment Providers
  const usePaymentProviders = (params?: PaymentProviderQueryParams) => {
    return useQuery({
      queryKey: ["payment-providers", params],
      queryFn: () => paymentService.listPaymentProviders(params),
    });
  };

  const usePaymentProvider = (id: string) => {
    return useQuery({
      queryKey: ["payment-provider", id],
      queryFn: () => paymentService.getPaymentProvider(id),
    });
  };

  // Payment Initialization
  const useInitializePayment = () => {
    return useMutation({
      mutationFn: (data: InitializePaymentRequest) =>
        paymentService.initializePayment(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["payments"] });
      },
    });
  };

  return {
    // Payments
    usePayments,
    usePayment,
    useVerifyPayment,
    useRetryPayment,
    useRefundPayment,
    // Payment Providers
    usePaymentProviders,
    usePaymentProvider,
    // Payment Initialization
    useInitializePayment,
  };
};
