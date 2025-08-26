import { type SuccessResponse } from "./common";

export interface PromotionAnalytics {
  overview: {
    totalRevenue: number;
    totalPromotions: number;
    averageDiscount: number;
    conversionRate: number;
    revenueGrowth: number;
    promotionGrowth: number;
    discountGrowth: number;
    conversionGrowth: number;
  };
  revenueByType: Array<{
    type: string;
    revenue: number;
    percentage: number;
  }>;
  topPerformingPromotions: Array<{
    id: string;
    name: string;
    type: string;
    revenue: number;
    uses: number;
    conversionRate: number;
    discount: number;
  }>;
  usageTrends: Array<{
    month: string;
    discountCodes: number;
    flashSales: number;
  }>;
  ticketTypeDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

/**
 * Response interfaces
 */
export interface PromotionAnalyticsResponse
  extends SuccessResponse<PromotionAnalytics> {}

export interface PromotionAnalyticsQueryParams {
  date_range?: "7d" | "30d" | "90d" | "1y";
  promotion_type?: "all" | "discount-codes" | "flash-sales";
}
