import {
  DeleteResponse,
  EventCreateRequest,
  EventFilterParams,
  EventListResponse,
  EventResponse,
  EventUpdateRequest,
  LocationFilterParams,
  LocationListResponse,
  LocationResponse,
  PerformerListResponse,
  PerformerResponse,
  TeamMemberAcceptRequest,
  TeamMemberFilterParams,
  TeamMemberInviteRequest,
  TeamMemberListResponse,
  TeamMemberResponse,
  TeamMemberUpdateRequest,
} from "@/types";

import axios from "./axios";

export const eventApi = {
  // Fetches a paginated list of events
  getEvents: async (page = 1, params?: EventFilterParams) => {
    const searchParams = new URLSearchParams({ page: page.toString() });
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    const response = await axios.get<EventListResponse>(
      `/api/v1/events${queryString ? `?${queryString}` : ""}`
    );
    return response.data.result;
  },

  // Fetches details of a specific event
  getEvent: async (eventId: string) => {
    const response = await axios.get<EventResponse>(
      `/api/v1/events/${eventId}`
    );
    return response.data.result;
  },

  // Creates a new event
  createEvent: async (data: EventCreateRequest) => {
    const formData = new FormData();

    // Add basic fields
    Object.entries(data).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        key !== "location" &&
        key !== "performers" &&
        key !== "cover_image"
      ) {
        formData.append(key, value.toString());
      }
    });

    // Add location if provided
    if (data.location) {
      Object.entries(data.location).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(`location.${key}`, value.toString());
        }
      });
    }

    // Add performers if provided
    if (data.performers && data.performers.length > 0) {
      formData.append("performers", JSON.stringify(data.performers));
    }

    // Add cover image if provided
    if (data.cover_image) {
      formData.append("cover_image", data.cover_image);
    }

    const response = await axios.post<EventResponse>(
      "/api/v1/events",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.result;
  },

  // Updates an existing event
  updateEvent: async (eventId: string, data: EventUpdateRequest) => {
    const formData = new FormData();

    // Add basic fields
    Object.entries(data).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        key !== "location" &&
        key !== "performers" &&
        key !== "cover_image"
      ) {
        formData.append(key, value.toString());
      }
    });

    // Add location if provided
    if (data.location) {
      Object.entries(data.location).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(`location.${key}`, value.toString());
        }
      });
    }

    // Add performers if provided
    if (data.performers && data.performers.length > 0) {
      formData.append("performers", JSON.stringify(data.performers));
    }

    // Add cover image if provided
    if (data.cover_image) {
      formData.append("cover_image", data.cover_image);
    }

    const response = await axios.patch<EventResponse>(
      `/api/v1/events/${eventId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.result;
  },

  // Deletes an event
  deleteEvent: async (eventId: string) => {
    const response = await axios.delete<DeleteResponse>(
      `/api/v1/events/${eventId}`
    );
    return response.data;
  },

  // Publishes an event
  publishEvent: async (eventId: string) => {
    const response = await axios.post<EventResponse>(
      `/api/v1/events/${eventId}/publish`
    );
    return response.data.result;
  },

  // Cancels an event
  cancelEvent: async (eventId: string) => {
    const response = await axios.post<EventResponse>(
      `/api/v1/events/${eventId}/cancel`
    );
    return response.data.result;
  },

  // Invites a team member to an event
  inviteTeamMember: async (eventId: string, data: TeamMemberInviteRequest) => {
    const response = await axios.post<TeamMemberResponse>(
      `/api/v1/events/${eventId}/invite`,
      data
    );
    return response.data.result;
  },

  // Removes a team member from an event
  removeTeamMember: async (eventId: string, teamMemberId: string) => {
    const response = await axios.post<DeleteResponse>(
      `/api/v1/events/${eventId}/remove`,
      null,
      {
        params: { id: teamMemberId },
      }
    );
    return response.data;
  },

  // Accepts a team invitation
  acceptTeamInvitation: async (
    eventId: string,
    data: TeamMemberAcceptRequest
  ) => {
    const response = await axios.post<TeamMemberResponse>(
      `/api/v1/events/${eventId}/accept`,
      data
    );
    return response.data.result;
  },

  // Fetches featured events
  getFeaturedEvents: async () => {
    const response = await axios.get<EventListResponse>(
      "/api/v1/events/featured"
    );
    return response.data.result;
  },

  // Fetches a paginated list of locations
  getLocations: async (page = 1, params?: LocationFilterParams) => {
    const searchParams = new URLSearchParams({ page: page.toString() });
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    const response = await axios.get<LocationListResponse>(
      `/api/v1/events/locations${queryString ? `?${queryString}` : ""}`
    );
    return response.data.result;
  },

  // Fetches details of a specific location
  getLocation: async (locationId: string) => {
    const response = await axios.get<LocationResponse>(
      `/api/v1/events/locations/${locationId}`
    );
    return response.data.result;
  },

  // Fetches a list of performers for an event
  getEventPerformers: async (eventId: string) => {
    const response = await axios.get<PerformerListResponse>(
      `/api/v1/events/${eventId}/performers`
    );
    return response.data.result.results;
  },

  // Fetches details of a specific performer for an event
  getPerformer: async (eventId: string, performerId: string) => {
    const response = await axios.get<PerformerResponse>(
      `/api/v1/events/${eventId}/performers/${performerId}`
    );
    return response.data.result;
  },

  // Fetches a paginated list of team members for an event
  getEventTeamMembers: async (
    eventId: string,
    page = 1,
    params?: TeamMemberFilterParams
  ) => {
    const searchParams = new URLSearchParams({ page: page.toString() });
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    const response = await axios.get<TeamMemberListResponse>(
      `/api/v1/events/${eventId}/teams${queryString ? `?${queryString}` : ""}`
    );
    return response.data.result;
  },

  // Fetches details of a specific team member
  getTeamMember: async (eventId: string, teamMemberId: string) => {
    const response = await axios.get<TeamMemberResponse>(
      `/api/v1/events/${eventId}/teams/${teamMemberId}`
    );
    return response.data.result;
  },

  // Updates a team member
  updateTeamMember: async (
    eventId: string,
    teamMemberId: string,
    data: TeamMemberUpdateRequest
  ) => {
    const response = await axios.patch<TeamMemberResponse>(
      `/api/v1/events/${eventId}/teams/${teamMemberId}`,
      data
    );
    return response.data.result;
  },

  // Fetches a paginated list of user's events
  getMyEvents: async (page = 1, params?: EventFilterParams) => {
    const searchParams = new URLSearchParams({ page: page.toString() });
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    const response = await axios.get<EventListResponse>(
      `/api/v1/events/my_events${queryString ? `?${queryString}` : ""}`
    );
    return response.data.result;
  },
};
