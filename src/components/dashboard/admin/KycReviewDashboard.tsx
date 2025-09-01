"use client"
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { usePayouts } from "@/hooks/usePayouts";
import { PayoutProfile, KycStatus } from "@/types/payouts";

// TODO: This should be a more specific type for KYC applications
// For now, we are reusing PayoutProfile as it contains most of the required fields.
interface KycApplication extends PayoutProfile {}

export function KycReviewDashboard() {
  const { useGetKycSubmissions, useReviewKycSubmission } = usePayouts();
  const { data: kycData, isLoading } = useGetKycSubmissions();
  const { mutate: reviewKycSubmission } = useReviewKycSubmission();

  const [applications, setApplications] = useState<PayoutProfile[]>([]);
  const [selectedApp, setSelectedApp] = useState<PayoutProfile | null>(null);
  const [reviewReason, setReviewReason] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (kycData?.results) {
      setApplications(kycData?.results);
    }
  }, [kycData]);

  const getStatusBadge = (status: KycStatus) => {
    const configs = {
      Pending: { variant: "secondary" as const, icon: Clock, label: "Pending" },
      "Needs Update": { variant: "outline" as const, icon: AlertCircle, label: "Needs Update" },
      Verified: { variant: "default" as const, icon: CheckCircle, label: "Verified" },
      Rejected: { variant: "destructive" as const, icon: XCircle, label: "Rejected" }
    };

    const config = configs[status];
    if (!config) return null;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleApprove = (application: KycApplication) => {
    reviewKycSubmission({ submissionId: application.id, status: "Verified" }, {
      onSuccess: () => {
        toast.success(`${application.kyc_id_number}'s KYC has been verified.`);
        setIsDialogOpen(false);
        setReviewReason("");
      },
      onError: () => {
        toast.error("Failed to verify KYC.");
      }
    });
  };

  const handleReject = (application: KycApplication) => {
    if (!reviewReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    reviewKycSubmission({ submissionId: application.id, status: "Rejected", reason: reviewReason }, {
      onSuccess: () => {
        toast.error(`${application.kyc_id_number}'s KYC has been rejected.`);
        setIsDialogOpen(false);
        setReviewReason("");
      },
      onError: () => {
        toast.error("Failed to reject KYC.");
      }
    });
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            KYC Review Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
              ) : (
                applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{app.kyc_id_number}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(app.updated_at)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(app.kyc_status)}
                    </TableCell>
                    <TableCell>
                      <Dialog open={isDialogOpen && selectedApp?.id === app.id} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) {
                          setSelectedApp(null);
                          setReviewReason("");
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedApp(app)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>KYC Application Review - {app.kyc_id_number}</DialogTitle>
                          </DialogHeader>
                          
                          <div className="grid gap-6 md:grid-cols-2">
                            {/* Personal Information */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Personal Information</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">ID Type</label>
                                  <p className="text-sm">{app.kyc_id_type}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">ID Number</label>
                                  <p className="text-sm">{app.kyc_id_number}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Accepted Terms</label>
                                  <p className="text-sm">{app.accepted_terms ? "Yes" : "No"}</p>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Documents */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Documents</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground mb-2 block">ID Card</label>
                                  <img 
                                    src={app.kyc_id_front_image} 
                                    alt="ID Card" 
                                    className="w-full h-32 object-cover rounded border"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Selfie holding ID</label>
                                  <img 
                                    src={app.kyc_selfie_with_id_image} 
                                    alt="Selfie" 
                                    className="w-full h-32 object-cover rounded border"
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Review Actions */}
                          {app.kyc_status === "Pending" || app.kyc_status === "Needs Update" ? (
                            <div className="space-y-4 pt-4 border-t">
                              <div>
                                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                  Review Reason (required for rejection)
                                </label>
                                <Textarea
                                  placeholder="Enter reason for approval/rejection..."
                                  value={reviewReason}
                                  onChange={(e) => setReviewReason(e.target.value)}
                                  className="min-h-[80px]"
                                />
                              </div>
                              <div className="flex gap-3">
                                <Button
                                  onClick={() => handleApprove(app)}
                                  variant="outline"
                                  className="flex-1"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => handleReject(app)}
                                  variant="destructive"
                                  className="flex-1"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="pt-4 border-t">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {getStatusBadge(app.kyc_status)}
                                <span>This application has already been {app.kyc_status}</span>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
