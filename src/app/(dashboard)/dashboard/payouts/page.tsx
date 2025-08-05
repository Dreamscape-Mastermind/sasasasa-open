"use client";
import { useState } from "react";
import { ProfileStatusCard, type KycStatus } from "@/components/dashboard/payouts/ProfileStatusCard";
import { WithdrawalForm } from "@/components/dashboard/payouts/WithdrawalForm";
import { WithdrawalHistory } from "@/components/dashboard/payouts/WithdrawalHistory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, CreditCard } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const Payouts = () => {
  // Demo state - in real app this would come from backend
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<"profile" | "withdrawal">("profile");
  const [kycStatus] = useState<KycStatus>("verified"); // Demo: change to test different states
  const [userName] = useState(`${user?.first_name} ${user?.last_name}}`);
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log(user?.first_name);

  const handleWithdrawalSubmit = async (data: any) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    console.log("Withdrawal submitted:", data);
  };

  const canAccessWithdrawal = kycStatus === "verified";

  if (currentView === "withdrawal" && canAccessWithdrawal) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentView("profile")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Profile</span>
            </Button>
          </div>

          <WithdrawalForm
            onSubmit={handleWithdrawalSubmit}
            isLoading={isSubmitting}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text">
              KYC Verification Portal
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
            lastUpdated="2024-01-15"
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
                  <Button variant="default" size="lg"
                    onClick={() => setCurrentView("withdrawal")}
                  // className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                  >
                    Request Withdrawal
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    {kycStatus === "pending"
                      ? "Your verification is being reviewed. You'll be able to request withdrawals once approved."
                      : kycStatus === "needs_update"
                        ? "Please submit your KYC documents to update your information and access withdrawal features."
                        : "Your verification was not approved. Please contact support for assistance."
                    }
                  </p>
                  {kycStatus === "rejected" && (
                    <Button
                      variant="outline"
                      className="w-full"
                    >
                      Contact Support
                    </Button>
                  )}
                  {kycStatus === "needs_update" && (
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
        {canAccessWithdrawal && <WithdrawalHistory />}
      </div>
    </div>
  );
};

export default Payouts;