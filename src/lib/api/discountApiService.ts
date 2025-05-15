import {
  DeleteResponse,
  DiscountAnalyticsResponse,
  DiscountCreateRequest,
  DiscountFilterParams,
  DiscountListResponse,
  DiscountResponse,
  DiscountUpdateRequest,
  DiscountUsageResponse,
} from "@/types";

import axios from "./axios";

export const discountApi = {
  // List all discounts for an event
  listDiscounts: async (eventId: string, params?: DiscountFilterParams) => {
    const response = await axios.get<DiscountListResponse>(
      `/api/v1/events/${eventId}/discounts`,
      { params }
    );
    return response.data;
  },

  // Create a new discount
  createDiscount: async (eventId: string, data: DiscountCreateRequest) => {
    const response = await axios.post<DiscountResponse>(
      `/api/v1/events/${eventId}/discounts`,
      data
    );
    return response.data;
  },

  // Get discount details
  getDiscount: async (eventId: string, discountId: string) => {
    const response = await axios.get<DiscountResponse>(
      `/api/v1/events/${eventId}/discounts/${discountId}`
    );
    return response.data;
  },

  // Update discount
  updateDiscount: async (
    eventId: string,
    discountId: string,
    data: DiscountUpdateRequest
  ) => {
    const response = await axios.patch<DiscountResponse>(
      `/api/v1/events/${eventId}/discounts/${discountId}`,
      data
    );
    return response.data;
  },

  // Delete discount
  deleteDiscount: async (eventId: string, discountId: string) => {
    const response = await axios.delete<DeleteResponse>(
      `/api/v1/events/${eventId}/discounts/${discountId}`
    );
    return response.data;
  },

  // Get discount usage
  getDiscountUsage: async (eventId: string, discountId: string) => {
    const response = await axios.get<DiscountUsageResponse>(
      `/api/v1/events/${eventId}/discounts/${discountId}/usage`
    );
    return response.data;
  },

  // Get discount analytics
  getDiscountAnalytics: async (eventId: string, discountId: string) => {
    const response = await axios.get<DiscountAnalyticsResponse>(
      `/api/v1/events/${eventId}/discounts/${discountId}/analytics`
    );
    return response.data;
  },
};
