import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { payoutService } from '@/services/payout.service';
import { PayoutProfile, WithdrawalRequest } from '@/types/payouts';

export const usePayouts = () => {
  const queryClient = useQueryClient();

  // Profile
  const useGetPayoutProfile = () => {
    return useQuery({
      queryKey: ['payoutProfile'],
      queryFn: () => payoutService.getPayoutProfile(),
    });
  };

  const useUpdatePayoutProfile = () => {
    return useMutation({
      mutationFn: (data: Partial<PayoutProfile> | FormData) => payoutService.updatePayoutProfile(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['payoutProfile'] });
      },
    });
  };

  const useGetAgreements = () => {
    return useQuery({
      queryKey: ['payoutAgreements'],
      queryFn: () => payoutService.getAgreements(),
    });
  };

  // Withdrawals
  const useRequestWithdrawal = () => {
    return useMutation({
      mutationFn: (data: Partial<WithdrawalRequest>) => payoutService.requestWithdrawal(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      },
    });
  };

  const useGetWithdrawals = () => {
    return useQuery({
      queryKey: ['withdrawals'],
      queryFn: () => payoutService.getWithdrawals(),
    });
  };

  const useDownloadWithdrawals = () => {
    return useMutation({
      mutationFn: () => payoutService.downloadWithdrawals(),
    });
  };

  // Admin
  const useGetKycSubmissions = () => {
    return useQuery({
      queryKey: ['kycSubmissions'],
      queryFn: () => payoutService.getKycSubmissions(),
    });
  };

  const useReviewWithdrawal = () => {
    return useMutation({
      mutationFn: (data: { withdrawalId: string; status: 'Approved' | 'Rejected'; reason?: string }) => payoutService.reviewWithdrawal(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
        queryClient.invalidateQueries({ queryKey: ['kycSubmissions'] }); // In case this affects KYC status
      },
    });
  };

  return {
    useGetPayoutProfile,
    useUpdatePayoutProfile,
    useGetAgreements,
    useRequestWithdrawal,
    useGetWithdrawals,
    useDownloadWithdrawals,
    useGetKycSubmissions,
    useReviewWithdrawal,
  };
};
