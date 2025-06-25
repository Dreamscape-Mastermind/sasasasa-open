import {
  PromotionAnalyticsQueryParams,
  PromotionAnalyticsResponse,
} from "@/types/promotions";

import { apiClient } from "./api.service";

class PromotionsService {
  private static instance: PromotionsService;
  private readonly baseUrl = "/api/v1";

  private constructor() {}

  public static getInstance(): PromotionsService {
    if (!PromotionsService.instance) {
      PromotionsService.instance = new PromotionsService();
    }
    return PromotionsService.instance;
  }

  public async getAnalytics(
    eventId: string,
    params?: PromotionAnalyticsQueryParams
  ): Promise<PromotionAnalyticsResponse> {
    return apiClient.get<PromotionAnalyticsResponse>(
      `${this.baseUrl}/events/${eventId}/promotions/analytics`,
      params
    );
  }
}

export const promotionsService = PromotionsService.getInstance();
