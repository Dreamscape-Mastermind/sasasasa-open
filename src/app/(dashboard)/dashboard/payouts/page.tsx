"use client";
import { useState } from "react";
import { ProfileStatusCard, type KycStatus } from "@/components/dashboard/payouts/ProfileStatusCard";
import { WithdrawalForm } from "@/components/dashboard/payouts/WithdrawalForm";
import { WithdrawalHistory } from "@/components/dashboard/payouts/WithdrawalHistory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, CreditCard } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { usePayouts } from "@/hooks/usePayouts";

const Payouts = () => {
  const { user } = useAuth();
  const { useGetPayoutProfile, useRequestWithdrawal, useGetWithdrawals } = usePayouts();

  const { data: payoutProfile, isLoading: isProfileLoading } = useGetPayoutProfile();
  const { mutate: requestWithdrawal, isPending: isSubmitting } = useRequestWithdrawal();
  const { data: withdrawals, isLoading: isHistoryLoading } = useGetWithdrawals();

  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);

  const handleWithdrawalSubmit = (data: any) => {
    requestWithdrawal(data, {
      onSuccess: () => {
        setIsWithdrawalModalOpen(false);
      },
    });
  };

  const kycStatus: KycStatus = payoutProfile?.result.kyc_status || "Pending";
  const userName = `${user?.first_name} ${user?.last_name}`;
  const canAccessWithdrawal = kycStatus === "Verified";

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text">
              Payouts Portal
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Secure verification and instant payouts for verified users
          </p>
        </div>

        {/* Profile Status Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <ProfileStatusCard
            status={kycStatus}
            userName={userName}
            lastUpdated={payoutProfile?.result.updatedAt.toString() || new Date().toISOString()}
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
        {canAccessWithdrawal && <WithdrawalHistory withdrawals={withdrawals?.result} isLoading={isHistoryLoading} />}
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
    </div>
  );
};

export default Payouts;
