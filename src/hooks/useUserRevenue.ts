import { useQueries } from "@tanstack/react-query";
import { useEvent } from "./useEvent";
import { eventService } from "@/services/event.service";
import { useMemo } from "react";

export const useUserRevenue = () => {
  const { useMyEvents } = useEvent();
  const { data: eventsData, isLoading: isLoadingEvents } = useMyEvents({
    owner: true,
  });

  const eventRevenueQueries = useQueries({
    queries:
      eventsData?.result?.results?.map((event) => ({
        queryKey: ["event-revenue", event.id],
        queryFn: () => eventService.getEventRevenue(event.id),
        staleTime: 60 * 1000, // 1 minute
      })) ?? [],
  });

  const totalRevenue = useMemo(() => {
    return eventRevenueQueries.reduce((acc, query) => {
      if (query.isSuccess && query.data?.result?.total_revenue) {
        return acc + Number(query.data.result.total_revenue);
      }
      console.log({ acc });
      return acc;
    }, 0);
  }, [eventRevenueQueries]);

  const isLoading =
    isLoadingEvents || eventRevenueQueries.some((query) => query.isLoading);

  return { totalRevenue, isLoading };
};
