"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Download, History, Filter } from "lucide-react";
import { WithdrawalRequest, WithdrawalResponse } from "@/types/payouts";
import { Skeleton } from "@/components/ui/skeleton";

interface WithdrawalHistoryProps {
  withdrawals?: WithdrawalRequest[];
  isLoading: boolean;
}

const ITEMS_PER_PAGE = 5;

export const WithdrawalHistory = ({ withdrawals = [], isLoading }: WithdrawalHistoryProps) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredWithdrawals = withdrawals.filter(withdrawal => 
    statusFilter === "all" || withdrawal.status.toLowerCase() === statusFilter
  );

  const totalPages = Math.ceil(filteredWithdrawals.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedWithdrawals = filteredWithdrawals.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getStatusBadge = (status: WithdrawalRequest["status"]) => {
    const variants = {
      Pending: "bg-gray-500 text-white",
      Completed: "bg-green-500 text-white",
      Failed: "bg-red-500 text-destructive-foreground",
      Cancelled: "bg-red-500 text-muted-foreground",
      "In Review": "bg-yellow-500 text-white",
      Approved: "bg-blue-500 text-white",
      Rejected: "bg-red-500 text-white",
    };
    
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const getMethodDisplay = (method: WithdrawalRequest["method"]) => {
    const methods = {
      Crypto: "Cryptocurrency",
      MobileMoney: "Mobile Money",
      BankAccount: "Bank Transfer"
    };
    return methods[method];
  };

  const exportToCSV = () => {
    const headers = ["Amount", "Method", "Destination", "Status", "Created", "Completed"];
    const csvContent = [
      headers.join(","),
      ...filteredWithdrawals.map(w => [
        w.amount,
        getMethodDisplay(w.method),
        w.destination,
        w.status,
        new Date(w.created_at).toLocaleDateString(),
        w.updated_at ? new Date(w.updated_at).toLocaleDateString() : "N/A"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "withdrawal-history.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // Simple PDF export using browser print
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Withdrawal History</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              h1 { color: #333; }
            </style>
          </head>
          <body>
            <h1>Withdrawal History</h1>
            <table>
              <thead>
                <tr>
                  
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                ${filteredWithdrawals.map(w => `
                  <tr>
                    
                    <td>${w.amount}</td>
                    <td>${getMethodDisplay(w.method)}</td>
                    <td>${w.destination}</td>
                    <td>${w.status}</td>
                    <td>${new Date(w.created_at).toLocaleDateString()}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50 shadow-card">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Withdrawal History</span>
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={exportToPDF}>
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : paginatedWithdrawals.length > 0 ? (
                paginatedWithdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.payout_profile_id}> {/* Assuming payout_profile_id is unique for the list */}
                    <TableCell>KES {withdrawal.amount.toLocaleString()}</TableCell>
                    <TableCell>{getMethodDisplay(withdrawal.method)}</TableCell>
                    <TableCell className="max-w-32 truncate">{JSON.stringify(withdrawal.destination)}</TableCell>
                    <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                    <TableCell>{new Date(withdrawal.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No withdrawal requests found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    // href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      // href="#"
                      // asChild
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    // href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
