import {
  DeleteResponse,
  FlashSaleCreateRequest,
  FlashSaleListResponse,
  FlashSaleResponse,
  FlashSaleStatsResponse,
  FlashSaleUpdateRequest,
  FlashSaleValidationRequest,
  FlashSaleValidationResult,
} from "@/types";

import axios from "./axios";

export const flashSaleApi = {
  // List all flash sales for an event
  listFlashSales: async (eventId: string) => {
    const response = await axios.get<FlashSaleListResponse>(
      `/api/v1/events/${eventId}/flash-sales`
    );
    return response.data;
  },

  // Create a new flash sale
  createFlashSale: async (eventId: string, data: FlashSaleCreateRequest) => {
    const response = await axios.post<FlashSaleResponse>(
      `/api/v1/events/${eventId}/flash-sales`,
      data
    );
    return response.data;
  },

  // Get flash sale details
  getFlashSale: async (eventId: string, flashSaleId: string) => {
    const response = await axios.get<FlashSaleResponse>(
      `/api/v1/events/${eventId}/flash-sales/${flashSaleId}`
    );
    return response.data;
  },

  // Update flash sale
  updateFlashSale: async (
    eventId: string,
    flashSaleId: string,
    data: FlashSaleUpdateRequest
  ) => {
    const response = await axios.patch<FlashSaleResponse>(
      `/api/v1/events/${eventId}/flash-sales/${flashSaleId}`,
      data
    );
    return response.data;
  },

  // Delete flash sale
  deleteFlashSale: async (eventId: string, flashSaleId: string) => {
    const response = await axios.delete<DeleteResponse>(
      `/api/v1/events/${eventId}/flash-sales/${flashSaleId}`
    );
    return response.data;
  },

  // Cancel flash sale
  cancelFlashSale: async (eventId: string, flashSaleId: string) => {
    const response = await axios.post<DeleteResponse>(
      `/api/v1/events/${eventId}/flash-sales/${flashSaleId}/cancel`
    );
    return response.data;
  },

  // Activate flash sale
  activateFlashSale: async (eventId: string, flashSaleId: string) => {
    const response = await axios.get<DeleteResponse>(
      `/api/v1/events/${eventId}/flash-sales/${flashSaleId}/activate`
    );
    return response.data;
  },

  // Validate purchase with flash sale
  validatePurchase: async (
    eventId: string,
    flashSaleId: string,
    data: FlashSaleValidationRequest
  ) => {
    const response = await axios.post<FlashSaleValidationResult>(
      `/api/v1/events/${eventId}/flash-sales/${flashSaleId}/validate_purchase`,
      data
    );
    return response.data;
  },

  // Get active flash sale for a ticket type
  getActiveSale: async (eventId: string, ticketTypeId: string) => {
    const params = { ticket_type_id: ticketTypeId };
    const response = await axios.get<FlashSaleResponse>(
      `/api/v1/events/${eventId}/flash-sales/get_active_sale`,
      { params }
    );
    return response.data;
  },

  // Get flash sale statistics
  getFlashSaleStats: async (eventId: string, flashSaleId: string) => {
    const response = await axios.get<FlashSaleStatsResponse>(
      `/api/v1/events/${eventId}/flash-sales/${flashSaleId}/stats`
    );
    return response.data;
  },
};
