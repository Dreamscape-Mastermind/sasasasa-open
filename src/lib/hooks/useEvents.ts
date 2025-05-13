import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  type EventUpdateRequest,
  type TeamMemberAcceptRequest,
  type TeamMemberInviteRequest,
  EventFilterParams,
} from "@/types/event";
import { eventApi } from "@/lib/api/eventApiService";
import toast from "react-hot-toast";

/** Fetches paginated list of events */
export function useEvents(page: number, filters: EventFilterParams) {
  return useQuery({
    queryKey: ["events", page, filters],
    queryFn: () => eventApi.getEvents({ ...filters, page }),
  });
}

/** Fetches details of a specific event by ID */
export function useEvent(slug: string) {
  return useQuery({
    queryKey: ["event", slug],
    queryFn: () => eventApi.getEvent(slug),
  });
}

/** Creates a new event */
export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventApi.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create event");
    },
  });
};

/** Updates an existing event by ID */
export const useUpdateEvent = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: EventUpdateRequest) =>
      eventApi.updateEvent(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      toast.success("Event updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update event");
    },
  });
};

/** Deletes an event */
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventApi.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete event");
    },
  });
};

/** Changes event status to published */
export const usePublishEvent = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => eventApi.publishEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      toast.success("Event published successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to publish event");
    },
  });
};

/** Changes event status to cancelled */
export const useCancelEvent = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => eventApi.cancelEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      toast.success("Event cancelled successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to cancel event");
    },
  });
};

/** Invites a new team member to event */
export const useInviteTeamMember = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TeamMemberInviteRequest) =>
      eventApi.inviteTeamMember(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      toast.success("Team member invited successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to invite team member"
      );
    },
  });
};

/** Removes a team member from event */
export const useRemoveTeamMember = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamMemberId: string) =>
      eventApi.removeTeamMember(eventId, teamMemberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      toast.success("Team member removed successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to remove team member"
      );
    },
  });
};

/** Accepts an invitation to join event team */
export const useAcceptTeamInvitation = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TeamMemberAcceptRequest) =>
      eventApi.acceptTeamInvitation(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      toast.success("Team invitation accepted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to accept team invitation"
      );
    },
  });
};

// Fetch list of team members
export function useTeamMembers(eventId: string | null) {
  return useQuery({
      queryKey: ['team', eventId],
      queryFn: () => eventApi.getEventTeamMembers(eventId!),
      enabled: !!eventId, // Only run query if eventId exists
  });
}

/** Fetches list of featured events */
export function useFeaturedEvents() {
  return useQuery({
    queryKey: ["events", "featured"],
    queryFn: () => eventApi.getFeaturedEvents(),
  });
}

/** Fetches paginated list of locations */
export const useLocations = (page = 1) => {
  return useQuery({
    queryKey: ["locations", page],
    queryFn: () => eventApi.getLocations(page),
  });
};

/** Fetches details of a specific location by ID */
export const useLocation = (locationId: string) => {
  return useQuery({
    queryKey: ["location", locationId],
    queryFn: () => eventApi.getLocation(locationId),
    enabled: !!locationId,
  });
};

/** Fetches list of performers for an event */
export const useEventPerformers = (eventId: string) => {
  return useQuery({
    queryKey: ["event", eventId, "performers"],
    queryFn: () => eventApi.getEventPerformers(eventId),
    enabled: !!eventId,
  });
};

/** Fetches details of a specific performer by ID */
export const usePerformer = (eventId: string, performerId: string) => {
  return useQuery({
    queryKey: ["event", eventId, "performer", performerId],
    queryFn: () => eventApi.getPerformer(eventId, performerId),
    enabled: !!eventId && !!performerId,
  });
};

/** Fetches paginated list of user's events */
export const useMyEvents = (page = 1, params?: Record<string, any>) => {
  return useQuery({
    queryKey: ["events", "my", page, params],
    queryFn: () => eventApi.getMyEvents(page, params),
  });
};

export function useUpcomingEvents() {
  return useQuery({
    queryKey: ["events", "upcoming"],
    queryFn: () => eventApi.getUpcomingEvents(),
  });
}

export function usePastEvents() {
  return useQuery({
    queryKey: ["events", "past"],
    queryFn: () => eventApi.getPastEvents(),
  });
}
