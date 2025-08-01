"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PaymentStatus } from "@/types/payment";
import { PaymentStatusDialog } from "./PaymentStatusDialog";
import { useAnalytics } from "@/hooks/useAnalytics";
import { usePaymentVerification } from "@/hooks/usePaymentVerification";
import { useSearchParamsContext } from "@/providers/SearchParamsProvider";

export function CheckoutCallback({ reference }: { reference: string }) {
  const analytics = useAnalytics();
  const { trackEvent } = analytics;
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const { searchParams } = useSearchParamsContext();
  const searchReference = searchParams.get("reference");

  const { transaction, loading, verifyPayment } = usePaymentVerification({
    context: "CheckoutCallback",
    onSuccess: (result) => {
      trackEvent({
        event: "checkout_callback_success",
        timestamp: new Date().toISOString(),
        reference: result.reference,
      });
    },
    onError: (error) => {
      trackEvent({
        event: "checkout_callback_error",
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    },
  });

  useEffect(() => {
    trackEvent({
      event: "checkout_callback_view",
      timestamp: new Date().toISOString(),
    });

    if (reference) {
      verifyPayment(reference);
    }
    if (!reference && searchReference) {
      verifyPayment(searchReference);
    }
  }, [reference]);

  const handleClose = () => {
    const status =
      transaction?.status === PaymentStatus.COMPLETED ? "success" : "failed";
    router.push(`/e/${localStorage.getItem("paidEventSlug")}`);
  };

  return (
    <PaymentStatusDialog
      isOpen={isOpen}
      onClose={handleClose}
      loading={loading}
      transaction={transaction}
      onPurchaseAgain={handleClose}
    />
  );
}
