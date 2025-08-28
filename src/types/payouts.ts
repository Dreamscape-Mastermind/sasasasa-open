export type KycStatus = "Pending" | "Needs Update" | "Verified" | "Rejected";
export type KycIdType = "ID" | "Passport";

export interface PayoutProfile {
  user_id: string;
  wallet_address: string;
  mobile_money_number?: string;
  bank_account_details?: any; // Replace with a proper type for Paystack bank info
  kyc_status: KycStatus;
  kyc_id_type: KycIdType;
  kyc_id_number: string;
  kyc_id_front_image: string; // URL to the image
  kyc_selfie_with_id_image: string; // URL to the image
  accepted_terms: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type WithdrawalMethod = "Crypto" | "MobileMoney" | "BankAccount";
export type WithdrawalStatus = "Pending" | "In Review" | "Approved" | "Rejected" | "Completed" | "Failed";

export interface WithdrawalRequest {
  user_id: string;
  payout_profile_id: string;
  amount: number;
  method: WithdrawalMethod;
  destination: any; // wallet address, phone, or bank details
  status: WithdrawalStatus;
  failure_reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WithdrawalResponse {
  results: WithdrawalRequest
}