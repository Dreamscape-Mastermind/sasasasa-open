import type {
  CreateFlashSaleRequest,
  FlashSaleQueryParams,
  UpdateFlashSaleRequest,
  ValidatePurchaseRequest,
} from "@/types/flashsale";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { flashSaleService } from "@/services/flashsale.service";

export const useFlashSale = () => {
  const queryClient = useQueryClient();

  // Flash Sales
  const useFlashSales = (eventId: string, params?: FlashSaleQueryParams) => {
    return useQuery({
      queryKey: ["flash-sales", eventId, params],
      queryFn: () => flashSaleService.listFlashSales(eventId, params),
    });
  };

  const useSingleFlashSale = (eventId: string, flashSaleId: string) => {
    return useQuery({
      queryKey: ["flash-sale", eventId, flashSaleId],
      queryFn: () => flashSaleService.getFlashSale(eventId, flashSaleId),
      enabled: !!eventId && !!flashSaleId,
    });
  };

  const useCreateFlashSale = (eventId: string) => {
    return useMutation({
      mutationFn: (data: CreateFlashSaleRequest) =>
        flashSaleService.createFlashSale(eventId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["flash-sales", eventId] });
      },
    });
  };

  const useUpdateFlashSale = (eventId: string, flashSaleId: string) => {
    return useMutation({
      mutationFn: (data: UpdateFlashSaleRequest) =>
        flashSaleService.updateFlashSale(eventId, flashSaleId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["flash-sales", eventId] });
        queryClient.invalidateQueries({
          queryKey: ["flash-sale", eventId, flashSaleId],
        });
      },
    });
  };

  const useDeleteFlashSale = (eventId: string) => {
    return useMutation({
      mutationFn: (flashSaleId: string) =>
        flashSaleService.deleteFlashSale(eventId, flashSaleId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["flash-sales", eventId] });
      },
    });
  };

  // Flash Sale Actions
  const useCancelFlashSale = (eventId: string) => {
    return useMutation({
      mutationFn: (flashSaleId: string) =>
        flashSaleService.cancelFlashSale(eventId, flashSaleId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["flash-sales", eventId] });
      },
    });
  };

  const useActivateFlashSale = (eventId: string) => {
    return useMutation({
      mutationFn: (flashSaleId: string) =>
        flashSaleService.activateFlashSale(eventId, flashSaleId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["flash-sales", eventId] });
      },
    });
  };

  // Flash Sale Validation
  const useValidatePurchase = (eventId: string, flashSaleId: string) => {
    return useMutation({
      mutationFn: (data: ValidatePurchaseRequest) =>
        flashSaleService.validatePurchase(eventId, flashSaleId, data),
    });
  };

  // Active Flash Sale
  const useActiveSale = (params: { ticket_type_id: string }) => {
    return useQuery({
      queryKey: ["active-sale", params],
      queryFn: () => flashSaleService.getActiveSale(params),
    });
  };

  // Flash Sale Stats
  const useFlashSaleStats = (eventId: string, flashSaleId: string) => {
    return useQuery({
      queryKey: ["flash-sale-stats", eventId, flashSaleId],
      queryFn: () => flashSaleService.getFlashSaleStats(eventId, flashSaleId),
    });
  };

  const useFlashSaleOverallStats = (eventId: string) => {
    return useQuery({
      queryKey: ["flash-sale-overall-stats", eventId],
      queryFn: () => flashSaleService.getFlashSaleOverallStats(eventId),
    });
  };

  return {
    // Flash Sales
    useFlashSales,
    useSingleFlashSale,
    useCreateFlashSale,
    useUpdateFlashSale,
    useDeleteFlashSale,
    // Flash Sale Actions
    useCancelFlashSale,
    useActivateFlashSale,
    // Flash Sale Validation
    useValidatePurchase,
    // Active Flash Sale
    useActiveSale,
    // Flash Sale Stats
    useFlashSaleStats,
    useFlashSaleOverallStats,
  };
};
