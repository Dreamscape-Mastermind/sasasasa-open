"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadtab";
import { KycReviewDashboard } from "@/components/dashboard/admin/KycReviewDashboard";
import { WithdrawalManagement } from "@/components/dashboard/admin/WithdrawalManagement";
import { Shield, HandCoins } from "lucide-react";
import { usePayouts } from "@/hooks/usePayouts";

const AdminDashboard = () => {
  const { useGetKycSubmissions, useGetWithdrawals } = usePayouts();
  const { data: kycData, isLoading: isKycLoading } = useGetKycSubmissions();
  const { data: withdrawalsData, isLoading: isWithdrawalsLoading } = useGetWithdrawals();

  const pendingKyc = kycData?.results?.filter(app => app.kyc_status === "Pending").length || 0;
  const pendingWithdrawals = withdrawalsData?.results?.filter(wd => wd.status === "Pending").length || 0;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4 py-8">
          <div className="flex space-x-2 mb-4">
            
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Manage KYC reviews and withdrawal approvals
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending KYC</p>
                  {isKycLoading ? (
                    <div className="h-8 w-16 bg-muted rounded-md animate-pulse" />
                  ) : (
                    <p className="text-2xl font-bold">{pendingKyc}</p>
                  )}
                </div>
                <Shield className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Withdrawals</p>
                  {isWithdrawalsLoading ? (
                    <div className="h-8 w-16 bg-muted rounded-md animate-pulse" />
                  ) : (
                    <p className="text-2xl font-bold">{pendingWithdrawals}</p>
                  )}
                </div>
                <HandCoins className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="kyc" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 h-auto md:grid-cols-2 md:h-10">
            <TabsTrigger value="kyc" className="flex items-center gap-2">
              KYC Reviews
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex items-center gap-2">
              Withdrawal Management
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="kyc">
            <KycReviewDashboard />
          </TabsContent>
          
          <TabsContent value="withdrawals">
            <WithdrawalManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
