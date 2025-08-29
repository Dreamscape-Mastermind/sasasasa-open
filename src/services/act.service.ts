import { PayoutProfile, WithdrawalRequest, KycStatus, KycIdType, WithdrawalMethod, WithdrawalStatus } from '@/types/payouts';
import { ApiResponse } from './api.service';

// Mock Data
const mockPayoutProfile: PayoutProfile = {
  user_id: '12345',
  wallet_address: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
  mobile_money_number: '254712345678',
  bank_account_details: {
    bank_name: 'Equity Bank',
    account_number: '1234567890',
    account_holder_name: 'John Doe',
  },
  kyc_status: 'Verified',
  kyc_id_type: 'ID',
  kyc_id_number: '12345678',
  kyc_id_front_image: 'https://example.com/id_front.jpg',
  kyc_selfie_with_id_image: 'https://example.com/selfie.jpg',
  accepted_terms: true,
  createdAt: new Date('2023-01-15T10:00:00Z'),
  updatedAt: new Date('2023-01-15T10:00:00Z'),
};

const mockWithdrawals: WithdrawalRequest[] = [
  {
    user_id: '12345',
    payout_profile_id: 'pp_1',
    amount: 500,
    method: 'Crypto',
    destination: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
    status: 'Completed',
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T11:15:00Z'),
  },
  {
    user_id: '12345',
    payout_profile_id: 'pp_2',
    amount: 1000,
    method: 'BankAccount',
    destination: '****1234',
    status: 'Pending',
    createdAt: new Date('2024-01-14T14:20:00Z'),
    updatedAt: new Date('2024-01-14T14:20:00Z'),
  },
];

interface AgreementsResponse {
  text: string;
}

interface KycSubmission {
  id: string;
  userId: string;
  status: string;
}

interface ReviewWithdrawalRequest {
  withdrawalId: string;
  status: 'Approved' | 'Rejected';
  reason?: string;
}

class PayoutService {
  private static instance: PayoutService;

  private constructor() {}

  public static getInstance(): PayoutService {
    if (!PayoutService.instance) {
      PayoutService.instance = new PayoutService();
    }
    return PayoutService.instance;
  }

  private simulateRequest<T>(data: T): Promise<ApiResponse<T>> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ result: data, message: 'Success' });
      }, 1000);
    });
  }

  // Profile
  public async getPayoutProfile(): Promise<ApiResponse<PayoutProfile>> {
    return this.simulateRequest(mockPayoutProfile);
  }

  public async updatePayoutProfile(profileData: Partial<PayoutProfile>): Promise<ApiResponse<PayoutProfile>> {
    const updatedProfile = { ...mockPayoutProfile, ...profileData };
    return this.simulateRequest(updatedProfile);
  }

  public async getAgreements(): Promise<ApiResponse<AgreementsResponse>> {
    return this.simulateRequest({ text: 'These are the terms and conditions...' });
  }

  // Withdrawals
  public async requestWithdrawal(data: Partial<WithdrawalRequest>): Promise<ApiResponse<WithdrawalRequest>> {
    const newWithdrawal: WithdrawalRequest = {
      user_id: '12345',
      payout_profile_id: `pp_${Date.now()}`,
      amount: data.amount || 0,
      method: data.method || 'Crypto',
      destination: data.destination || '',
      status: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockWithdrawals.push(newWithdrawal);
    return this.simulateRequest(newWithdrawal);
  }

  public async getWithdrawals(): Promise<ApiResponse<WithdrawalRequest[]>> {
    return this.simulateRequest(mockWithdrawals);
  }

  public async downloadWithdrawals(): Promise<any> {
    return new Promise(resolve => {
      setTimeout(() => {
        const csv = 'col1,col2\nval1,val2';
        const blob = new Blob([csv], { type: 'text/csv' });
        resolve(blob);
      }, 1000);
    });
  }

  // Admin
  public async getKycSubmissions(): Promise<ApiResponse<KycSubmission[]>> {
    const kycSubmissions: KycSubmission[] = [
      { id: 'kyc_1', userId: 'user_1', status: 'Pending' },
      { id: 'kyc_2', userId: 'user_2', status: 'Needs Update' },
    ];
    return this.simulateRequest(kycSubmissions);
  }

  public async reviewWithdrawal(data: ReviewWithdrawalRequest): Promise<ApiResponse<WithdrawalRequest>> {
    const withdrawal = mockWithdrawals.find(w => w.payout_profile_id === data.withdrawalId);
    if (withdrawal) {
      withdrawal.status = data.status;
      return this.simulateRequest(withdrawal);
    }
    return Promise.reject({ message: 'Withdrawal not found' });
  }
}

export const payoutService = PayoutService.getInstance();