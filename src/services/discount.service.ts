import {
  CreateDiscountRequest,
  DiscountAnalyticsResponse,
  DiscountQueryParams,
  DiscountResponse,
  DiscountUsageQueryParams,
  DiscountUsageResponse,
  DiscountsResponse,
  UpdateDiscountRequest,
} from "@/types/discount";

import { apiClient } from "./api.service";

/**
 * Discount service for handling all discount-related operations
 */
class DiscountService {
  private static instance: DiscountService;
  private readonly baseUrl = "/api/v1";

  private constructor() {}

  public static getInstance(): DiscountService {
    if (!DiscountService.instance) {
      DiscountService.instance = new DiscountService();
    }
    return DiscountService.instance;
  }

  /**
   * Discount operations
   */
  public async listDiscounts(eventId: string, params?: DiscountQueryParams): Promise<DiscountsResponse> {
    return apiClient.get<DiscountsResponse>(`${this.baseUrl}/events/${eventId}/discounts`, { params });
  }

  public async getDiscount(eventId: string, discountId: string): Promise<DiscountResponse> {
    return apiClient.get<DiscountResponse>(`${this.baseUrl}/events/${eventId}/discounts/${discountId}`);
  }

  public async createDiscount(eventId: string, data: CreateDiscountRequest): Promise<DiscountResponse> {
    return apiClient.post<DiscountResponse>(`${this.baseUrl}/events/${eventId}/discounts`, data);
  }

  public async updateDiscount(
    eventId: string,
    discountId: string,
    data: UpdateDiscountRequest
  ): Promise<DiscountResponse> {
    return apiClient.patch<DiscountResponse>(`${this.baseUrl}/events/${eventId}/discounts/${discountId}`, data);
  }

  public async deleteDiscount(eventId: string, discountId: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/events/${eventId}/discounts/${discountId}`);
  }

  /**
   * Discount usage operations
   */
  public async getDiscountUsage(
    eventId: string,
    discountId: string,
    params?: DiscountUsageQueryParams
  ): Promise<DiscountUsageResponse> {
    return apiClient.get<DiscountUsageResponse>(`${this.baseUrl}/events/${eventId}/discounts/${discountId}/usage`, {
      params,
    });
  }

  /**
   * Discount analytics operations
   */
  public async getDiscountAnalytics(eventId: string, discountId: string): Promise<DiscountAnalyticsResponse> {
    return apiClient.get<DiscountAnalyticsResponse>(
      `${this.baseUrl}/events/${eventId}/discounts/${discountId}/analytics`
    );
  }
}

export const discountService = DiscountService.getInstance();
