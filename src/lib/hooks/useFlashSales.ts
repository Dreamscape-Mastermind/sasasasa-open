import {
  FlashSaleCreateRequest,
  FlashSaleUpdateRequest,
  FlashSaleValidationRequest,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { flashSaleApi } from "../api/flashSaleApiService";
import toast from "react-hot-toast";

export const useFlashSales = (eventId: string) => {
  return useQuery({
    queryKey: ["flashSales", eventId],
    queryFn: () => flashSaleApi.listFlashSales(eventId),
  });
};

export const useFlashSale = (eventId: string, flashSaleId: string) => {
  return useQuery({
    queryKey: ["flashSale", eventId, flashSaleId],
    queryFn: () => flashSaleApi.getFlashSale(eventId, flashSaleId),
  });
};

export const useCreateFlashSale = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FlashSaleCreateRequest) =>
      flashSaleApi.createFlashSale(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashSales", eventId] });
      toast.success("Flash sale created successfully");
    },
    onError: () => {
      toast.error("Failed to create flash sale");
    },
  });
};

export const useUpdateFlashSale = (eventId: string, flashSaleId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FlashSaleUpdateRequest) =>
      flashSaleApi.updateFlashSale(eventId, flashSaleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashSales", eventId] });
      queryClient.invalidateQueries({
        queryKey: ["flashSale", eventId, flashSaleId],
      });
      toast.success("Flash sale updated successfully");
    },
    onError: () => {
      toast.error("Failed to update flash sale");
    },
  });
};

export const useDeleteFlashSale = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (flashSaleId: string) =>
      flashSaleApi.deleteFlashSale(eventId, flashSaleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashSales", eventId] });
      toast.success("Flash sale deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete flash sale");
    },
  });
};

export const useCancelFlashSale = (eventId: string, flashSaleId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => flashSaleApi.cancelFlashSale(eventId, flashSaleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashSales", eventId] });
      queryClient.invalidateQueries({
        queryKey: ["flashSale", eventId, flashSaleId],
      });
      toast.success("Flash sale cancelled successfully");
    },
    onError: () => {
      toast.error("Failed to cancel flash sale");
    },
  });
};

export const useActivateFlashSale = (eventId: string, flashSaleId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => flashSaleApi.activateFlashSale(eventId, flashSaleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashSales", eventId] });
      queryClient.invalidateQueries({
        queryKey: ["flashSale", eventId, flashSaleId],
      });
      toast.success("Flash sale activated successfully");
    },
    onError: () => {
      toast.error("Failed to activate flash sale");
    },
  });
};

export const useValidateFlashSalePurchase = (
  eventId: string,
  flashSaleId: string
) => {
  return useMutation({
    mutationFn: (data: FlashSaleValidationRequest) =>
      flashSaleApi.validatePurchase(eventId, flashSaleId, data),
  });
};

export const useActiveFlashSale = (eventId: string, ticketTypeId: string) => {
  return useQuery({
    queryKey: ["activeFlashSale", eventId, ticketTypeId],
    queryFn: () => flashSaleApi.getActiveSale(eventId, ticketTypeId),
  });
};

export const useFlashSaleStats = (eventId: string, flashSaleId: string) => {
  return useQuery({
    queryKey: ["flashSaleStats", eventId, flashSaleId],
    queryFn: () => flashSaleApi.getFlashSaleStats(eventId, flashSaleId),
  });
};
