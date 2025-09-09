import { PaymentStatus, TransactionResult } from "@/types/payment";

import { useAnalytics } from "@/hooks/useAnalytics";
import { useLogger } from "@/hooks/useLogger";
import { usePayment } from "@/hooks/usePayment";
import { useState } from "react";

interface UsePaymentVerificationProps {
  context?: string;
  onSuccess?: (result: TransactionResult) => void;
  onError?: (error: Error) => void;
}

export function usePaymentVerification({
  context = "PaymentVerification",
  onSuccess,
  onError,
}: UsePaymentVerificationProps = {}) {
  const analytics = useAnalytics();
  const { trackEvent } = analytics;
  const { useVerifyPayment } = usePayment();
  const verifyPaymentMutation = useVerifyPayment();
  const [transaction, setTransaction] = useState<TransactionResult | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const logger = useLogger({ context });

  const verifyPayment = async (reference, trxref) => {
    if (!reference) {
      const error = new Error("Invalid payment reference");
      setTransaction({
        status: PaymentStatus.FAILED,
        message: error.message,
        reference: "",
        amount: 0,
      });
      setLoading(false);
      onError?.(error);
      return;
    }

    try {
      const apiResponse = await verifyPaymentMutation.mutateAsync({
        reference,
        trxref,
      });

      // Parse the API response structure
      // Handle both wrapped and direct API responses
      let paymentData: any;
      let apiStatus: string;
      let apiMessage: string;

      if (apiResponse.result) {
        // Wrapped response from service
        paymentData = apiResponse.result;
        apiStatus = apiResponse.status;
        apiMessage = apiResponse.message;
      } else {
        // Direct API response structure
        paymentData = apiResponse;
        apiStatus = apiResponse.status;
        apiMessage = apiResponse.message;
      }

      if (paymentData?.status === PaymentStatus.COMPLETED) {
        const successResult: TransactionResult = {
          status: paymentData.status,
          message: apiMessage || "Payment completed successfully",
          reference: paymentData.reference,
          amount: parseFloat(paymentData.amount.toString()),
          currency: paymentData.currency,
          paymentMethod: paymentData.payment_method || undefined,
          providerStatus: paymentData.provider_status || undefined,
          customerName:
            paymentData.customer_first_name && paymentData.customer_last_name
              ? `${paymentData.customer_first_name} ${paymentData.customer_last_name}`
              : paymentData.customer_first_name ||
                paymentData.customer_last_name ||
                undefined,
          customerEmail: paymentData.customer_email || undefined,
          ticketCount: paymentData.metadata?.ticket_count,
          ticketTypes: paymentData.metadata?.ticket_types,
          completedAt: paymentData.completed_at || undefined,
          provider: paymentData.provider,
          eventId: paymentData.metadata?.event?.id,
          eventTitle: paymentData.metadata?.event?.title,
        };

        setTransaction(successResult);
        // Send successful payment event
        trackEvent({
          event: "purchase",
          value: parseFloat(paymentData.amount.toString()),
          transaction_id: paymentData.reference,
          status: "completed",
        });
        logger.info("Purchase complete", {
          id: paymentData.reference,
          amount: paymentData.amount,
        });
        onSuccess?.(successResult);
      } else {
        const failedResult: TransactionResult = {
          status: paymentData?.status || PaymentStatus.FAILED,
          message:
            apiMessage ||
            paymentData?.last_error_message ||
            "Payment verification failed",
          reference: paymentData?.reference || reference || "",
          amount: paymentData ? parseFloat(paymentData.amount.toString()) : 0,
          currency: paymentData?.currency,
          paymentMethod: paymentData?.payment_method || undefined,
          providerStatus: paymentData?.provider_status || undefined,
          customerName:
            paymentData?.customer_first_name && paymentData?.customer_last_name
              ? `${paymentData.customer_first_name} ${paymentData.customer_last_name}`
              : paymentData?.customer_first_name ||
                paymentData?.customer_last_name ||
                undefined,
          customerEmail: paymentData?.customer_email || undefined,
          ticketCount: paymentData?.metadata?.ticket_count,
          ticketTypes: paymentData?.metadata?.ticket_types,
          completedAt: paymentData?.completed_at || undefined,
          provider: paymentData?.provider,
          eventId: paymentData?.metadata?.event?.id,
          eventTitle: paymentData?.metadata?.event?.title,
        };

        setTransaction(failedResult);
        // Send failed payment event
        trackEvent({
          event: "purchase_failed",
          value: paymentData ? parseFloat(paymentData.amount.toString()) : 0,
          transaction_id: paymentData?.reference || reference || "",
          status: paymentData?.status || PaymentStatus.FAILED,
          error_message:
            apiMessage ||
            paymentData?.last_error_message ||
            "Payment verification failed",
        });
        logger.error("Purchase failed", {
          id: paymentData?.reference || reference,
          amount: paymentData ? parseFloat(paymentData.amount.toString()) : 0,
          status: paymentData?.status || PaymentStatus.FAILED,
          error:
            apiMessage ||
            paymentData?.last_error_message ||
            "Payment verification failed",
        });
        onError?.(new Error(failedResult.message));
      }
    } catch (error) {
      const errorResult: TransactionResult = {
        status: PaymentStatus.FAILED,
        message:
          error instanceof Error ? error.message : "Failed to verify payment",
        reference: reference || "",
        amount: 0,
      };

      setTransaction(errorResult);
      // Send error event
      trackEvent({
        event: "purchase_error",
        error_message:
          error instanceof Error ? error.message : "Failed to verify payment",
        transaction_id: reference || "",
      });
      logger.error("Payment verification failed", {
        error:
          error instanceof Error ? error.message : "Failed to verify payment",
        reference: reference || "",
      });
      onError?.(
        error instanceof Error ? error : new Error("Failed to verify payment")
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    transaction,
    loading,
    verifyPayment,
  };
}
