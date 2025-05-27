// Base response types
export interface BaseResponse {
  status: "success" | "error";
  message: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface SuccessResponse<T = any> extends BaseResponse {
  status: "success";
  result?: T;
}

export interface ErrorResponse extends BaseResponse {
  status: "error";
  result?: {
    errors?: Record<string, string[]>;
    error_type?: string;
    error_details?: any;
    traceback?: string;
  };
}

// Exception types
export interface APIException {
  error_message: string;
  error_data?: any;
  status_code: number;
  error_code?: string;
}

// Common enums
export enum WalletAuthStatus {
  AUTHENTICATED = "authenticated",
  NEEDS_EMAIL_VERIFICATION = "needs_email_verification",
  ERROR = "error",
}

// Common interfaces
export interface TimeStamp {
  created_at: string;
  updated_at: string;
}

// Common utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
