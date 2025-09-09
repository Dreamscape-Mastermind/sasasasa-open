"use client";

import {
  Calendar,
  CheckCircle,
  CreditCard,
  Loader2,
  Mail,
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
      <Dialog open={isOpen} onOpenChange={() => {}}>
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

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {transaction?.status === PaymentStatus.COMPLETED
              ? "Order Confirmed"
              : "Payment Failed"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          {transaction?.status === PaymentStatus.COMPLETED ? (
            <div className="text-primary bg-primary/10 p-3 rounded-full">
              <CheckCircle className="h-8 w-8" />
            </div>
          ) : (
            <div className="text-destructive bg-destructive/10 p-3 rounded-full">
              <XCircle className="h-8 w-8" />
            </div>
          )}

          {transaction?.status === PaymentStatus.COMPLETED && (
            <div className="bg-primary/5 border border-primary/10 p-6 rounded-lg space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Mail className="h-5 w-5" />
                <h3 className="font-medium">Check Your Email</h3>
              </div>
              <p className="text-sm text-primary/90">
                We've sent your ticket details and booking confirmation to your
                email address. If you don't see it within a few minutes, please
                check your spam folder.
              </p>
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
                      Amount Paid:
                    </span>
                    <span className="text-muted-foreground font-medium">
                      {transaction.currency || "KES"}{" "}
                      {transaction.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
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
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">Status:</span>
                    <span
                      className={
                        transaction.status === PaymentStatus.COMPLETED
                          ? "text-primary font-medium"
                          : "text-destructive font-medium"
                      }
                    >
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
                </div>
              </div>

              {/* Ticket Information */}
              {transaction.ticketCount && transaction.ticketCount > 0 && (
                <div className="border border-border rounded-lg p-4 space-y-3 bg-green-50 dark:bg-green-950/20">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <Ticket className="h-4 w-4" />
                    <h3 className="font-medium">Ticket Information</h3>
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

              <p className="text-center text-sm text-muted-foreground">
                {transaction.message}
              </p>

              <div className="flex justify-center gap-4 pt-2">
                {transaction.status !== PaymentStatus.COMPLETED &&
                  onPurchaseAgain && (
                    <Button
                      variant="outline"
                      onClick={onPurchaseAgain}
                      className="border-border text-foreground hover:bg-accent"
                    >
                      Purchase Again
                    </Button>
                  )}
                <Button
                  onClick={onClose}
                  className={
                    transaction.status === PaymentStatus.COMPLETED
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  }
                >
                  {transaction.status === PaymentStatus.COMPLETED
                    ? "Continue to Event"
                    : "Cancel"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
