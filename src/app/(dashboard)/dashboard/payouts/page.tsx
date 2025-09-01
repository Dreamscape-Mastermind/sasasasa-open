"use client";
import { useState } from "react";
import { ProfileStatusCard, type KycStatus } from "@/components/dashboard/payouts/ProfileStatusCard";
import { WithdrawalForm } from "@/components/dashboard/payouts/WithdrawalForm";
import { WithdrawalHistory } from "@/components/dashboard/payouts/WithdrawalHistory";
import { UpdateFinancialInfoModal } from "@/components/dashboard/payouts/UpdateFinancialInfoModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, CreditCard, Building2, Smartphone } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { usePayouts } from "@/hooks/usePayouts";

const Payouts = () => {
  const { user } = useAuth();
  const { useGetPayoutProfile, useRequestWithdrawal, useGetWithdrawals, useUpdatePayoutProfile } = usePayouts();

  const { data: payoutProfile, isLoading: isProfileLoading } = useGetPayoutProfile();
  const { mutate: requestWithdrawal, isPending: isSubmitting } = useRequestWithdrawal();
  const { mutate: updatePayoutProfile, isPending: isUpdatingProfile } = useUpdatePayoutProfile();
  const { data: withdrawals, isLoading: isHistoryLoading } = useGetWithdrawals();

  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isFinancialInfoModalOpen, setIsFinancialInfoModalOpen] = useState(false);

  const handleWithdrawalSubmit = (data: any) => {
    requestWithdrawal(data, {
      onSuccess: () => {
        setIsWithdrawalModalOpen(false);
      },
    });
  };

  const handleUpdateFinancialProfile = (data: any) => {
    if (!payoutProfile?.result?.id) return;
    updatePayoutProfile({ profileId: payoutProfile.result.id, data }, {
      onSuccess: () => {
        setIsFinancialInfoModalOpen(false);
      },
    });
  };

  const kycStatus: KycStatus = payoutProfile && payoutProfile.status == "success" ? payoutProfile?.result?.kyc_status as KycStatus : "Needs Update";
  const userName = `${user?.first_name} ${user?.last_name}`;
  const canAccessWithdrawal = kycStatus === "Verified";
  const lastUpdated = payoutProfile && payoutProfile.status == "success" ? payoutProfile?.result?.updated_at.toString() : new Date().toISOString();
  
  const initialFinancialData = payoutProfile && payoutProfile.status == "success" ? {
    wallet_address: payoutProfile?.result?.wallet_address || '',
    mobile_money_number: payoutProfile?.result?.mobile_money_number || '',
    bank_account_details: {
      account_name: payoutProfile?.result?.bank_account_details?.account_name || '',
      account_number: payoutProfile?.result?.bank_account_details?.account_number || '',
      bank_code: payoutProfile?.result?.bank_account_details?.bank_code || '',
    },
  } : {};

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4 py-8">
          <div className="flex space-x-2 mb-4">
          
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text">
              Payouts Portal
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Secure verification and instant payouts for verified users
          </p>
        </div>

        {/* Profile Status Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <ProfileStatusCard
            status={kycStatus}
            userName={userName}
            lastUpdated={lastUpdated}
            isLoading={isProfileLoading}
          />

          {/* Action Card */}
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Available Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {canAccessWithdrawal ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Your profile is verified! You can now request withdrawals.
                  </p>
                  <Button variant="default" size="lg" onClick={() => setIsWithdrawalModalOpen(true)}>
                    Request Withdrawal
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    {kycStatus === "Pending"
                      ? "Your verification is being reviewed. You'll be able to request withdrawals once approved."
                      : kycStatus === "Needs Update"
                        ? "Please submit your KYC documents to update your information and access withdrawal features."
                        : "Your verification was not approved. Please contact support for assistance."
                    }
                  </p>
                  {kycStatus === "Rejected" && (
                    <Button
                      variant="outline"
                      className="w-full"
                    >
                      Contact Support
                    </Button>
                  )}
                  {kycStatus === "Needs Update" && (
                    <Link href="/dashboard/kyc" className="w-full">
                      <Button
                        variant="default"
                        className="w-full"
                      >
                        Update/Start KYC
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {canAccessWithdrawal && (
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Keep your financial information up to date to ensure smooth payouts.
                    </p>
                    <Button variant="outline" onClick={() => setIsFinancialInfoModalOpen(true)}>
                        Update Financial Information
                    </Button>
                </div>
            </CardContent>
          </Card>
        )}

        {/* Status Guide */}
        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardHeader>
            <CardTitle>Verification Status Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="font-medium text-sm">Verified</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Full access to all features including withdrawals
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span className="font-medium text-sm">Pending</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Documents under review, limited access
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="font-medium text-sm">Needs Update</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Additional information required
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="font-medium text-sm">Rejected</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Verification not approved, contact support
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        {canAccessWithdrawal && <WithdrawalHistory withdrawals={withdrawals?.results || []} isLoading={isHistoryLoading} />}
      </div>

      <Dialog open={isWithdrawalModalOpen} onOpenChange={setIsWithdrawalModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request a Withdrawal</DialogTitle>
          </DialogHeader>
          <WithdrawalForm
            onSubmit={handleWithdrawalSubmit}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <UpdateFinancialInfoModal
        isOpen={isFinancialInfoModalOpen}
        onOpenChange={setIsFinancialInfoModalOpen}
        onSubmit={handleUpdateFinancialProfile}
        isLoading={isUpdatingProfile}
        initialData={initialFinancialData ? initialFinancialData : undefined}
      />
    </div>
  );
};

export default Payouts;
