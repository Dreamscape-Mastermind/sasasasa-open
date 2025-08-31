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
      mutationFn: ({ profileId, data }: { profileId: string, data: Partial<PayoutProfile> | FormData }) => payoutService.updatePayoutProfile(profileId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['payoutProfile'] });
      },
    });
  };

  const useCreatePayoutProfile = () => {
    return useMutation({
      mutationFn: (data: Partial<PayoutProfile> | FormData) => payoutService.createPayoutProfile(data),
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
      refetchInterval: 15000,
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
      refetchInterval: 15000,
    });
  };

  const useReviewKycSubmission = () => {
    return useMutation({
      mutationFn: ({ submissionId, ...data }: { submissionId: string; status: 'Verified' | 'Rejected'; reason?: string }) => payoutService.reviewKycSubmission(submissionId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['kycSubmissions'] });
      },
    });
  };

  const useReviewWithdrawal = () => {
    return useMutation({
      mutationFn: ({ withdrawalId, ...data }: { withdrawalId: string; status: 'Approved' | 'Rejected'; failure_reason?: string }) => payoutService.reviewWithdrawal(withdrawalId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
        queryClient.invalidateQueries({ queryKey: ['kycSubmissions'] }); // In case this affects KYC status
      },
    });
  };

  return {
    useGetPayoutProfile,
    useUpdatePayoutProfile,
    useCreatePayoutProfile,
    useGetAgreements,
    useRequestWithdrawal,
    useGetWithdrawals,
    useDownloadWithdrawals,
    useGetKycSubmissions,
    useReviewKycSubmission,
    useReviewWithdrawal,
  };
};
