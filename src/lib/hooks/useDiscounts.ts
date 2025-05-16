import {
  DiscountCreateRequest,
  DiscountFilterParams,
  DiscountUpdateRequest,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { discountApi } from "../api/discountApiService";
import toast from "react-hot-toast";

export const useDiscounts = (
  eventId: string,
  params?: DiscountFilterParams
) => {
  return useQuery({
    queryKey: ["discounts", eventId, params],
    queryFn: () => discountApi.listDiscounts(eventId, params),
  });
};

export const useDiscount = (eventId: string, discountId: string) => {
  return useQuery({
    queryKey: ["discount", eventId, discountId],
    queryFn: () => discountApi.getDiscount(eventId, discountId),
  });
};

export const useCreateDiscount = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DiscountCreateRequest) =>
      discountApi.createDiscount(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts", eventId] });
      toast.success("Discount created successfully");
    },
    onError: () => {
      toast.error("Failed to create discount");
    },
  });
};

export const useUpdateDiscount = (eventId: string, discountId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DiscountUpdateRequest) =>
      discountApi.updateDiscount(eventId, discountId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts", eventId] });
      queryClient.invalidateQueries({
        queryKey: ["discount", eventId, discountId],
      });
      toast.success("Discount updated successfully");
    },
    onError: () => {
      toast.error("Failed to update discount");
    },
  });
};

export const useDeleteDiscount = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (discountId: string) =>
      discountApi.deleteDiscount(eventId, discountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts", eventId] });
      toast.success("Discount deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete discount");
    },
  });
};

export const useDiscountUsage = (eventId: string, discountId: string) => {
  return useQuery({
    queryKey: ["discountUsage", eventId, discountId],
    queryFn: () => discountApi.getDiscountUsage(eventId, discountId),
  });
};

export const useDiscountAnalytics = (eventId: string, discountId: string) => {
  return useQuery({
    queryKey: ["discountAnalytics", eventId, discountId],
    queryFn: () => discountApi.getDiscountAnalytics(eventId, discountId),
  });
};
