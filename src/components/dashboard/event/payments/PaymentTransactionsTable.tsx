"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormEvent, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaymentDetails } from "./PaymentDetails";
import { PaymentStatus } from "@/types/payment";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { usePayment } from "@/hooks/usePayment";

interface PaymentTransactionsTableProps {
  eventId: string;
}

export function PaymentTransactionsTable({
  eventId,
}: PaymentTransactionsTableProps) {
  const { usePayments } = usePayment();
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">(
    "all"
  );

  // Fetch payments for this event
  const {
    data: paymentsResponse,
    isLoading,
    error,
  } = usePayments({
    event: eventId,
    search: searchQuery || undefined,
    page: currentPage,
    status: statusFilter !== "all" ? statusFilter : undefined,
    page_size: 10,
  });

  const payments = paymentsResponse?.result?.results || [];
  const totalPages = Math.ceil((paymentsResponse?.result?.count ?? 0) / 10);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const getStatusBadgeVariant = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return "success";
      case PaymentStatus.PENDING:
      case PaymentStatus.PROCESSING:
        return "warning";
      case PaymentStatus.FAILED:
      case PaymentStatus.CANCELLED:
        return "destructive";
      case PaymentStatus.REFUNDED:
        return "info";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    // searchQuery is already bound to input
  };

  const handleFilterChange = (status: PaymentStatus | "all") => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Loading transactions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Error loading transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-destructive">Failed to load transactions</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {!selectedPaymentId ? (
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              A list of your recent transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#18181b] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#CC322D]"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </form>
              <select
                value={statusFilter}
                onChange={(e) =>
                  handleFilterChange(e.target.value as PaymentStatus | "all")
                }
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#18181b] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#CC322D]"
              >
                <option value="all">All Status</option>
                <option value={PaymentStatus.COMPLETED}>Completed</option>
                <option value={PaymentStatus.PENDING}>Pending</option>
                <option value={PaymentStatus.PROCESSING}>Processing</option>
                <option value={PaymentStatus.FAILED}>Failed</option>
                <option value={PaymentStatus.CANCELLED}>Cancelled</option>
                <option value={PaymentStatus.REFUNDED}>Refunded</option>
              </select>
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden space-y-3">
              {payments.length === 0 ? (
                <div className="rounded-xl border p-4 text-center text-muted-foreground">
                  No transactions found
                </div>
              ) : (
                payments.map((payment) => (
                  <button
                    key={payment.id}
                    onClick={() => setSelectedPaymentId(payment.id)}
                    className="w-full text-left rounded-xl border p-4 bg-card hover:border-primary/40 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-foreground">
                        KES. {payment.amount} {payment.currency}
                      </div>
                      <Badge variant={getStatusBadgeVariant(payment.status)}>
                        {payment.status.toLowerCase()}
                      </Badge>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        <div className="uppercase tracking-wide">Date</div>
                        <div className="text-foreground">
                          {formatDate(payment.created_at)}
                        </div>
                      </div>
                      <div>
                        <div className="uppercase tracking-wide">Customer</div>
                        <div className="text-foreground truncate">
                          {payment.customer_first_name}{" "}
                          {payment.customer_last_name}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="uppercase tracking-wide">Reference</div>
                        <div className="font-mono text-foreground break-all">
                          {payment.reference}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-muted-foreground">Loading...</div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-destructive">
                          Failed to load transactions
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-muted-foreground">
                          No transactions found
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.reference}
                        </TableCell>
                        <TableCell>{formatDate(payment.created_at)}</TableCell>
                        <TableCell>
                          {payment.customer_first_name}{" "}
                          {payment.customer_last_name}
                        </TableCell>
                        <TableCell>
                          {payment.metadata?.event?.title
                            ? payment.metadata.event.title
                            : `Event #KES. {payment.id}`}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs">KES. </span>
                          {payment.amount} {payment.currency}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(payment.status)}
                          >
                            {payment.status.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPaymentId(payment.id)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange?.(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange?.(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        selectedPaymentId && (
          <div className="mt-6">
            <PaymentDetails
              paymentId={selectedPaymentId}
              onBack={() => setSelectedPaymentId(null)}
            />
          </div>
        )
      )}
    </>
  );
}
