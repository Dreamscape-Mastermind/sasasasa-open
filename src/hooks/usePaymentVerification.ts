import { PaymentStatus } from "@/types/payment";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLogger } from "@/hooks/useLogger";
import { usePayment } from "@/hooks/usePayment";
import { useState } from "react";

interface TransactionResult {
  status: PaymentStatus;
  message: string;
  reference: string;
  amount: number;
}

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

  const verifyPayment = async (reference: string) => {
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
      const result = await verifyPaymentMutation.mutateAsync({
        reference,
      });

      if (result.result?.status === PaymentStatus.COMPLETED) {
        const successResult = {
          status: result.result?.status,
          message:
            result.result?.last_error_message ||
            "Payment completed successfully",
          reference: result.result?.reference,
          amount: result.result?.amount,
        };

        setTransaction(successResult);
        // Send successful payment event
        trackEvent({
          event: "purchase",
          value: result.result?.amount,
          transaction_id: result.result?.reference,
          status: "completed",
        });
        logger.info("Purchase complete", {
          id: result.result?.reference,
          amount: result.result?.amount,
        });
        onSuccess?.(successResult);
      } else {
        const failedResult = {
          status: result.result?.status || PaymentStatus.FAILED,
          message:
            result.result?.last_error_message || "Payment verification failed",
          reference: result.result?.reference || reference || "",
          amount: result.result?.amount || 0,
        };

        setTransaction(failedResult);
        // Send failed payment event
        trackEvent({
          event: "purchase_failed",
          value: result.result?.amount || 0,
          transaction_id: result.result?.reference || reference || "",
          status: result.result?.status || PaymentStatus.FAILED,
          error_message:
            result.result?.last_error_message || "Payment verification failed",
        });
        logger.error("Purchase failed", {
          id: result.result?.reference || reference,
          amount: result.result?.amount || 0,
          status: result.result?.status || PaymentStatus.FAILED,
          error:
            result.result?.last_error_message || "Payment verification failed",
        });
        onError?.(new Error(failedResult.message));
      }
    } catch (error) {
      const errorResult = {
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
