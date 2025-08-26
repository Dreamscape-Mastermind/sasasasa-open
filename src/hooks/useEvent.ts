import type {
  AcceptTeamInvitationRequest,
  CreateEventRequest,
  EventQueryParams,
  InviteTeamMemberRequest,
  LocationQueryParams,
  PerformerQueryParams,
  TeamMemberQueryParams,
  UpdateEventRequest,
} from "@/types/event";
import type {
  EventAnalyticsExportRequest,
  EventAnalyticsExportResponse,
  EventAnalyticsQuery,
  EventAnalyticsResponse,
} from "@/types/analytics";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { eventService } from "@/services/event.service";

export const useEvent = () => {
  const queryClient = useQueryClient();

  // Events
  const useEvents = (params?: EventQueryParams) => {
    return useQuery({
      queryKey: ["events", params],
      queryFn: () => eventService.listEvents(params),
      staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection time
    });
  };

  const useEvent = (id: string) => {
    return useQuery({
      queryKey: ["event", id],
      enabled: !!id,
      queryFn: () => eventService.getEvent(id),
      staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection time
    });
  };

  const useEventAnalytics = (id: string, params?: EventAnalyticsQuery) => {
    return useQuery<EventAnalyticsResponse>({
      queryKey: ["event-analytics", id, params],
      enabled: !!id,
      queryFn: () => eventService.getEventAnalytics(id, params),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    });
  };

  const useCreateEvent = () => {
    return useMutation({
      mutationFn: (data: CreateEventRequest) => eventService.createEvent(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["events"] });
      },
    });
  };

  const useUpdateEvent = (id: string, config?: { onSuccess?: () => void }) => {
    return useMutation({
      mutationFn: (data: UpdateEventRequest) =>
        eventService.updateEvent(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["events"] });
        queryClient.invalidateQueries({ queryKey: ["event", id] });
        config?.onSuccess?.();
      },
    });
  };

  const useDeleteEvent = () => {
    return useMutation({
      mutationFn: (id: string) => eventService.deleteEvent(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["events"] });
      },
    });
  };

  const usePublishEvent = () => {
    return useMutation({
      mutationFn: (id: string) => eventService.publishEvent(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["events"] });
      },
    });
  };

  const useCancelEvent = () => {
    return useMutation({
      mutationFn: (id: string) => eventService.cancelEvent(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["events"] });
      },
    });
  };

  const useExportEventAnalytics = (id: string) => {
    return useMutation<
      EventAnalyticsExportResponse,
      unknown,
      EventAnalyticsExportRequest
    >({
      mutationFn: (data: EventAnalyticsExportRequest) =>
        eventService.exportEventAnalytics(id, data),
    });
  };

  // Featured Events
  const useFeaturedEvents = () => {
    return useQuery({
      queryKey: ["featured-events"],
      queryFn: () => eventService.getFeaturedEvents(),
    });
  };

  // Locations
  const useLocations = (params?: LocationQueryParams) => {
    return useQuery({
      queryKey: ["locations", params],
      queryFn: () => eventService.listLocations(params),
    });
  };

  const useLocation = (id: string) => {
    return useQuery({
      queryKey: ["location", id],
      queryFn: () => eventService.getLocation(id),
    });
  };

  // Performers
  const usePerformers = (eventId: string, params?: PerformerQueryParams) => {
    return useQuery({
      queryKey: ["performers", eventId, params],
      queryFn: () => eventService.listPerformers(eventId, params),
    });
  };

  const usePerformer = (eventId: string, performerId: string) => {
    return useQuery({
      queryKey: ["performer", eventId, performerId],
      queryFn: () => eventService.getPerformer(eventId, performerId),
    });
  };

  // Team Members
  const useTeamMembers = (eventId: string, params?: TeamMemberQueryParams) => {
    return useQuery({
      queryKey: ["team-members", eventId, params],
      queryFn: () => eventService.listTeamMembers(eventId, params),
    });
  };

  const useTeamMember = (eventId: string, memberId: string) => {
    return useQuery({
      queryKey: ["team-member", eventId, memberId],
      queryFn: () => eventService.getTeamMember(eventId, memberId),
    });
  };

  const useInviteTeamMember = (eventId: string) => {
    return useMutation({
      mutationFn: (data: InviteTeamMemberRequest) =>
        eventService.inviteTeamMember(eventId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["team-members", eventId] });
      },
    });
  };

  const useRemoveTeamMember = (eventId: string) => {
    return useMutation({
      mutationFn: (memberId: string) =>
        eventService.removeTeamMember(eventId, memberId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["team-members", eventId] });
      },
    });
  };

  const useAcceptTeamInvitation = (eventId: string) => {
    return useMutation({
      mutationFn: (data: AcceptTeamInvitationRequest) =>
        eventService.acceptTeamInvitation(eventId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["team-members", eventId] });
      },
    });
  };

  // User's Events
  const useMyEvents = (params?: EventQueryParams & { enabled?: boolean }) => {
    const { enabled = true, ...queryParams } = params || {};
    return useQuery({
      queryKey: ["my-events", queryParams],
      queryFn: () => eventService.getMyEvents(queryParams),
      enabled: enabled,
    });
  };

  return {
    // Events
    useEvents,
    useEvent,
    useCreateEvent,
    useUpdateEvent,
    useDeleteEvent,
    usePublishEvent,
    useCancelEvent,
    // Analytics
    useEventAnalytics,
    useExportEventAnalytics,
    // Featured Events
    useFeaturedEvents,
    // Locations
    useLocations,
    useLocation,
    // Performers
    usePerformers,
    usePerformer,
    // Team Members
    useTeamMembers,
    useTeamMember,
    useInviteTeamMember,
    useRemoveTeamMember,
    useAcceptTeamInvitation,
    // User's Events
    useMyEvents,
  };
};
