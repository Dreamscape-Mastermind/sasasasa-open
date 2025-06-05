import {
  AcceptTeamInvitationRequest,
  CreateEventRequest,
  EventQueryParams,
  EventResponse,
  EventsResponse,
  InviteTeamMemberRequest,
  LocationQueryParams,
  LocationResponse,
  LocationsResponse,
  PerformerQueryParams,
  PerformerResponse,
  PerformersResponse,
  TeamMemberQueryParams,
  TeamMemberResponse,
  TeamMembersResponse,
  UpdateEventRequest,
} from "@/types/event";

import { apiClient } from "./api.service";

/**
 * Event service for handling all event-related operations
 */
class EventService {
  private static instance: EventService;
  private readonly baseUrl = "/api/v1/events";

  private constructor() {}

  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  /**
   * Event CRUD operations
   */
  public async listEvents(params?: EventQueryParams): Promise<EventsResponse> {
    return apiClient.get<EventsResponse>(this.baseUrl, { params });
  }

  public async getEvent(id: string): Promise<EventResponse> {
    return apiClient.get<EventResponse>(`${this.baseUrl}/${id}`);
  }

  public async createEvent(data: CreateEventRequest): Promise<EventResponse> {
    return apiClient.post<EventResponse>(this.baseUrl, data);
  }

  public async updateEvent(
    id: string,
    data: UpdateEventRequest
  ): Promise<EventResponse> {
    return apiClient.patch<EventResponse>(`${this.baseUrl}/${id}`, data);
  }

  public async deleteEvent(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Event status operations
   */
  public async publishEvent(id: string): Promise<EventResponse> {
    return apiClient.post<EventResponse>(`${this.baseUrl}/${id}/publish`);
  }

  public async cancelEvent(id: string): Promise<EventResponse> {
    return apiClient.post<EventResponse>(`${this.baseUrl}/${id}/cancel`);
  }

  /**
   * Featured events
   */
  public async getFeaturedEvents(): Promise<EventsResponse> {
    return apiClient.get<EventsResponse>(`${this.baseUrl}/featured`);
  }

  /**
   * Location operations
   */
  public async listLocations(
    params?: LocationQueryParams
  ): Promise<LocationsResponse> {
    return apiClient.get<LocationsResponse>(`${this.baseUrl}/locations`, {
      params,
    });
  }

  public async getLocation(id: string): Promise<LocationResponse> {
    return apiClient.get<LocationResponse>(`${this.baseUrl}/locations/${id}`);
  }

  /**
   * Performer operations
   */
  public async listPerformers(
    eventId: string,
    params?: PerformerQueryParams
  ): Promise<PerformersResponse> {
    return apiClient.get<PerformersResponse>(
      `${this.baseUrl}/${eventId}/performers`,
      { params }
    );
  }

  public async getPerformer(
    eventId: string,
    performerId: string
  ): Promise<PerformerResponse> {
    return apiClient.get<PerformerResponse>(
      `${this.baseUrl}/${eventId}/performers/${performerId}`
    );
  }

  /**
   * Team member operations
   */
  public async listTeamMembers(
    eventId: string,
    params?: TeamMemberQueryParams
  ): Promise<TeamMembersResponse> {
    return apiClient.get<TeamMembersResponse>(
      `${this.baseUrl}/${eventId}/team`,
      { params }
    );
  }

  public async getTeamMember(
    eventId: string,
    memberId: string
  ): Promise<TeamMemberResponse> {
    return apiClient.get<TeamMemberResponse>(
      `${this.baseUrl}/${eventId}/team/${memberId}`
    );
  }

  public async inviteTeamMember(
    eventId: string,
    data: InviteTeamMemberRequest
  ): Promise<TeamMemberResponse> {
    return apiClient.post<TeamMemberResponse>(
      `${this.baseUrl}/${eventId}/invite`,
      data
    );
  }

  public async removeTeamMember(
    eventId: string,
    memberId: string
  ): Promise<void> {
    return apiClient.post(`${this.baseUrl}/${eventId}/remove`, {
      member_id: memberId,
    });
  }

  public async acceptTeamInvitation(
    eventId: string,
    data: AcceptTeamInvitationRequest
  ): Promise<TeamMemberResponse> {
    return apiClient.post<TeamMemberResponse>(
      `${this.baseUrl}/${eventId}/accept`,
      data
    );
  }

  /**
   * User's events
   */
  public async getMyEvents(params?: EventQueryParams): Promise<EventsResponse> {
    return apiClient.get<EventsResponse>(`${this.baseUrl}/my_events`, {
      params,
    });
  }
}

export const eventService = EventService.getInstance();
