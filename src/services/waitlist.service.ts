import { JoinWaitlistRequest, JoinWaitlistResponse, WaitlistListResponse, WaitlistResponse } from "@/types/waitlist";

import { apiClient } from "./api.service";

/**
 * Waitlist service for handling all waitlist-related operations
 */
class WaitlistService {
  private static instance: WaitlistService;
  private readonly baseUrl = "/api/v1";

  private constructor() {}

  public static getInstance(): WaitlistService {
    if (!WaitlistService.instance) {
      WaitlistService.instance = new WaitlistService();
    }
    return WaitlistService.instance;
  }

  /**
   * Waitlist operations
   */
  public async listWaitlist(): Promise<WaitlistListResponse> {
    return apiClient.get<WaitlistListResponse>(`${this.baseUrl}/waitlist`);
  }

  public async getWaitlistEntry(id: string): Promise<WaitlistResponse> {
    return apiClient.get<WaitlistResponse>(`${this.baseUrl}/waitlist/${id}`);
  }

  public async joinWaitlist(data: JoinWaitlistRequest): Promise<JoinWaitlistResponse> {
    return apiClient.post<JoinWaitlistResponse>(`${this.baseUrl}/waitlist`, data);
  }
}

export const waitlistService = WaitlistService.getInstance();
