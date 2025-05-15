import {
  ApiResponse,
  PaginatedResponse,
  WaitlistEntry,
  WaitlistJoinRequest,
  WaitlistJoinResponse,
} from "@/types";

import axios from "./axios";

export const waitlistApi = {
  // Join waitlist
  joinWaitlist: async (data: WaitlistJoinRequest) => {
    const response = await axios.post<WaitlistJoinResponse>(
      "/api/v1/waitlist",
      data
    );
    return response.data;
  },

  // List waitlist entries
  listWaitlistEntries: async () => {
    const response = await axios.get<
      ApiResponse<PaginatedResponse<WaitlistEntry>>
    >("/api/v1/waitlist");
    return response.data;
  },

  // Get waitlist entry details
  getWaitlistEntry: async (entryId: string) => {
    const response = await axios.get<ApiResponse<WaitlistEntry>>(
      `/api/v1/waitlist/${entryId}`
    );
    return response.data;
  },

  // Join the waitlist with an email
  joinWaitlistEmail: async (email: string) => {
    const response = await axios.post<WaitlistJoinResponse>(
      "/api/v1/waitlist/join",
      {
        email,
      }
    );
    return response.data;
  },

  // Check if an email is on the waitlist
  checkWaitlist: async (email: string) => {
    const response = await axios.get<
      ApiResponse<{ is_on_waitlist: boolean; position?: number }>
    >(`/api/v1/waitlist/check?email=${encodeURIComponent(email)}`);
    return response.data;
  },

  // Get waitlist position for an email
  getPosition: async (email: string) => {
    const response = await axios.get<
      ApiResponse<{ position: number; total: number }>
    >(`/api/v1/waitlist/position?email=${encodeURIComponent(email)}`);
    return response.data;
  },
};
