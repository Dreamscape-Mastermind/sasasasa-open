import {
  CheckInQueryParams,
  CheckInResponse,
  CheckInStatsResponse,
  CheckInsResponse,
  ScanTicketRequest,
} from "@/types/checkin";

import { apiClient } from "./api.service";

class CheckinService {
  private static instance: CheckinService;
  private readonly baseUrl = "/api/v1";

  private constructor() {}

  public static getInstance(): CheckinService {
    if (!CheckinService.instance) {
      CheckinService.instance = new CheckinService();
    }
    return CheckinService.instance;
  }

  public async listCheckIns(
    eventId: string,
    params?: CheckInQueryParams
  ): Promise<CheckInsResponse> {
    return apiClient.get<CheckInsResponse>(
      `${this.baseUrl}/events/${eventId}/checkin`,
      params
    );
  }

  public async getCheckIn(
    eventId: string,
    checkInId: string
  ): Promise<CheckInResponse> {
    return apiClient.get<CheckInResponse>(
      `${this.baseUrl}/events/${eventId}/checkin/${checkInId}`
    );
  }

  public async scanTicket(
    eventId: string,
    data: ScanTicketRequest
  ): Promise<CheckInResponse> {
    return apiClient.post<CheckInResponse>(
      `${this.baseUrl}/events/${eventId}/checkin/scan_ticket`,
      data
    );
  }

  public async getCheckInStats(eventId: string): Promise<CheckInStatsResponse> {
    return apiClient.get<CheckInStatsResponse>(
      `${this.baseUrl}/events/${eventId}/checkin/stats`
    );
  }

  public async getDeviceCheckIns(
    eventId: string,
    deviceId: string
  ): Promise<CheckInsResponse> {
    return apiClient.get<CheckInsResponse>(
      `${this.baseUrl}/events/${eventId}/checkin/device_checkins`,
      {
        device: deviceId,
      }
    );
  }

  public async getUserCheckIns(eventId: string): Promise<CheckInsResponse> {
    return apiClient.get<CheckInsResponse>(
      `${this.baseUrl}/events/${eventId}/checkin/user_checkins`
    );
  }
}

export const checkinService = CheckinService.getInstance();
