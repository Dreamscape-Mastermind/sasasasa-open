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

import {
  type EventUpdateRequest,
  type TeamMemberAcceptRequest,
  type TeamMemberInviteRequest,
  EventFilterParams,
  TeamMemberRole,
} from "@/types/event";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { eventService } from "@/services/event.service";

export const useEvent = () => {
  const queryClient = useQueryClient();

  // Events
  const useEvents = (params?: EventQueryParams) => {
    return useQuery({
      queryKey: ["events", params],
      queryFn: () => eventService.listEvents(params),
    });
  };

  const useEvent = (id: string) => {
    return useQuery({
      queryKey: ["event", id],
      queryFn: () => eventService.getEvent(id),
      enabled: !!id,
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

  const useUpdateEvent = (id: string) => {
    return useMutation({
      mutationFn: (data: UpdateEventRequest) =>
        eventService.updateEvent(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["events"] });
        queryClient.invalidateQueries({ queryKey: ["event", id] });
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
  const useMyEvents = (params?: EventQueryParams) => {
    return useQuery({
      queryKey: ["my-events", params],
      queryFn: () => eventService.getMyEvents(params),
    });
  };


/** Fetches list of performers for an event */
const useEventPerformers = (eventId: string) => {
  return useQuery({
    queryKey: ["event", eventId, "performers"],
    queryFn: () => eventService.listPerformers(eventId),
    enabled: !!eventId,
  });
};


const useUpcomingEvents = () => {
  return useQuery({
    queryKey: ["events", "upcoming"],
    queryFn: () => eventService.listEvents({ is_active: true }),
  });
}

const usePastEvents = () => {
  return useQuery({
    queryKey: ["events", "past"],
    queryFn: () => eventService.listEvents({ is_active: false }),
  });
}

  return {
    // Events
    useEventPerformers,
    useUpcomingEvents,
    usePastEvents,
    useEvents,
    useEvent,
    useCreateEvent,
    useUpdateEvent,
    useDeleteEvent,
    usePublishEvent,
    useCancelEvent,
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


import toast from "react-hot-toast";

/** Fetches paginated list of events */
export function useEvents(page: number, filters: EventFilterParams) {
  return useQuery({
    queryKey: ["events", page, filters],
    queryFn: () => eventService.listEvents({ ...filters, page }),
  });
}


/** Creates a new event */
export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
        mutationFn: (data: CreateEventRequest) => eventService.createEvent(data),
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
    mutationFn: (data: UpdateEventRequest) =>
      eventService.updateEvent(eventId, data),
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
    mutationFn: eventService.deleteEvent,
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
    mutationFn: () => eventService.publishEvent(eventId),
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
    mutationFn: () => eventService.cancelEvent(eventId),
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
    mutationFn: (data: InviteTeamMemberRequest) =>
      eventService.inviteTeamMember(eventId, data),
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
      eventService.removeTeamMember(eventId, teamMemberId),
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
      eventService.acceptTeamInvitation(eventId, data),
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
export function useTeamMembers(eventId: string | null, params?: TeamMemberQueryParams) {
  return useQuery({
      queryKey: ['team', eventId],
      queryFn: () => eventService.listTeamMembers(eventId!),
      enabled: !!eventId, // Only run query if eventId exists
  });
}

/** Fetches list of featured events */
export function useFeaturedEvents() {
  return useQuery({
    queryKey: ["events", "featured"],
    queryFn: () => eventService.getFeaturedEvents(),
  });
}

/** Fetches paginated list of locations */
export const useLocations = (page = 1) => {
  return useQuery({
    queryKey: ["locations", page],
    queryFn: () => eventService.listLocations({ page }),
  });
};


