import type {
  AcceptTeamInvitationRequest,
  CategoryQueryParams,
  CreateEventRequest,
  EventFormatQueryParams,
  EventQueryParams,
  EventTagQueryParams,
  EventTypeQueryParams,
  InviteTeamMemberRequest,
  LocationQueryParams,
  PerformerQueryParams,
  TeamMemberQueryParams,
  TeamMemberRole,
  UpdateEventRequest,
} from "@/types/event";
import type {
  EventAnalyticsExportRequest,
  EventAnalyticsExportResponse,
  EventAnalyticsQuery,
  EventAnalyticsResponse,
} from "@/types/analytics";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
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

  const useEventRevenue = (id: string) => {
    return useQuery({
      queryKey: ["event-revenue", id],
      enabled: !!id,
      queryFn: () => eventService.getEventRevenue(id),
      staleTime: 60 * 1000,
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

  const useUnpublishEvent = () => {
    return useMutation({
      mutationFn: (id: string) => eventService.unpublishEvent(id),
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: ["event", id] });
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

  // Homepage Events
  const useHomepageEvents = () => {
    return useQuery({
      queryKey: ["homepage-events"],
      queryFn: () => eventService.getHomepageEvents(),
      staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection time
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

  const useDeclineTeamInvitation = (eventId: string) => {
    return useMutation({
      mutationFn: (data: AcceptTeamInvitationRequest) =>
        eventService.declineTeamInvitation(eventId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["team-members", eventId] });
      },
    });
  };

  const useResendTeamInvite = (eventId: string) => {
    return useMutation({
      mutationFn: (memberId: string) =>
        eventService.resendTeamInvite(eventId, memberId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["team-members", eventId] });
      },
    });
  };

  const useUpdateTeamMemberRole = (eventId: string) => {
    return useMutation({
      mutationFn: (data: { memberId: string; role: TeamMemberRole }) =>
        eventService.updateTeamMemberRole(eventId, data.memberId, {
          role: data.role,
        }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["team-members", eventId] });
      },
    });
  };

  const useMyInvites = (params?: {
    status?: "PENDING" | "ACCEPTED" | "DECLINED";
  }) => {
    return useQuery({
      queryKey: ["my-invites", params],
      queryFn: () => eventService.listMyInvites(params),
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

  // Categories
  const useCategories = (params?: CategoryQueryParams) => {
    return useQuery({
      queryKey: ["categories", params],
      queryFn: () => eventService.getCategories(params),
      staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
      gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
      retry: 2, // Retry failed requests twice
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    });
  };

  const useCategory = (id: string) => {
    return useQuery({
      queryKey: ["category", id],
      enabled: !!id,
      queryFn: () => eventService.getCategory(id),
      staleTime: 10 * 60 * 1000,
    });
  };

  // Event Types
  const useEventTypes = (params?: EventTypeQueryParams) => {
    return useQuery({
      queryKey: ["event-types", params],
      queryFn: () => eventService.getEventTypes(params),
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
      retry: 2, // Retry failed requests twice
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    });
  };

  // Event Formats
  const useEventFormats = (params?: EventFormatQueryParams) => {
    return useQuery({
      queryKey: ["event-formats", params],
      queryFn: () => eventService.getEventFormats(params),
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
      retry: 2, // Retry failed requests twice
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    });
  };

  // Event Tags
  const useEventTags = (params?: EventTagQueryParams) => {
    return useQuery({
      queryKey: ["event-tags", params],
      queryFn: () => eventService.getEventTags(params),
      staleTime: 5 * 60 * 1000, // 5 minutes - tags might change more frequently
      gcTime: 15 * 60 * 1000, // 15 minutes - keep in cache
      retry: 2, // Retry failed requests twice
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    });
  };

  // Filtered Event Lists
  const useEventsByCategory = (
    params: {
      category_id?: string;
      category_slug?: string;
      include_subcategories?: boolean;
    } & EventQueryParams,
    options?: { enabled?: boolean }
  ) => {
    return useQuery({
      queryKey: ["events-by-category", params],
      queryFn: () => eventService.getEventsByCategory(params),
      staleTime: 5 * 60 * 1000,
      enabled: options?.enabled !== false,
    });
  };

  const useEventsByType = (
    params: { type_id?: string; type_slug?: string } & EventQueryParams
  ) => {
    return useQuery({
      queryKey: ["events-by-type", params],
      queryFn: () => eventService.getEventsByType(params),
      staleTime: 5 * 60 * 1000,
    });
  };

  const useEventsByFormat = (
    params: { format_id?: string; format_slug?: string } & EventQueryParams
  ) => {
    return useQuery({
      queryKey: ["events-by-format", params],
      queryFn: () => eventService.getEventsByFormat(params),
      staleTime: 5 * 60 * 1000,
    });
  };

  const useEventsByTag = (
    params: { tag?: string; tag_id?: string } & EventQueryParams,
    options?: { enabled?: boolean }
  ) => {
    return useQuery({
      queryKey: ["events-by-tag", params],
      queryFn: () => eventService.getEventsByTag(params),
      staleTime: 5 * 60 * 1000,
      enabled: options?.enabled !== false,
    });
  };

  const useAgeRestrictedEvents = (
    params: {
      min_age?: number;
      max_age?: number;
      age_restriction?: string;
    } & EventQueryParams
  ) => {
    return useQuery({
      queryKey: ["age-restricted-events", params],
      queryFn: () => eventService.getAgeRestrictedEvents(params),
      staleTime: 5 * 60 * 1000,
    });
  };

  const useVirtualEvents = (
    params: { format?: "all" | "virtual" | "hybrid" } & EventQueryParams
  ) => {
    return useQuery({
      queryKey: ["virtual-events", params],
      queryFn: () => eventService.getVirtualEvents(params),
      staleTime: 5 * 60 * 1000,
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
    useUnpublishEvent,
    useCancelEvent,
    // Analytics
    useEventAnalytics,
    useExportEventAnalytics,
    // Featured Events
    useFeaturedEvents,
    // Homepage Events
    useHomepageEvents,
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
    useDeclineTeamInvitation,
    useResendTeamInvite,
    useUpdateTeamMemberRole,
    useMyInvites,
    // User's Events
    useMyEvents,
    useEventRevenue,
    // Categories
    useCategories,
    useCategory,
    // Event Types
    useEventTypes,
    // Event Formats
    useEventFormats,
    // Event Tags
    useEventTags,
    // Filtered Event Lists
    useEventsByCategory,
    useEventsByType,
    useEventsByFormat,
    useEventsByTag,
    useAgeRestrictedEvents,
    useVirtualEvents,
  };
};
