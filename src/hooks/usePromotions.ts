import { PromotionAnalyticsQueryParams } from "@/types/promotions";
import { useQuery } from "@tanstack/react-query";
import { promotionsService } from "@/services/promotions.service";

export const usePromotions = () => {
  const useAnalytics = (
    eventId: string,
    params?: PromotionAnalyticsQueryParams
  ) => {
    return useQuery({
      queryKey: ["promotions", "analytics", eventId, params],
      queryFn: () => promotionsService.getAnalytics(eventId, params),
    });
  };

  return {
    useAnalytics,
  };
};
