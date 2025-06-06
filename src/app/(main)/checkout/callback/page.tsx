import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { CheckoutCallback } from "@/components/checkout/CheckoutCallback";
import { Loader2 } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Payment Verification - Sasasasa",
  description: "Verifying your payment status and processing your booking.",
  robots: "noindex, nofollow",
};

export default function CheckoutCallbackPage() {
  return (
    <Suspense
      fallback={
        <Dialog open={true}>
          <DialogContent className="sm:max-w-[500px] bg-background border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Loading</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">
                Loading payment details...
              </p>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <CheckoutCallback />
    </Suspense>
  );
}
