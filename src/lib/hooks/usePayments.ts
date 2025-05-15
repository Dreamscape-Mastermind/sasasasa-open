import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { PaymentVerifyRequest } from "@/types/payment";
import { paymentApi } from "../api/paymentApiService";
import { toast } from "react-hot-toast";

export const usePayments = () => {
  return useQuery({
    queryKey: ["payments"],
    queryFn: () => paymentApi.listPayments(),
  });
};

export const usePayment = (paymentId: string) => {
  return useQuery({
    queryKey: ["payment", paymentId],
    queryFn: () => paymentApi.getPayment(paymentId),
  });
};

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PaymentVerifyRequest) => paymentApi.verifyPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Payment verified successfully");
    },
    onError: () => {
      toast.error("Failed to verify payment");
    },
  });
};

export const useRetryPayment = (paymentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => paymentApi.retryPayment(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment", paymentId] });
      toast.success("Payment retry initialized successfully");
    },
    onError: () => {
      toast.error("Failed to retry payment");
    },
  });
};

export const usePaymentProviders = () => {
  return useQuery({
    queryKey: ["paymentProviders"],
    queryFn: () => paymentApi.listPaymentProviders(),
  });
};

export const usePaymentProvider = (providerId: string) => {
  return useQuery({
    queryKey: ["paymentProvider", providerId],
    queryFn: () => paymentApi.getPaymentProvider(providerId),
  });
};
