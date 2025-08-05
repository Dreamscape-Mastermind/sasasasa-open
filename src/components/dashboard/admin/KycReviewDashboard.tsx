"use client"
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface KycApplication {
  id: string;
  userId: string;
  userName: string;
  email: string;
  submittedAt: string;
  status: "pending" | "reviewing" | "verified" | "rejected";
  documents: {
    idCard: string;
    selfie: string;
    proofOfAddress?: string;
  };
  personalInfo: {
    fullName: string;
    dateOfBirth: string;
    nationality: string;
    address: string;
  };
}

const dummyApplications: KycApplication[] = [
  {
    id: "kyc-001",
    userId: "user-001",
    userName: "John Doe",
    email: "john.doe@example.com",
    submittedAt: "2024-01-15T10:30:00Z",
    status: "pending",
    documents: {
      idCard: "/placeholder.svg",
      selfie: "/placeholder.svg",
      proofOfAddress: "/placeholder.svg"
    },
    personalInfo: {
      fullName: "John Doe",
      dateOfBirth: "1990-05-15",
      nationality: "US",
      address: "123 Main St, Anytown, USA"
    }
  },
  {
    id: "kyc-002",
    userId: "user-002",
    userName: "Jane Smith",
    email: "jane.smith@example.com",
    submittedAt: "2024-01-14T15:45:00Z",
    status: "reviewing",
    documents: {
      idCard: "/placeholder.svg",
      selfie: "/placeholder.svg"
    },
    personalInfo: {
      fullName: "Jane Smith",
      dateOfBirth: "1985-08-22",
      nationality: "CA",
      address: "456 Oak Ave, Toronto, Canada"
    }
  },
  {
    id: "kyc-003",
    userId: "user-003",
    userName: "Mike Johnson",
    email: "mike.johnson@example.com",
    submittedAt: "2024-01-13T09:15:00Z",
    status: "verified",
    documents: {
      idCard: "/placeholder.svg",
      selfie: "/placeholder.svg",
      proofOfAddress: "/placeholder.svg"
    },
    personalInfo: {
      fullName: "Mike Johnson",
      dateOfBirth: "1992-12-03",
      nationality: "UK",
      address: "789 King Rd, London, UK"
    }
  }
];

export function KycReviewDashboard() {
  const [applications, setApplications] = useState<KycApplication[]>(dummyApplications);
  const [selectedApp, setSelectedApp] = useState<KycApplication | null>(null);
  const [reviewReason, setReviewReason] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getStatusBadge = (status: KycApplication["status"]) => {
    const configs = {
      pending: { variant: "secondary" as const, icon: Clock, label: "Pending" },
      reviewing: { variant: "outline" as const, icon: AlertCircle, label: "Reviewing" },
      verified: { variant: "default" as const, icon: CheckCircle, label: "Verified" },
      rejected: { variant: "destructive" as const, icon: XCircle, label: "Rejected" }
    };

    const config = configs[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleApprove = (application: KycApplication) => {
    setApplications(prev => 
      prev.map(app => 
        app.id === application.id ? { ...app, status: "verified" } : app
      )
    );
    toast.success(`${application.userName}'s KYC has been verified.`
    );
    setIsDialogOpen(false);
    setReviewReason("");
  };

  const handleReject = (application: KycApplication) => {
    if (!reviewReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    setApplications(prev => 
      prev.map(app => 
        app.id === application.id ? { ...app, status: "rejected" } : app
      )
    );
    toast(`${application.userName}'s KYC has been rejected.`);
    setIsDialogOpen(false);
    setReviewReason("");
  };

  const formatDate = (dateString: string) => {
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
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{app.userName}</div>
                      <div className="text-sm text-muted-foreground">{app.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(app.submittedAt)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(app.status)}
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
                          <DialogTitle>KYC Application Review - {app.userName}</DialogTitle>
                        </DialogHeader>
                        
                        <div className="grid gap-6 md:grid-cols-2">
                          {/* Personal Information */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                <p className="text-sm">{app.personalInfo.fullName}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                                <p className="text-sm">{app.personalInfo.dateOfBirth}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                                <p className="text-sm">{app.personalInfo.nationality}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Address</label>
                                <p className="text-sm">{app.personalInfo.address}</p>
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
                                  src={app.documents.idCard} 
                                  alt="ID Card" 
                                  className="w-full h-32 object-cover rounded border"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-muted-foreground mb-2 block">Selfie</label>
                                <img 
                                  src={app.documents.selfie} 
                                  alt="Selfie" 
                                  className="w-full h-32 object-cover rounded border"
                                />
                              </div>
                              {app.documents.proofOfAddress && (
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Proof of Address</label>
                                  <img 
                                    src={app.documents.proofOfAddress} 
                                    alt="Proof of Address" 
                                    className="w-full h-32 object-cover rounded border"
                                  />
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>

                        {/* Review Actions */}
                        {app.status === "pending" || app.status === "reviewing" ? (
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
                                className="flex-1 bg-gradient-success hover:opacity-90"
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
                              {getStatusBadge(app.status)}
                              <span>This application has already been {app.status}</span>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
