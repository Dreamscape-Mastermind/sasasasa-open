"use client"
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, CheckCircle, XCircle, Clock, AlertTriangle, DollarSign } from "lucide-react";
import toast from "react-hot-toast";

interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  email: string;
  amount: number;
  currency: string;
  paymentMethod: "crypto" | "mobile_money" | "bank_account";
  destination: string;
  requestedAt: string;
  status: "pending" | "processing" | "completed" | "failed";
  failureReason?: string;
}

const dummyWithdrawals: WithdrawalRequest[] = [
  {
    id: "wd-001",
    userId: "user-001",
    userName: "John Doe",
    email: "john.doe@example.com",
    amount: 500,
    currency: "USD",
    paymentMethod: "crypto",
    destination: "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
    requestedAt: "2024-01-15T14:30:00Z",
    status: "pending"
  },
  {
    id: "wd-002",
    userId: "user-002",
    userName: "Jane Smith",
    email: "jane.smith@example.com",
    amount: 250,
    currency: "USD",
    paymentMethod: "mobile_money",
    destination: "+1234567890",
    requestedAt: "2024-01-15T12:15:00Z",
    status: "processing"
  },
  {
    id: "wd-003",
    userId: "user-003",
    userName: "Mike Johnson",
    email: "mike.johnson@example.com",
    amount: 1000,
    currency: "USD",
    paymentMethod: "bank_account",
    destination: "Account: ****1234, Bank: ABC Bank",
    requestedAt: "2024-01-14T16:45:00Z",
    status: "completed"
  },
  {
    id: "wd-004",
    userId: "user-004",
    userName: "Sarah Wilson",
    email: "sarah.wilson@example.com",
    amount: 750,
    currency: "USD",
    paymentMethod: "crypto",
    destination: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    requestedAt: "2024-01-14T10:20:00Z",
    status: "failed",
    failureReason: "Invalid wallet address"
  }
];

export function WithdrawalManagement() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(dummyWithdrawals);
  const [selectedWithdrawals, setSelectedWithdrawals] = useState<string[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [failureReason, setFailureReason] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const getStatusBadge = (status: WithdrawalRequest["status"]) => {
    const configs = {
      pending: { variant: "secondary" as const, icon: Clock, label: "Pending" },
      processing: { variant: "outline" as const, icon: AlertTriangle, label: "Processing" },
      completed: { variant: "default" as const, icon: CheckCircle, label: "Completed" },
      failed: { variant: "destructive" as const, icon: XCircle, label: "Failed" }
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

  const getPaymentMethodLabel = (method: WithdrawalRequest["paymentMethod"]) => {
    const labels = {
      crypto: "Cryptocurrency",
      mobile_money: "Mobile Money",
      bank_account: "Bank Account"
    };
    return labels[method];
  };

  const handleApprove = (request: WithdrawalRequest) => {
    setWithdrawals(prev => 
      prev.map(wd => 
        wd.id === request.id ? { ...wd, status: "completed" } : wd
      )
    );
    toast.success(
      `${request.amount} withdrawal for ${request.userName} has been approved.`
    );
    setIsDialogOpen(false);
  };

  const handleReject = (request: WithdrawalRequest) => {
    if (!failureReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    setWithdrawals(prev => 
      prev.map(wd => 
        wd.id === request.id ? { ...wd, status: "failed", failureReason } : wd
      )
    );
    toast.error(`Withdrawal for ${request.userName} has been rejected.`);
    setIsDialogOpen(false);
    setFailureReason("");
  };

  const handleBulkApprove = () => {
    const pendingSelected = selectedWithdrawals.filter(id => {
      const request = withdrawals.find(wd => wd.id === id);
      return request?.status === "pending";
    });

    if (pendingSelected.length === 0) {
      toast.error("Please select pending withdrawal requests to approve.");
      return;
    }

    setWithdrawals(prev => 
      prev.map(wd => 
        pendingSelected.includes(wd.id) ? { ...wd, status: "completed" } : wd
      )
    );

    toast.success(`${pendingSelected.length} withdrawal(s) have been approved.`);
    setSelectedWithdrawals([]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const filteredIds = getFilteredWithdrawals().map(wd => wd.id);
      setSelectedWithdrawals(filteredIds);
    } else {
      setSelectedWithdrawals([]);
    }
  };

  const getFilteredWithdrawals = () => {
    if (statusFilter === "all") return withdrawals;
    return withdrawals.filter(wd => wd.status === statusFilter);
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

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency
    }).format(amount);
  };

  const filteredWithdrawals = getFilteredWithdrawals();
  const totalPending = withdrawals.filter(wd => wd.status === "pending").length;
  const totalAmount = withdrawals
    .filter(wd => wd.status === "pending")
    .reduce((sum, wd) => sum + wd.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
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
                <p className="text-2xl font-bold">{formatAmount(totalAmount, "USD")}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">94%</p>
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
              <DollarSign className="h-5 w-5" />
              Withdrawal Management
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
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
                    checked={selectedWithdrawals.length === filteredWithdrawals.length && filteredWithdrawals.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWithdrawals.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedWithdrawals.includes(request.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedWithdrawals(prev => [...prev, request.id]);
                        } else {
                          setSelectedWithdrawals(prev => prev.filter(id => id !== request.id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.userName}</div>
                      <div className="text-sm text-muted-foreground">{request.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatAmount(request.amount, request.currency)}
                  </TableCell>
                  <TableCell>
                    {getPaymentMethodLabel(request.paymentMethod)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(request.requestedAt)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(request.status)}
                  </TableCell>
                  <TableCell>
                    <Dialog open={isDialogOpen && selectedRequest?.id === request.id} onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (!open) {
                        setSelectedRequest(null);
                        setFailureReason("");
                      }
                    }}>
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
                          <DialogTitle>Withdrawal Request Review - {request.userName}</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Request Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Amount</label>
                                  <p className="text-lg font-semibold">{formatAmount(request.amount, request.currency)}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                                  <p className="text-sm">{getPaymentMethodLabel(request.paymentMethod)}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Destination</label>
                                  <p className="text-sm break-all">{request.destination}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Requested At</label>
                                  <p className="text-sm">{formatDate(request.requestedAt)}</p>
                                </div>
                              </div>
                              
                              {request.failureReason && (
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Failure Reason</label>
                                  <p className="text-sm text-destructive">{request.failureReason}</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Review Actions */}
                          {request.status === "pending" ? (
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                  Failure Reason (required for rejection)
                                </label>
                                <Textarea
                                  placeholder="Enter reason for rejection..."
                                  value={failureReason}
                                  onChange={(e) => setFailureReason(e.target.value)}
                                  className="min-h-[80px]"
                                />
                              </div>
                              <div className="flex gap-3">
                                <Button
                                  onClick={() => handleApprove(request)}
                                  className="flex-1 bg-gradient-success hover:opacity-90"
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
                              <span>This request has been {request.status}</span>
                            </div>
                          )}
                        </div>
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