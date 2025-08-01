import {
  TimeStamp,
  type Nullable,
  type PaginatedResponse,
  type SuccessResponse,
} from "./common";

export enum CheckInStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  DUPLICATE = "DUPLICATE",
  INVALID_QR = "INVALID_QR",
  EVENT_NOT_STARTED = "EVENT_NOT_STARTED",
  EVENT_ENDED = "EVENT_ENDED",
  WRONG_EVENT = "WRONG_EVENT",
}

export interface BaseCheckInEntity extends TimeStamp {
  id: string;
}

export interface TicketType {
  id: string;
  name: string;
  price: string;
}

export interface TicketOwner {
  id: string;
  name: string;
  email: string;
}

export interface TicketDetails {
  id: string;
  ticket_type: TicketType;
  owner: TicketOwner;
  ticket_number: string;
  status: string;
  checked_in_at: string;
  checked_in_by: string;
  purchase_price: string;
  created_at: string;
}

export interface EventDetails {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  venue: string;
}

export interface CheckInByDetails {
  id: string;
  name: string;
  email: string;
}

export interface CheckIn extends BaseCheckInEntity {
  ticket: string;
  ticket_details: TicketDetails;
  event: string;
  event_details: EventDetails;
  checked_in_by: string;
  checked_in_by_details: CheckInByDetails;
  status: CheckInStatus;
  check_in_time: string;
  device_info: Nullable<{
    device_id: string;
    name: string;
    model: string;
    os: string;
    version: string;
  }>;
  location: Nullable<{
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
  }>;
  notes: string;
}

export interface CheckInDevice extends BaseCheckInEntity {
  name: string;
  device_id: string;
  user: string; // User ID
  is_active: boolean;
  last_used: Nullable<string>;
  device_info: Nullable<{
    model: string;
    os: string;
    version: string;
  }>;
}

export interface CheckInStats {
  total_tickets: number;
  checked_in: number;
  pending: number;
  invalid: number;
}

export interface ScanTicketRequest {
  qr_data: string;
  device_info?: {
    device_id: string;
    name: string;
    model: string;
    os: string;
    version: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp?: string;
  };
}

export interface RegisterDeviceRequest {
  name: string;
  device_id: string;
  device_info?: {
    model: string;
    os: string;
    version: string;
  };
}

export interface CheckInResponse extends SuccessResponse<CheckIn> {}
export interface CheckInsResponse
  extends SuccessResponse<PaginatedResponse<CheckIn>> {}
export interface CheckInDeviceResponse extends SuccessResponse<CheckInDevice> {}
export interface CheckInDevicesResponse
  extends SuccessResponse<PaginatedResponse<CheckInDevice>> {}
export interface CheckInStatsResponse extends SuccessResponse<CheckInStats> {}

export interface CheckInQueryParams {
  event?: string;
  ticket?: string;
  status?: CheckInStatus;
  checked_in_by?: string;
  device?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface CheckInDeviceQueryParams {
  user?: string;
  is_active?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
}
