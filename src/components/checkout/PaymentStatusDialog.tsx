"use client";

import { CheckCircle, Loader2, Mail, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { PaymentStatus } from "@/types/payment";

interface PaymentStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  loading?: boolean;
  transaction?: {
    status: PaymentStatus;
    message: string;
    reference: string;
    amount: number;
  } | null;
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
        <DialogContent className="sm:max-w-[500px] bg-background border-border">
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {transaction?.status === PaymentStatus.COMPLETED
              ? "Booking Confirmed!"
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

          {transaction && (
            <div className="space-y-4 w-full">
              <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/50">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">
                      Payment Reference:
                    </span>
                    <span className="text-muted-foreground">
                      {transaction.reference || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">
                      Amount Paid:
                    </span>
                    <span className="text-muted-foreground">
                      {transaction.amount > 0
                        ? `KES ${transaction.amount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : "Amount pending verification"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">Status:</span>
                    <span
                      className={
                        transaction.status === PaymentStatus.COMPLETED
                          ? "text-primary"
                          : "text-destructive"
                      }
                    >
                      {transaction.status}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                {transaction.message}
              </p>

              {transaction.status === PaymentStatus.COMPLETED && (
                <div className="bg-primary/5 border border-primary/10 p-6 rounded-lg space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Mail className="h-5 w-5" />
                    <h3 className="font-medium">Check Your Email</h3>
                  </div>
                  <p className="text-sm text-primary/90">
                    We've sent your ticket details and booking confirmation to
                    your email address. If you don't see it within a few
                    minutes, please check your spam folder.
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
