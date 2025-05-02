import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Event } from "@/types";
import { eventApi } from "../api/eventApiService";
import toast from "react-hot-toast";

/** Fetches paginated list of events */
export const useEvents = (page = 1, params?: Record<string, any>) => {
  return useQuery({
    queryKey: ["events", page, params],
    queryFn: () => eventApi.getEvents(page, params),
  });
};

/** Fetches details of a specific event by ID */
export const useEvent = (eventId: string, params?: Record<string, any>) => {
  return useQuery({
    queryKey: ["event", eventId, params],
    queryFn: () => eventApi.getEvent(eventId, params),
    enabled: !!eventId,
  });
};

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
    mutationFn: (data: Partial<Event>) => eventApi.updateEvent(eventId, data),
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
    mutationFn: (data: { user_email: string; role: string }) =>
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
    mutationFn: (token: string) =>
      eventApi.acceptTeamInvitation(eventId, token),
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

/** Fetches list of featured events */
export const useFeaturedEvents = () => {
  return useQuery({
    queryKey: ["events", "featured"],
    queryFn: eventApi.getFeaturedEvents,
  });
};

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
