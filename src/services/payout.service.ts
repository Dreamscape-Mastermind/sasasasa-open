import { PayoutProfile, WithdrawalRequest, WithdrawalResponse } from '@/types/payouts';
import { apiClient, ApiResponse } from './api.service';
import { PaginatedResponse, SuccessResponse } from '@/types/common';

interface AgreementsResponse {
  text: string;
}

interface ReviewWithdrawalRequest {
  withdrawalId: string;
  status: 'Approved' | 'Rejected';
  reason?: string;
}

class PayoutService {
  private static instance: PayoutService;
  private readonly baseUrl = '/api/v1/payout';
  private readonly adminBaseUrl = '/api/v1/admin/payout';

  private constructor() {}

  public static getInstance(): PayoutService {
    if (!PayoutService.instance) {
      PayoutService.instance = new PayoutService();
    }
    return PayoutService.instance;
  }

  // Profile
  public async getPayoutProfile(): Promise<SuccessResponse<PayoutProfile>> {
    return apiClient.get<SuccessResponse<PayoutProfile>>(`${this.baseUrl}/profile/me`);
  }

  public async createPayoutProfile(profileData: Partial<PayoutProfile> | FormData): Promise<ApiResponse<PayoutProfile>> {
    const url = `${this.baseUrl}/profile`;
    if (typeof FormData !== 'undefined' && profileData instanceof FormData) {
      return apiClient.postFormData<ApiResponse<PayoutProfile>>(url, profileData);
    }
    return apiClient.post<ApiResponse<PayoutProfile>>(url, profileData);
  }

  public async updatePayoutProfile(profileId: string, profileData: Partial<PayoutProfile> | FormData): Promise<ApiResponse<PayoutProfile>> {
    const url = `${this.baseUrl}/profile/${profileId}`;
    if (typeof FormData !== 'undefined' && profileData instanceof FormData) {
      return apiClient.patchFormData<ApiResponse<PayoutProfile>>(url, profileData);
    }
    return apiClient.patch<ApiResponse<PayoutProfile>>(url, profileData);
  }

  public async getAgreements(): Promise<ApiResponse<AgreementsResponse>> {
    return apiClient.get<ApiResponse<AgreementsResponse>>(`${this.baseUrl}/profile/agreements`);
  }

  // Withdrawals
  public async requestWithdrawal(data: Partial<WithdrawalRequest>): Promise<ApiResponse<WithdrawalRequest>> {
    return apiClient.post<ApiResponse<WithdrawalRequest>>(`${this.baseUrl}/withdrawals`, data);
  }

  public async getWithdrawals(): Promise<PaginatedResponse<WithdrawalRequest>> {
    return apiClient.get<PaginatedResponse<WithdrawalRequest>>(`${this.baseUrl}/withdrawals`);
  }

  public async downloadWithdrawals(): Promise<any> { // The response might be a blob or file
    return apiClient.get(`${this.baseUrl}/withdrawals/download`, {
      responseType: 'blob',
    });
  }

  // Admin
  public async getKycSubmissions(): Promise<PaginatedResponse<PayoutProfile>> {
    return apiClient.get<PaginatedResponse<PayoutProfile>>(`${this.baseUrl}/profile`);
  }

  public async reviewKycSubmission(submissionId: string, data: { status: 'Verified' | 'Rejected'; reason?: string }): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`${this.baseUrl}/profile/${submissionId}/review`, data);
  }

  public async reviewWithdrawal(withdrawalId: string, data: { status: 'Approved' | 'Rejected'; failure_reason?: string }): Promise<ApiResponse<WithdrawalRequest>> {
    return apiClient.post<ApiResponse<WithdrawalRequest>>(`${this.baseUrl}/withdrawals/${withdrawalId}/review`, data);
  }
}

export const payoutService = PayoutService.getInstance();