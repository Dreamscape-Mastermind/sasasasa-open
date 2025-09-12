"use client";

import {
  AlertCircle,
  AlertTriangle,
  Ban,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Loader2,
  Mail,
  RefreshCw,
  Ticket,
  User,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentStatus, TransactionResult } from "@/types/payment";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

// Helper function to get status-specific information
const getStatusInfo = (status: PaymentStatus, amount: number = 0) => {
  switch (status) {
    case PaymentStatus.COMPLETED:
      return {
        icon: CheckCircle,
        title: amount === 0 ? "Free Tickets Confirmed" : "Order Confirmed",
        iconColor: "text-primary",
        iconBg: "bg-primary/10",
        statusColor: "text-primary",
        showEmailNotice: true,
      };
    case PaymentStatus.FAILED:
      return {
        icon: XCircle,
        title: "Payment Failed",
        iconColor: "text-destructive",
        iconBg: "bg-destructive/10",
        statusColor: "text-destructive",
        showEmailNotice: false,
      };
    case PaymentStatus.PENDING:
      return {
        icon: Clock,
        title: "Payment Pending",
        iconColor: "text-yellow-600 dark:text-yellow-400",
        iconBg: "bg-yellow-100 dark:bg-yellow-900/20",
        statusColor: "text-yellow-600 dark:text-yellow-400",
        showEmailNotice: false,
      };
    case PaymentStatus.PROCESSING:
      return {
        icon: Loader2,
        title: "Processing Payment",
        iconColor: "text-blue-600 dark:text-blue-400",
        iconBg: "bg-blue-100 dark:bg-blue-900/20",
        statusColor: "text-blue-600 dark:text-blue-400",
        showEmailNotice: false,
      };
    case PaymentStatus.REQUIRES_ACTION:
      return {
        icon: AlertCircle,
        title: "Action Required",
        iconColor: "text-orange-600 dark:text-orange-400",
        iconBg: "bg-orange-100 dark:bg-orange-900/20",
        statusColor: "text-orange-600 dark:text-orange-400",
        showEmailNotice: false,
      };
    case PaymentStatus.CANCELLED:
      return {
        icon: Ban,
        title: "Payment Cancelled",
        iconColor: "text-gray-600 dark:text-gray-400",
        iconBg: "bg-gray-100 dark:bg-gray-900/20",
        statusColor: "text-gray-600 dark:text-gray-400",
        showEmailNotice: false,
      };
    case PaymentStatus.REFUNDED:
      return {
        icon: RefreshCw,
        title: "Payment Refunded",
        iconColor: "text-purple-600 dark:text-purple-400",
        iconBg: "bg-purple-100 dark:bg-purple-900/20",
        statusColor: "text-purple-600 dark:text-purple-400",
        showEmailNotice: true,
      };
    case PaymentStatus.EXPIRED:
      return {
        icon: AlertTriangle,
        title: "Payment Expired",
        iconColor: "text-red-600 dark:text-red-400",
        iconBg: "bg-red-100 dark:bg-red-900/20",
        statusColor: "text-red-600 dark:text-red-400",
        showEmailNotice: false,
      };
    default:
      return {
        icon: AlertCircle,
        title: "Payment Status",
        iconColor: "text-muted-foreground",
        iconBg: "bg-muted/50",
        statusColor: "text-muted-foreground",
        showEmailNotice: false,
      };
  }
};

// Helper function to get status-specific message
const getStatusMessage = (status: PaymentStatus, amount: number = 0) => {
  switch (status) {
    case PaymentStatus.COMPLETED:
      if (amount === 0) {
        return "🎉 Congratulations! Your free tickets have been successfully reserved and confirmed. You're all set for the event!";
      }
      return "🎉 Congratulations! Your tickets have been successfully purchased and confirmed. You're all set for the event!";
    case PaymentStatus.FAILED:
      return "❌ We were unable to process your ticket purchase. Your tickets have not been reserved. Please try again or contact support if the issue persists.";
    case PaymentStatus.PENDING:
      return "⏳ Your ticket purchase is being verified. This may take a few minutes. Please keep this page open while we confirm your tickets.";
    case PaymentStatus.PROCESSING:
      return "🔄 Your ticket purchase is currently being processed. Please wait while we complete the transaction and reserve your tickets.";
    case PaymentStatus.REQUIRES_ACTION:
      return "⚠️ Additional action is required to complete your ticket purchase. Please follow the instructions provided by your payment provider.";
    case PaymentStatus.CANCELLED:
      return "🚫 Your ticket purchase was cancelled. No charges have been made to your account and no tickets have been reserved.";
    case PaymentStatus.REFUNDED:
      return "💸 Your ticket purchase has been refunded. The refund will appear in your account within 3-5 business days.";
    case PaymentStatus.EXPIRED:
      return "⏰ Your ticket purchase session has expired. Please initiate a new purchase to secure your tickets.";
    default:
      return "Please check your payment status and try again if needed.";
  }
};

// Helper function to get appropriate action buttons
const getActionButtons = (
  status: PaymentStatus,
  onClose: () => void,
  onPurchaseAgain?: () => void
) => {
  const buttons: React.ReactNode[] = [];

  // Add status-specific action buttons
  switch (status) {
    case PaymentStatus.FAILED:
    case PaymentStatus.CANCELLED:
    case PaymentStatus.EXPIRED:
      if (onPurchaseAgain) {
        buttons.push(
          <Button
            key="purchase-again"
            variant="outline"
            onClick={onPurchaseAgain}
            className="border-border text-foreground hover:bg-accent"
          >
            Try Again
          </Button>
        );
      }
      break;
    case PaymentStatus.REQUIRES_ACTION:
      if (onPurchaseAgain) {
        buttons.push(
          <Button
            key="complete-payment"
            onClick={onPurchaseAgain}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Complete Payment
          </Button>
        );
      }
      break;
    case PaymentStatus.PENDING:
    case PaymentStatus.PROCESSING:
      buttons.push(
        <Button
          key="refresh"
          variant="outline"
          onClick={() => window.location.reload()}
          className="border-border text-foreground hover:bg-accent"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      );
      break;
  }

  // Add close/continue button
  if (status === PaymentStatus.COMPLETED) {
    // For successful purchases, offer multiple navigation options
    buttons.push(
      <Button
        key="view-tickets"
        variant="outline"
        onClick={() => {
          // Navigate to user's tickets/dashboard
          window.location.href = ROUTES.DASHBOARD_PURCHASES;
        }}
        className="border-border text-foreground hover:bg-accent"
      >
        <Ticket className="h-4 w-4 mr-2" />
        View My Tickets
      </Button>
    );

    buttons.push(
      <Button
        key="continue"
        onClick={onClose}
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        Continue to Event
      </Button>
    );
  } else {
    // For other statuses, just show close button
    const closeButtonVariant =
      "bg-destructive hover:bg-destructive/90 text-destructive-foreground";
    buttons.push(
      <Button key="close" onClick={onClose} className={closeButtonVariant}>
        Close
      </Button>
    );
  }

  return buttons;
};

interface PaymentStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  loading?: boolean;
  transaction?: TransactionResult | null;
  onPurchaseAgain?: () => void;
}

export function PaymentStatusDialog({
  isOpen,
  onClose,
  loading = false,
  transaction = null,
  onPurchaseAgain,
}: PaymentStatusDialogProps) {
  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Verifying Payment
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Verifying your payment...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!transaction) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Payment Status
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">
              No transaction data available
            </p>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const statusInfo = getStatusInfo(transaction.status, transaction.amount);
  const StatusIcon = statusInfo.icon;
  const statusMessage = getStatusMessage(
    transaction.status,
    transaction.amount
  );
  const actionButtons = getActionButtons(
    transaction.status,
    onClose,
    onPurchaseAgain
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {statusInfo.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          {/* Status Icon */}
          <div
            className={`${statusInfo.iconColor} ${statusInfo.iconBg} p-3 rounded-full`}
          >
            <StatusIcon
              className={`h-8 w-8 ${
                transaction.status === PaymentStatus.PROCESSING
                  ? "animate-spin"
                  : ""
              }`}
            />
          </div>

          {/* Status-specific additional info */}
          {transaction.status === PaymentStatus.PENDING && (
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> Please do not close this window or
                navigate away while your payment is being processed.
              </p>
            </div>
          )}

          {transaction.status === PaymentStatus.REQUIRES_ACTION && (
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                <strong>Action Required:</strong> You may need to complete
                additional verification steps with your bank or payment provider
                to secure your tickets.
              </p>
            </div>
          )}

          {transaction.status === PaymentStatus.FAILED && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>Don't worry:</strong> Your tickets are still available.
                You can try purchasing again or contact support if you continue
                to experience issues.
              </p>
              {transaction.failureReason && (
                <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded border border-red-200 dark:border-red-700">
                  <p className="text-xs text-red-700 dark:text-red-300">
                    <strong>Reason:</strong>{" "}
                    {transaction.failureReason.replace(/_/g, " ").toLowerCase()}
                  </p>
                  {transaction.lastErrorMessage && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {transaction.lastErrorMessage}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Status Message */}
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">{statusMessage}</p>
            {transaction.message && transaction.message !== statusMessage && (
              <p className="text-sm text-muted-foreground">
                {transaction.message}
              </p>
            )}
          </div>

          {/* Email Notice for Completed/Refunded payments */}
          {statusInfo.showEmailNotice && (
            <div className="bg-primary/5 border border-primary/10 p-6 rounded-lg space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Mail className="h-5 w-5" />
                <h3 className="font-medium">Check Your Email</h3>
              </div>
              <p className="text-sm text-primary/90">
                {transaction.status === PaymentStatus.REFUNDED
                  ? "We've sent you a refund confirmation email with details about your ticket refund."
                  : "We've sent your ticket confirmation and QR codes to your email address. You'll need these for event entry. If you don't see it within a few minutes, please check your spam folder."}
              </p>
              {transaction.status === PaymentStatus.COMPLETED && (
                <div className="bg-background/50 p-3 rounded border border-primary/20">
                  <p className="text-xs text-primary/80 font-medium mb-1">
                    📱 Important:
                  </p>
                  <p className="text-xs text-primary/70">
                    Save your ticket QR codes to your phone or print them out.
                    You'll need them for entry at the event.
                  </p>
                </div>
              )}
              <p className="text-sm text-muted-foreground pt-2">
                Having issues? Contact us at{" "}
                <a
                  href="mailto:support@sasasasa.co"
                  className="text-primary hover:text-primary/80 font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  support@sasasasa.co
                </a>
              </p>
            </div>
          )}
          {transaction && (
            <div className="space-y-4 w-full">
              {/* Event Information */}
              {transaction.eventTitle && (
                <div className="border border-border rounded-lg p-4 space-y-3 bg-primary/5">
                  <div className="flex items-center gap-2 text-primary">
                    <Calendar className="h-4 w-4" />
                    <h3 className="font-medium">Event Details</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">
                        Event:
                      </span>
                      <span className="text-muted-foreground text-right truncate">
                        {transaction.eventTitle}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Information */}
              <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/50">
                <div className="flex items-center gap-2 text-foreground">
                  <CreditCard className="h-4 w-4" />
                  <h3 className="font-medium">Payment Details</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">
                      Payment Reference:
                    </span>
                    <span className="text-muted-foreground font-mono text-xs">
                      {transaction.reference || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {transaction.amount === 0 ? "Amount:" : "Amount Paid:"}
                    </span>
                    <span className="text-muted-foreground font-medium">
                      {transaction.amount === 0 ? (
                        <span className="text-green-600 dark:text-green-400 font-bold">
                          FREE
                        </span>
                      ) : (
                        `${
                          transaction.currency || "KES"
                        } ${transaction.amount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      )}
                    </span>
                  </div>
                  {transaction.paymentMethod && (
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">
                        Payment Method:
                      </span>
                      <span className="text-muted-foreground">
                        {transaction.paymentMethod}
                      </span>
                    </div>
                  )}
                  {transaction.provider && (
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">
                        Provider:
                      </span>
                      <span className="text-muted-foreground">
                        {transaction.provider}
                      </span>
                    </div>
                  )}
                  {transaction.providerStatus && (
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">
                        Provider Status:
                      </span>
                      <span className="text-muted-foreground">
                        {transaction.providerStatus}
                      </span>
                    </div>
                  )}
                  {transaction.providerReference && (
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">
                        Provider Reference:
                      </span>
                      <span className="text-muted-foreground font-mono text-xs">
                        {transaction.providerReference}
                      </span>
                    </div>
                  )}
                  {transaction.paystackDetails && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Card Details:
                      </p>
                      <div className="space-y-1">
                        {transaction.paystackDetails.last4 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Card:</span>
                            <span className="text-muted-foreground font-mono">
                              **** **** **** {transaction.paystackDetails.last4}
                            </span>
                          </div>
                        )}
                        {transaction.paystackDetails.bank && (
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Bank:</span>
                            <span className="text-muted-foreground">
                              {transaction.paystackDetails.bank}
                            </span>
                          </div>
                        )}
                        {transaction.paystackDetails.brand && (
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              Brand:
                            </span>
                            <span className="text-muted-foreground capitalize">
                              {transaction.paystackDetails.brand}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">Status:</span>
                    <span className={`${statusInfo.statusColor} font-medium`}>
                      {transaction.status}
                    </span>
                  </div>
                  {transaction.completedAt && (
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">
                        Completed At:
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(transaction.completedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {transaction.metadata &&
                    Object.keys(transaction.metadata).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Additional Info:
                        </p>
                        <div className="space-y-1">
                          {transaction.metadata.promotion_code && (
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">
                                Promo Code:
                              </span>
                              <span className="text-muted-foreground font-mono bg-primary/10 px-2 py-1 rounded">
                                {transaction.metadata.promotion_code}
                              </span>
                            </div>
                          )}
                          {transaction.metadata.free_ticket && (
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">
                                Type:
                              </span>
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                Free Ticket
                              </span>
                            </div>
                          )}
                          {transaction.metadata.refund_reason && (
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">
                                Refund Reason:
                              </span>
                              <span className="text-muted-foreground">
                                {transaction.metadata.refund_reason}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Ticket Information */}
              {transaction.ticketCount && transaction.ticketCount > 0 && (
                <div
                  className={`border border-border rounded-lg p-4 space-y-3 ${
                    transaction.status === PaymentStatus.COMPLETED
                      ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                      : "bg-muted/50"
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 ${
                      transaction.status === PaymentStatus.COMPLETED
                        ? "text-green-700 dark:text-green-400"
                        : "text-foreground"
                    }`}
                  >
                    <Ticket className="h-4 w-4" />
                    <h3 className="font-medium">
                      {transaction.status === PaymentStatus.COMPLETED
                        ? "🎫 Your Tickets"
                        : "Ticket Information"}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">
                        Total Tickets:
                      </span>
                      <span className="text-muted-foreground font-medium">
                        {transaction.ticketCount}
                      </span>
                    </div>
                    {transaction.ticketTypes &&
                      transaction.ticketTypes.length > 0 && (
                        <div className="space-y-1">
                          <span className="font-medium text-foreground text-sm">
                            Ticket Types:
                          </span>
                          <div className="space-y-1">
                            {transaction.ticketTypes.map((ticket, index) => (
                              <div
                                key={ticket.id || index}
                                className="flex justify-between text-xs bg-background/50 rounded p-2"
                              >
                                <span className="text-muted-foreground">
                                  {ticket.name}
                                </span>
                                <span className="text-muted-foreground font-mono">
                                  {ticket.currency || "KES"}{" "}
                                  {parseFloat(ticket.price).toLocaleString(
                                    "en-US",
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Customer Information */}
              {(transaction.customerName || transaction.customerEmail) && (
                <div className="border border-border rounded-lg p-4 space-y-3 bg-blue-50 dark:bg-blue-950/20">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <User className="h-4 w-4" />
                    <h3 className="font-medium">Customer Information</h3>
                  </div>
                  <div className="space-y-2">
                    {transaction.customerName && (
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-foreground">
                          Name:
                        </span>
                        <span className="text-muted-foreground">
                          {transaction.customerName}
                        </span>
                      </div>
                    )}
                    {transaction.customerEmail && (
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-foreground">
                          Email:
                        </span>
                        <span className="text-muted-foreground">
                          {transaction.customerEmail}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-4 pt-2">
                {actionButtons}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
