import type {
  CheckInByTicketNumberRequest,
  CheckInQueryParams,
  ScanTicketRequest,
} from "@/types/checkin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { checkinService } from "@/services/checkin.service";

export const useCheckin = () => {
  const queryClient = useQueryClient();

  const useCheckIns = (eventId: string, params?: CheckInQueryParams) => {
    return useQuery({
      queryKey: ["checkins", eventId, params],
      queryFn: () => checkinService.listCheckIns(eventId, params),
    });
  };

  const useCheckIn = (eventId: string, checkInId: string) => {
    return useQuery({
      queryKey: ["checkin", eventId, checkInId],
      queryFn: () => checkinService.getCheckIn(eventId, checkInId),
    });
  };

  const useScanTicket = (eventId: string) => {
    return useMutation({
      mutationFn: (data: ScanTicketRequest) =>
        checkinService.scanTicket(eventId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["checkins", eventId] });
        queryClient.invalidateQueries({ queryKey: ["checkin-stats", eventId] });
      },
      retry: false,
    });
  };

  const useCheckInStats = (eventId: string) => {
    return useQuery({
      queryKey: ["checkin-stats", eventId],
      queryFn: () => checkinService.getCheckInStats(eventId),
    });
  };

  const useDeviceCheckIns = (eventId: string, deviceId: string) => {
    return useQuery({
      queryKey: ["device-checkins", eventId, deviceId],
      queryFn: () => checkinService.getDeviceCheckIns(eventId, deviceId),
    });
  };

  const useUserCheckIns = (eventId: string) => {
    return useQuery({
      queryKey: ["user-checkins", eventId],
      queryFn: () => checkinService.getUserCheckIns(eventId),
    });
  };

  const useCheckInByTicketNumber = (eventId: string) => {
    return useMutation({
      mutationFn: (data: CheckInByTicketNumberRequest) =>
        checkinService.checkInByTicketNumber(eventId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["checkins", eventId] });
        queryClient.invalidateQueries({ queryKey: ["checkin-stats", eventId] });
      },
      retry: false,
    });
  };

  return {
    useCheckIns,
    useCheckIn,
    useScanTicket,
    useCheckInStats,
    useDeviceCheckIns,
    useUserCheckIns,
    useCheckInByTicketNumber,
  };
};
