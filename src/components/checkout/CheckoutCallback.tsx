"use client";

import { useEffect, useState } from "react";

import { PaymentStatusDialog } from "./PaymentStatusDialog";
import { useAnalytics } from "@/hooks/useAnalytics";
import { usePaymentVerification } from "@/hooks/usePaymentVerification";
import { useRouter } from "next/navigation";
import { useSearchParamsContext } from "@/providers/SearchParamsProvider";

export function CheckoutCallback({
  reference,
  trxref,
}: {
  reference: string;
  trxref: string;
}) {
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
      verifyPayment(reference, trxref);
    }
    if (!reference && searchReference) {
      verifyPayment(searchReference, trxref);
    }
  }, [reference]);

  const handleClose = () => {
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
