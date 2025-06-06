import type {
  CreateDiscountRequest,
  DiscountQueryParams,
  DiscountUsageQueryParams,
  UpdateDiscountRequest,
} from "@/types/discount";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { discountService } from "@/services/discount.service";

export const useDiscount = () => {
  const queryClient = useQueryClient();

  // Discounts
  const useDiscounts = (eventId: string, params?: DiscountQueryParams) => {
    return useQuery({
      queryKey: ["discounts", eventId, params],
      queryFn: () => discountService.listDiscounts(eventId, params),
    });
  };

  const useDiscount = (eventId: string, discountId: string) => {
    return useQuery({
      queryKey: ["discount", eventId, discountId],
      queryFn: () => discountService.getDiscount(eventId, discountId),
    });
  };

  const useCreateDiscount = (eventId: string) => {
    return useMutation({
      mutationFn: (data: CreateDiscountRequest) => discountService.createDiscount(eventId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["discounts", eventId] });
      },
    });
  };

  const useUpdateDiscount = (eventId: string, discountId: string) => {
    return useMutation({
      mutationFn: (data: UpdateDiscountRequest) => discountService.updateDiscount(eventId, discountId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["discounts", eventId] });
        queryClient.invalidateQueries({ queryKey: ["discount", eventId, discountId] });
      },
    });
  };

  const useDeleteDiscount = (eventId: string) => {
    return useMutation({
      mutationFn: (discountId: string) => discountService.deleteDiscount(eventId, discountId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["discounts", eventId] });
      },
    });
  };

  // Discount Usage
  const useDiscountUsage = (eventId: string, discountId: string, params?: DiscountUsageQueryParams) => {
    return useQuery({
      queryKey: ["discount-usage", eventId, discountId, params],
      queryFn: () => discountService.getDiscountUsage(eventId, discountId, params),
    });
  };

  // Discount Analytics
  const useDiscountAnalytics = (eventId: string, discountId: string) => {
    return useQuery({
      queryKey: ["discount-analytics", eventId, discountId],
      queryFn: () => discountService.getDiscountAnalytics(eventId, discountId),
    });
  };

  return {
    // Discounts
    useDiscounts,
    useDiscount,
    useCreateDiscount,
    useUpdateDiscount,
    useDeleteDiscount,
    // Discount Usage
    useDiscountUsage,
    // Discount Analytics
    useDiscountAnalytics,
  };
};
