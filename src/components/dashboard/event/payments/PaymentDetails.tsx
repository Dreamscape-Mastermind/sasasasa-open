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
                KSH.{payment.amount} {payment.currency}
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
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
              {JSON.stringify(payment.metadata, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
