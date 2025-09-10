"use client";

import { ArrowLeft, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaymentStatus } from "@/types/payment";
import { format } from "date-fns";
import { usePayment } from "@/hooks/usePayment";

interface PaymentDetailsProps {
  paymentId: string;
  onBack?: () => void;
}

export function PaymentDetails({ paymentId, onBack }: PaymentDetailsProps) {
  const {
    usePayment: usePaymentQuery,
    useRetryPayment,
    useRefundPayment,
  } = usePayment();

  const {
    data: paymentResponse,
    isLoading,
    error,
  } = usePaymentQuery(paymentId);
  const retryPayment = useRetryPayment();
  const refundPayment = useRefundPayment();

  const payment = paymentResponse?.result;

  const getStatusBadgeVariant = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return "default";
      case PaymentStatus.PENDING:
      case PaymentStatus.PROCESSING:
        return "secondary";
      case PaymentStatus.FAILED:
      case PaymentStatus.CANCELLED:
        return "destructive";
      case PaymentStatus.REFUNDED:
        return "outline";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy 'at' HH:mm");
    } catch {
      return dateString;
    }
  };

  const handleRetry = () => {
    retryPayment.mutate(paymentId);
  };

  const handleRefund = () => {
    // TODO: Implement refund modal/form
    console.log("Refund payment:", paymentId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading payment details...</div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-destructive">Failed to load payment details</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        <div>
          <h1 className="text-3xl font-bold">Payment Details</h1>
          <p className="text-muted-foreground">
            Reference: {payment.reference}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={getStatusBadgeVariant(payment.status)}>
                {payment.status.toLowerCase()}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">
                KES.{payment.amount} {payment.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Provider:</span>
              <span className="font-medium">{payment.provider}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span className="font-medium">
                {formatDate(payment.created_at)}
              </span>
            </div>
            {payment.completed_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed:</span>
                <span className="font-medium">
                  {formatDate(payment.completed_at)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {payment.status === PaymentStatus.FAILED && (
              <Button
                onClick={handleRetry}
                disabled={retryPayment.isPending}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {retryPayment.isPending ? "Retrying..." : "Retry Payment"}
              </Button>
            )}
            {payment.status === PaymentStatus.COMPLETED && (
              <Button
                onClick={handleRefund}
                variant="outline"
                className="w-full"
              >
                Refund Payment
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {payment.metadata && Object.keys(payment.metadata).length > 0 && (
        <div className="space-y-6">
          {/* Event Information Card */}
          {payment.metadata.event && (
            <Card>
              <CardHeader>
                <CardTitle>Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground">Event Title:</span>
                  <span className="font-medium text-right max-w-[60%]">
                    {payment.metadata.event.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Event ID:</span>
                  <span className="font-mono text-sm text-muted-foreground">
                    {payment.metadata.event.id}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ticket Information Card */}
          {payment.metadata.ticket_types &&
            payment.metadata.ticket_types.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Ticket Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Total Tickets:
                    </span>
                    <span className="font-medium">
                      {payment.metadata.ticket_count}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <span className="text-muted-foreground text-sm">
                      Ticket Types:
                    </span>
                    {payment.metadata.ticket_types.map(
                      (ticket: any, index: number) => (
                        <div key={index} className="bg-muted p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{ticket.name}</span>
                            <span className="text-sm text-muted-foreground">
                              KES {ticket.price}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            ID: {ticket.id}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Payment Provider Details Card */}
          {payment.metadata.paystack_response && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Provider Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Channel:</span>
                      <span className="font-medium capitalize">
                        {payment.metadata.paystack_response.channel?.replace(
                          "_",
                          " "
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge
                        variant={
                          payment.metadata.paystack_response.status ===
                          "success"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {payment.metadata.paystack_response.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Gateway Response:
                      </span>
                      <span className="font-medium">
                        {payment.metadata.paystack_response.gateway_response}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fees:</span>
                      <span className="font-medium">
                        KES{" "}
                        {(
                          payment.metadata.paystack_response.fees / 100
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">
                        KES{" "}
                        {(
                          payment.metadata.paystack_response.amount / 100
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Currency:</span>
                      <span className="font-medium">
                        {payment.metadata.paystack_response.currency}
                      </span>
                    </div>
                  </div>
                </div>

                {payment.metadata.paystack_response.paid_at && (
                  <div className="pt-4 border-t">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Paid At:</span>
                      <span className="font-medium">
                        {formatDate(payment.metadata.paystack_response.paid_at)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Customer Information Card */}
          {payment.metadata.paystack_response?.customer && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium text-right max-w-[60%] break-all">
                        {payment.metadata.paystack_response.customer.email}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Customer Code:
                      </span>
                      <span className="font-mono text-sm text-muted-foreground">
                        {
                          payment.metadata.paystack_response.customer
                            .customer_code
                        }
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Customer ID:
                      </span>
                      <span className="font-medium">
                        {payment.metadata.paystack_response.customer.id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Risk Action:
                      </span>
                      <span className="font-medium capitalize">
                        {
                          payment.metadata.paystack_response.customer
                            .risk_action
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Log Information */}
          {payment.metadata.paystack_response?.log && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Log</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex justify-between md:flex-col md:gap-1">
                    <span className="text-muted-foreground">Attempts:</span>
                    <span className="font-medium">
                      {payment.metadata.paystack_response.log.attempts}
                    </span>
                  </div>
                  <div className="flex justify-between md:flex-col md:gap-1">
                    <span className="text-muted-foreground">Errors:</span>
                    <span className="font-medium">
                      {payment.metadata.paystack_response.log.errors}
                    </span>
                  </div>
                  <div className="flex justify-between md:flex-col md:gap-1">
                    <span className="text-muted-foreground">Success:</span>
                    <Badge
                      variant={
                        payment.metadata.paystack_response.log.success
                          ? "default"
                          : "destructive"
                      }
                    >
                      {payment.metadata.paystack_response.log.success
                        ? "Yes"
                        : "No"}
                    </Badge>
                  </div>
                </div>

                {payment.metadata.paystack_response.log.history &&
                  payment.metadata.paystack_response.log.history.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-muted-foreground text-sm">
                        History:
                      </span>
                      <div className="space-y-2">
                        {payment.metadata.paystack_response.log.history.map(
                          (entry: any, index: number) => (
                            <div
                              key={index}
                              className="bg-muted p-3 rounded-lg"
                            >
                              <div className="flex justify-between items-start">
                                <span className="font-medium text-sm">
                                  {entry.message}
                                </span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {entry.time}s
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground capitalize">
                                {entry.type}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}

          {/* Last Status Check */}
          {payment.metadata.last_status_check && (
            <Card>
              <CardHeader>
                <CardTitle>Status Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Last Status Check:
                  </span>
                  <span className="font-medium">
                    {formatDate(payment.metadata.last_status_check)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
