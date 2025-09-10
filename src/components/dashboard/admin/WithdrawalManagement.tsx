"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  HandCoins,
} from "lucide-react";
import toast from "react-hot-toast";
import { usePayouts } from "@/hooks/usePayouts";
import { WithdrawalRequest, WithdrawalStatus } from "@/types/payouts";

export function WithdrawalManagement() {
  const { useGetWithdrawals, useReviewWithdrawal } = usePayouts();
  const { data: withdrawalsData, isLoading } = useGetWithdrawals();
  const { mutate: reviewWithdrawal } = useReviewWithdrawal();

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [selectedWithdrawals, setSelectedWithdrawals] = useState<string[]>([]);
  const [selectedRequest, setSelectedRequest] =
    useState<WithdrawalRequest | null>(null);
  const [failureReason, setFailureReason] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (withdrawalsData?.results) {
      setWithdrawals(withdrawalsData.results);
    }
  }, [withdrawalsData]);

  const getStatusBadge = (status: WithdrawalStatus) => {
    const configs = {
      Pending: { variant: "secondary" as const, icon: Clock, label: "Pending" },
      "In Review": {
        variant: "outline" as const,
        icon: AlertTriangle,
        label: "In Review",
      },
      Approved: {
        variant: "default" as const,
        icon: CheckCircle,
        label: "Approved",
      },
      Rejected: {
        variant: "destructive" as const,
        icon: XCircle,
        label: "Rejected",
      },
      Completed: {
        variant: "default" as const,
        icon: CheckCircle,
        label: "Completed",
      },
      Failed: {
        variant: "destructive" as const,
        icon: XCircle,
        label: "Failed",
      },
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

  const getPaymentMethodLabel = (method: WithdrawalRequest["method"]) => {
    const labels = {
      Crypto: "Cryptocurrency",
      MobileMoney: "Mobile Money",
      BankAccount: "Bank Account",
    };
    return labels[method];
  };

  const handleApprove = (request: WithdrawalRequest) => {
    reviewWithdrawal(
      { withdrawalId: request.id, status: "Approved" },
      {
        onSuccess: () => {
          toast.success(
            `Withdrawal for ${request.destination} has been approved.`
          );
          setIsDialogOpen(false);
        },
        onError: () => {
          toast.error("Failed to approve withdrawal.");
        },
      }
    );
  };

  const handleReject = (request: WithdrawalRequest) => {
    if (!failureReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    reviewWithdrawal(
      {
        withdrawalId: request.id,
        status: "Rejected",
        failure_reason: failureReason,
      },
      {
        onSuccess: () => {
          toast.error(
            `Withdrawal for ${request.destination} has been rejected.`
          );
          setIsDialogOpen(false);
          setFailureReason("");
        },
        onError: () => {
          toast.error("Failed to reject withdrawal.");
        },
      }
    );
  };

  const handleBulkApprove = () => {
    const pendingSelected = selectedWithdrawals.filter((id) => {
      const request = withdrawals.find((wd) => wd.id === id);
      return request?.status === "Pending";
    });

    if (pendingSelected.length === 0) {
      toast.error("Please select pending withdrawal requests to approve.");
      return;
    }

    pendingSelected.forEach((id) => {
      reviewWithdrawal({ withdrawalId: id, status: "Approved" });
    });

    toast.success(
      `${pendingSelected.length} withdrawal(s) have been approved.`
    );
    setSelectedWithdrawals([]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const filteredIds = getFilteredWithdrawals().map((wd) => wd.id);
      setSelectedWithdrawals(filteredIds);
    } else {
      setSelectedWithdrawals([]);
    }
  };

  const getFilteredWithdrawals = () => {
    if (statusFilter === "all") return withdrawals;
    return withdrawals.filter((wd) => wd.status === statusFilter);
  };

  const formatDate = (dateString: Date | string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const filteredWithdrawals = getFilteredWithdrawals();
  const totalPending = withdrawals.filter(
    (wd) => wd.status === "Pending"
  ).length;
  const totalAmount = withdrawals
    .filter((wd) => wd.status === "Pending")
    .reduce((sum, wd) => sum + Number(wd.amount), 0);

  const completedWithdrawals = withdrawals.filter(
    (wd) => wd.status === "Completed"
  ).length;
  const failedWithdrawals = withdrawals.filter(
    (wd) => wd.status === "Failed"
  ).length;
  const totalCompletedAndFailed = completedWithdrawals + failedWithdrawals;
  const successRate =
    totalCompletedAndFailed > 0
      ? (completedWithdrawals / totalCompletedAndFailed) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Pending Requests
                </p>
                <p className="text-2xl font-bold">{totalPending}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold">
                  {formatAmount(totalAmount, "KES")}
                </p>
              </div>
              <HandCoins className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                {isLoading ? (
                  <div className="h-8 w-24 bg-muted rounded-md animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold">
                    {successRate.toFixed(0)}%
                  </p>
                )}
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <HandCoins className="h-5 w-5" />
              Withdrawal Management
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Review">In Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={handleBulkApprove}
                disabled={selectedWithdrawals.length === 0}
                className="bg-gradient-success hover:opacity-90"
              >
                Bulk Approve ({selectedWithdrawals.length})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Checkbox
                    checked={
                      selectedWithdrawals.length ===
                        filteredWithdrawals.length &&
                      filteredWithdrawals.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                filteredWithdrawals.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedWithdrawals.includes(request.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedWithdrawals((prev) => [
                              ...prev,
                              request.id,
                            ]);
                          } else {
                            setSelectedWithdrawals((prev) =>
                              prev.filter((id) => id !== request.id)
                            );
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      <div className="font-medium">
                        {JSON.stringify(request.destination)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatAmount(request.amount, "KES")}
                    </TableCell>
                    <TableCell>
                      {getPaymentMethodLabel(request.method)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(request.created_at)}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <Dialog
                        open={
                          isDialogOpen && selectedRequest?.id === request.id
                        }
                        onOpenChange={(open) => {
                          setIsDialogOpen(open);
                          if (!open) {
                            setSelectedRequest(null);
                            setFailureReason("");
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>
                              Withdrawal Request Review -{" "}
                              {`${request.destination}`}
                            </DialogTitle>
                          </DialogHeader>

                          <div className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">
                                  Request Details
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Amount
                                    </label>
                                    <p className="text-lg font-semibold">
                                      {formatAmount(request.amount, "KES")}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Payment Method
                                    </label>
                                    <p className="text-sm">
                                      {getPaymentMethodLabel(request.method)}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Destination
                                    </label>
                                    <p className="text-sm break-all">
                                      {JSON.stringify(request.destination)}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Requested At
                                    </label>
                                    <p className="text-sm">
                                      {formatDate(request.created_at)}
                                    </p>
                                  </div>
                                </div>

                                {request.failure_reason && (
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Failure Reason
                                    </label>
                                    <p className="text-sm text-destructive">
                                      {request.failure_reason}
                                    </p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>

                            {/* Review Actions */}
                            {request.status === "Pending" ? (
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                    Failure Reason (required for rejection)
                                  </label>
                                  <Textarea
                                    placeholder="Enter reason for rejection..."
                                    value={failureReason}
                                    onChange={(e) =>
                                      setFailureReason(e.target.value)
                                    }
                                    className="min-h-[80px]"
                                  />
                                </div>
                                <div className="flex gap-3">
                                  <Button
                                    onClick={() => handleApprove(request)}
                                    variant="outline"
                                    className="flex-1"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={() => handleReject(request)}
                                    variant="destructive"
                                    className="flex-1"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {getStatusBadge(request.status)}
                                <span>
                                  This request has been {request.status}
                                </span>
                              </div>
                            )}
                          </div>
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
