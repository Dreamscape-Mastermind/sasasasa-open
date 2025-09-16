import { ChevronRight, Info, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentProvider, PaymentStatus } from "@/types/payment";
import {
  TicketPurchaseErrorType,
  getResponseAction,
  handlePurchaseError,
  handlePurchaseSuccess,
  handleTicketPurchaseResponse,
  isImmediateSuccess,
  requiresPaymentRedirect,
} from "@/lib/ticketPurchaseHandler";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentStatusDialog } from "@/components/checkout/PaymentStatusDialog";
import { PurchaseErrorDisplay } from "./PurchaseErrorDisplay";
import { TicketType } from "@/types/ticket";
import { isFlashSaleValid } from "@/lib/utils";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useForm } from "react-hook-form";
import { useLogger } from "@/hooks/useLogger";
import { usePaymentVerification } from "@/hooks/usePaymentVerification";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTicket } from "@/hooks/useTicket";

interface EventCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  tickets: (TicketType & { quantity: number })[];
  slug: string;
}

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  discountCode: string;
};

type CheckoutStep = "details" | "payment" | "processing" | "success" | "error";

const SUPPORT_EMAIL = "support@sasasasa.co";

export function EventCheckout({
  isOpen,
  onClose,
  total,
  tickets,
  slug,
}: EventCheckoutProps) {
  const router = useRouter();
  const analytics = useAnalytics();
  const { usePurchaseTickets } = useTicket();
  const purchaseTickets = usePurchaseTickets(
    tickets.length > 0 ? tickets[0].event : ""
  );
  const logger = useLogger({ context: "EventCheckout" });
  const [step, setStep] = useState<CheckoutStep>("details");
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<TicketPurchaseErrorType | null>(
    null
  );
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const { transaction } = usePaymentVerification();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const hasValidFlashSale = (): boolean => {
    return tickets.some(
      (ticket) => ticket.flash_sale && isFlashSaleValid(ticket.flash_sale)
    );
  };

  const onSubmit = async (data: FormData) => {
    if (!data || !data.email) {
      logger.error("Missing required form data", { formData: data });
      setError("Please fill in all required fields");
      setStep("error");
      return;
    }

    if (!tickets || tickets.length === 0) {
      logger.error("No valid tickets in cart", { tickets });
      setError("No valid tickets selected");
      setStep("error");
      return;
    }

    setStep("processing");
    const payload = {
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      discount_code: data.discountCode || null,
      tickets: tickets.map((ticket) => ({
        ticket_type_id: ticket.id,
        quantity: ticket.quantity,
      })),
      provider: "PAYSTACK",
    };

    try {
      analytics.trackEvent({
        event: "checkout_attempt",
        email: data.email,
        total: total,
        ticket_count: tickets.reduce((sum, t) => sum + t.quantity, 0),
        flash_sales: tickets
          .filter((t) => t.flash_sale && isFlashSaleValid(t.flash_sale))
          .map((t) => ({
            ticket_id: t.id,
            flash_sale_id: t.flash_sale?.id,
            discount_type: t.flash_sale?.discount_type,
            discount_amount: t.flash_sale?.discount_amount,
          })),
      });

      const result = await purchaseTickets.mutateAsync(payload);
      const response = handleTicketPurchaseResponse(result);
      const action = getResponseAction(result);

      // Save event slug to cache for all successful purchases
      if (response.success) {
        localStorage.setItem("paidEventSlug", slug);
      }

      if (response.success) {
        const {
          ticketType,
          redirectType,
          paymentReference,
          authorizationUrl,
          message,
          isFree,
          isBalanceOnly,
          isPartialBalance,
          isPaid,
        } = response as ReturnType<typeof handlePurchaseSuccess>;

        logger.info("Ticket purchase successful", {
          ticketType,
          redirectType,
          reference: paymentReference,
          isFree,
          isBalanceOnly,
          isPartialBalance,
          isPaid,
        });

        // Track success analytics
        analytics.trackEvent({
          event: "ticket_purchase_success",
          ticket_type: ticketType,
          reference: paymentReference,
          ticket_count: tickets.reduce((sum, t) => sum + t.quantity, 0),
          total_amount: total,
          is_free: isFree,
          is_balance_only: isBalanceOnly,
          is_partial_balance: isPartialBalance,
        });

        if (isImmediateSuccess(ticketType, redirectType)) {
          // Handle immediate success (free tickets or balance-only payments)
          const checkout_url = `/checkout/callback?trxref=${paymentReference}&reference=${paymentReference}`;

          logger.info("Immediate ticket purchase success", {
            reference: paymentReference,
            checkout_url,
            message,
          });

          // Redirect to checkout success page
          if (typeof window !== "undefined") {
            router.push(checkout_url);
          }
          return;
        }

        if (requiresPaymentRedirect(ticketType, redirectType)) {
          // Handle payment provider redirect
          if (!authorizationUrl) {
            throw new Error("No payment URL found for paid tickets");
          }

          logger.info("Payment provider redirect", {
            email: data.email,
            total,
            paymentUrl: authorizationUrl,
            reference: paymentReference,
            ticketType,
            step: "payment_redirect",
          });

          // Redirect to payment provider
          if (typeof window !== "undefined") {
            window.location.assign(authorizationUrl);
          }
          return;
        }

        // Fallback error for unsupported response types
        throw new Error(`Unsupported response: ${ticketType}/${redirectType}`);
      } else {
        // Handle error response
        const {
          errorType,
          message,
          detail,
          isValidationError,
          isInventoryError,
          isPaymentError,
          isBusinessLogicError,
        } = response as ReturnType<typeof handlePurchaseError>;

        logger.error("Ticket purchase failed", {
          errorType,
          message,
          detail:
            typeof detail === "string"
              ? detail
              : Array.isArray(detail)
              ? detail.join(", ")
              : "No details",
          payload,
          total,
          step,
          isValidationError,
          isInventoryError,
          isPaymentError,
          isBusinessLogicError,
        });

        analytics.trackEvent({
          event: "ticket_purchase_error",
          error_type: errorType,
          error_message: message,
          email: data.email,
          total: total,
          is_validation_error: isValidationError,
          is_inventory_error: isInventoryError,
          is_payment_error: isPaymentError,
          is_business_logic_error: isBusinessLogicError,
        });

        setStep("error");
        setError(message);
        setErrorType(errorType);
        setErrorDetail(
          typeof detail === "string"
            ? detail
            : Array.isArray(detail)
            ? detail[0] || null
            : null
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      const errorStack = err instanceof Error ? err.stack : undefined;

      logger.error("Checkout error", {
        error: errorMessage,
        stack: errorStack,
        payload,
        total,
        step,
        errorType: errorType || "general",
      });

      analytics.trackEvent({
        event: "checkout_error",
        error: err instanceof Error ? err.message : "Unknown error",
        email: data.email,
        total: total,
      });

      setStep("error");
      setError(
        err instanceof Error
          ? `${err.message}. Please try again or contact support if the problem persists.`
          : "Failed to process ticket purchase. Please try again."
      );
      setErrorType("general");
      setErrorDetail(
        err instanceof Error ? err.message : "Unknown error occurred"
      );
    }
  };

  const renderStep = () => {
    switch (step) {
      case "details":
        return (
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-4">
                {tickets.map((ticket, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-medium">{ticket.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {ticket.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          KES{" "}
                          {(parseFloat(ticket.price) * ticket.quantity).toFixed(
                            2
                          )}
                        </div>
                        {ticket.flash_sale &&
                          isFlashSaleValid(ticket.flash_sale) && (
                            <div className="text-sm text-green-600 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              <span>
                                {ticket.flash_sale.discount_type ===
                                "PERCENTAGE"
                                  ? `${ticket.flash_sale.discount_amount}% OFF`
                                  : `KES ${ticket.flash_sale.discount_amount} OFF`}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Subtotal</span>
                    <span>KES {total.toFixed(2)}</span>
                  </div>
                  {hasValidFlashSale() && (
                    <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      <span>
                        Flash sale savings will be applied at checkout
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Customer Details</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <Input
                      {...register("firstName", { required: true })}
                      className={errors.firstName ? "border-red-500" : ""}
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <span className="text-xs text-red-500">Required</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <Input
                      {...register("lastName", { required: true })}
                      className={errors.lastName ? "border-red-500" : ""}
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <span className="text-xs text-red-500">Required</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    {...register("email", {
                      required: true,
                      pattern: /^\S+@\S+$/i,
                    })}
                    className={errors.email ? "border-red-500" : ""}
                    placeholder="john.doe@example.com"
                  />
                  {errors.email && (
                    <span className="text-xs text-red-500">
                      Valid email required
                    </span>
                  )}
                </div>

                {!hasValidFlashSale() && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Discount Code{" "}
                      <span className="text-muted-foreground">(Optional)</span>
                    </label>
                    <Input
                      {...register("discountCode")}
                      placeholder="Enter code"
                    />
                  </div>
                )}

                {hasValidFlashSale() && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <span>
                      Discount codes are available after the flash sale expires.
                    </span>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full">
                Continue to Payment
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Having trouble? Contact{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-primary hover:underline"
                >
                  {SUPPORT_EMAIL}
                </a>
              </p>
            </form>
          </div>
        );

      case "processing":
        return (
          <PaymentStatusDialog isOpen={true} onClose={onClose} loading={true} />
        );

      case "error":
        return (
          <div className="space-y-4">
            {errorType && error ? (
              <PurchaseErrorDisplay
                errorType={errorType}
                message={error}
                detail={errorDetail || undefined}
                onRetry={() => setStep("details")}
                onClose={onClose}
              />
            ) : (
              <PaymentStatusDialog
                isOpen={true}
                onClose={onClose}
                transaction={
                  transaction
                    ? transaction
                    : {
                        id: "",
                        status: PaymentStatus.FAILED,
                        message: error || "Payment failed",
                        reference: "",
                        amount: 0,
                        currency: "KES",
                        provider: PaymentProvider.PAYSTACK,
                        providerReference: "",
                        createdAt: new Date().toISOString(),
                        attempts: 1,
                        requiresAction: false,
                      }
                }
                onPurchaseAgain={() => setStep("details")}
              />
            )}
          </div>
        );

      case "success":
        return (
          <PaymentStatusDialog
            isOpen={true}
            onClose={onClose}
            transaction={
              transaction
                ? transaction
                : {
                    id: "",
                    status: PaymentStatus.COMPLETED,
                    message: "Your tickets have been purchased successfully",
                    reference: "",
                    amount: total,
                    currency: "KES",
                    provider: PaymentProvider.PAYSTACK,
                    providerReference: "",
                    createdAt: new Date().toISOString(),
                    attempts: 1,
                    requiresAction: false,
                  }
            }
          />
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Checkout</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto">{renderStep()}</div>
      </DialogContent>
    </Dialog>
  );
}
