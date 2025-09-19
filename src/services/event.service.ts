import {
  AcceptTeamInvitationRequest,
  CategoriesResponse,
  CategoryQueryParams,
  CategoryResponse,
  CreateEventRequest,
  EventFormatQueryParams,
  EventFormatsResponse,
  EventQueryParams,
  EventResponse,
  EventTagQueryParams,
  EventTagsResponse,
  EventTypeQueryParams,
  EventTypesResponse,
  EventsResponse,
  HomepageResponse,
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
import type {
  EventAnalyticsExportRequest,
  EventAnalyticsExportResponse,
  EventAnalyticsQuery,
  EventAnalyticsResponse,
} from "@/types/analytics";

import type { EventRevenueResponse } from "@/types/event";
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

  /**
   * Event analytics (single endpoint)
   */
  public async getEventAnalytics(
    id: string,
    params?: EventAnalyticsQuery
  ): Promise<EventAnalyticsResponse> {
    return apiClient.get<EventAnalyticsResponse>(
      `${this.baseUrl}/${id}/analytics`,
      { params }
    );
  }

  public async exportEventAnalytics(
    id: string,
    data: EventAnalyticsExportRequest
  ): Promise<EventAnalyticsExportResponse> {
    return apiClient.post<EventAnalyticsExportResponse>(
      `${this.baseUrl}/${id}/analytics/export`,
      data
    );
  }

  /**
   * Helper function to create FormData for event creation/update
   */
  private createEventFormData(
    data: CreateEventRequest | UpdateEventRequest,
    originalImageUrl?: string
  ): FormData | any {
    const hasNewFile = data.cover_image && data.cover_image instanceof File;
    const hasExistingImage =
      typeof data.cover_image === "string" && data.cover_image.length > 0;
    const shouldRemoveImage =
      data.cover_image === null || data.cover_image === "";

    // If we have a new file to upload, use FormData
    if (hasNewFile) {
      const formData = new FormData();

      // Add all non-file fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === "cover_image") {
          if (value instanceof File) {
            formData.append("cover_image", value);
          }
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });

      return formData;
    }

    // For non-file updates, create regular object
    const processedData = { ...data };

    // Handle image field based on state
    if (shouldRemoveImage) {
      // Explicitly set to null to remove existing image
      processedData.cover_image = null;
    } else if (hasExistingImage) {
      // Keep existing image URL (don't send cover_image field to avoid overwriting)
      delete processedData.cover_image;
    } else {
      // No image specified, don't include the field
      delete processedData.cover_image;
    }

    return processedData;
  }

  public async createEvent(data: CreateEventRequest): Promise<EventResponse> {
    const processedData = this.createEventFormData(data);

    if (processedData instanceof FormData) {
      return apiClient.postFormData<EventResponse>(this.baseUrl, processedData);
    } else {
      return apiClient.post<EventResponse>(this.baseUrl, processedData);
    }
  }

  public async updateEvent(
    id: string,
    data: UpdateEventRequest,
    originalImageUrl?: string
  ): Promise<EventResponse> {
    const processedData = this.createEventFormData(data, originalImageUrl);

    if (processedData instanceof FormData) {
      return apiClient.patchFormData<EventResponse>(
        `${this.baseUrl}/${id}`,
        processedData
      );
    } else {
      return apiClient.patch<EventResponse>(
        `${this.baseUrl}/${id}`,
        processedData
      );
    }
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

  public async unpublishEvent(id: string): Promise<EventResponse> {
    return apiClient.post<EventResponse>(`${this.baseUrl}/${id}/unpublish`);
  }

  public async cancelEvent(id: string): Promise<EventResponse> {
    return apiClient.post<EventResponse>(`${this.baseUrl}/${id}/cancel`);
  }

  /**
   * Event revenue
   */
  public async getEventRevenue(id: string): Promise<EventRevenueResponse> {
    return apiClient.get<EventRevenueResponse>(`${this.baseUrl}/${id}/revenue`);
  }

  /**
   * Featured events
   */
  public async getFeaturedEvents(): Promise<EventsResponse> {
    return apiClient.get<EventsResponse>(`${this.baseUrl}/featured`);
  }

  /**
   * Homepage events - optimized endpoint for homepage display
   */
  public async getHomepageEvents(): Promise<HomepageResponse> {
    return apiClient.get<HomepageResponse>("/api/v1/homepage");
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
      `${this.baseUrl}/${eventId}/teams`,
      { params }
    );
  }

  public async getTeamMember(
    eventId: string,
    memberId: string
  ): Promise<TeamMemberResponse> {
    return apiClient.get<TeamMemberResponse>(
      `${this.baseUrl}/${eventId}/teams/${memberId}`
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
    return apiClient.post(`${this.baseUrl}/${eventId}/remove?id=${memberId}`);
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

  public async declineTeamInvitation(
    eventId: string,
    data: AcceptTeamInvitationRequest
  ): Promise<TeamMemberResponse> {
    return apiClient.post<TeamMemberResponse>(
      `${this.baseUrl}/${eventId}/decline`,
      data
    );
  }

  public async resendTeamInvite(
    eventId: string,
    memberId: string
  ): Promise<TeamMemberResponse> {
    return apiClient.post<TeamMemberResponse>(
      `${this.baseUrl}/${eventId}/resend?id=${memberId}`
    );
  }

  public async updateTeamMemberRole(
    eventId: string,
    memberId: string,
    data: { role: string }
  ): Promise<TeamMemberResponse> {
    return apiClient.patch<TeamMemberResponse>(
      `${this.baseUrl}/${eventId}/teams/${memberId}`,
      data
    );
  }

  public async listMyInvites(params?: { status?: string }): Promise<{
    status: string;
    result: { results: Array<any> };
    message: string;
  }> {
    return apiClient.get(`${this.baseUrl}/my_invites`, { params });
  }

  /**
   * User's events
   */
  public async getMyEvents(params?: EventQueryParams): Promise<EventsResponse> {
    return apiClient.get<EventsResponse>(`${this.baseUrl}/my_events`, {
      params,
    });
  }

  /**
   * Categorization endpoints
   */
  public async getCategories(
    params?: CategoryQueryParams
  ): Promise<CategoriesResponse> {
    return apiClient.get<CategoriesResponse>(`${this.baseUrl}/categories`, {
      params,
    });
  }

  public async getCategory(id: string): Promise<CategoryResponse> {
    return apiClient.get<CategoryResponse>(`${this.baseUrl}/categories/${id}`);
  }

  public async getEventTypes(
    params?: EventTypeQueryParams
  ): Promise<EventTypesResponse> {
    return apiClient.get<EventTypesResponse>(`${this.baseUrl}/types`, {
      params,
    });
  }

  public async getEventFormats(
    params?: EventFormatQueryParams
  ): Promise<EventFormatsResponse> {
    return apiClient.get<EventFormatsResponse>(`${this.baseUrl}/formats`, {
      params,
    });
  }

  public async getEventTags(
    params?: EventTagQueryParams
  ): Promise<EventTagsResponse> {
    return apiClient.get<EventTagsResponse>(`${this.baseUrl}/tags`, {
      params,
    });
  }

  /**
   * Filtered event lists
   */
  public async getEventsByCategory(
    params: {
      category_id?: string;
      category_slug?: string;
      include_subcategories?: boolean;
    } & EventQueryParams
  ): Promise<EventsResponse> {
    return apiClient.get<EventsResponse>(`${this.baseUrl}/by_category`, {
      params,
    });
  }

  public async getEventsByType(
    params: { type_id?: string; type_slug?: string } & EventQueryParams
  ): Promise<EventsResponse> {
    return apiClient.get<EventsResponse>(`${this.baseUrl}/by_type`, {
      params,
    });
  }

  public async getEventsByFormat(
    params: { format_id?: string; format_slug?: string } & EventQueryParams
  ): Promise<EventsResponse> {
    return apiClient.get<EventsResponse>(`${this.baseUrl}/by_format`, {
      params,
    });
  }

  public async getEventsByTag(
    params: { tag?: string; tag_id?: string } & EventQueryParams
  ): Promise<EventsResponse> {
    return apiClient.get<EventsResponse>(`${this.baseUrl}/by_tag`, {
      params,
    });
  }

  public async getAgeRestrictedEvents(
    params: {
      min_age?: number;
      max_age?: number;
      age_restriction?: string;
    } & EventQueryParams
  ): Promise<EventsResponse> {
    return apiClient.get<EventsResponse>(`${this.baseUrl}/age_restricted`, {
      params,
    });
  }

  public async getVirtualEvents(
    params: { format?: "all" | "virtual" | "hybrid" } & EventQueryParams
  ): Promise<EventsResponse> {
    return apiClient.get<EventsResponse>(`${this.baseUrl}/virtual_events`, {
      params,
    });
  }
}

export const eventService = EventService.getInstance();
