import { ApiResponse, PaginatedResponse, TimeStamped } from "./common";

export interface WaitlistEntry extends TimeStamped {
  email: string;
}

export interface WaitlistJoinRequest {
  email: string;
}

export interface WaitlistJoinResponse {
  message: string;
  status: number;
}

export type WaitlistResponse = ApiResponse<WaitlistEntry>;
export type WaitlistListResponse = ApiResponse<
  PaginatedResponse<WaitlistEntry>
>;
export type WaitlistJoinResult = ApiResponse<WaitlistJoinResponse>;
