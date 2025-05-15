"use client";

import { ChevronRight, Info, Loader2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TicketPurchaseItem,
  TicketPurchaseRequest,
  TicketType,
  TicketTypeWithFlashSale,
} from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isFlashSaleValid } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { useForm } from "react-hook-form";
import { useLogger } from "@/lib/hooks/useLogger";
import { usePurchaseTickets } from "@/lib/hooks/useTickets";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useVerifyPayment } from "@/lib/hooks/usePayments";

// TODO limit checkout to 10 tickets
// TODO make page title dynamic and based on event

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  tickets: TicketType[];
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

// Helper function to log events to the server
const logEvent = async (eventName: string, eventData: any) => {
  try {
    await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: eventName,
        data: {
          ...eventData,
          timestamp: new Date().toISOString(),
        },
      }),
    });
  } catch (error) {
    console.error("Failed to log event:", error);
  }
};

// Add this helper function
const hasValidFlashSale = (tickets: TicketType[]): boolean => {
  return tickets.some(
    (ticket) =>
      ticket.flash_sale &&
      isFlashSaleValid(ticket.flash_sale as TicketTypeWithFlashSale | null)
  );
};

export function Checkout({
  isOpen,
  onClose,
  total,
  tickets,
  slug,
}: CheckoutProps) {
  const router = useRouter();
  const logger = useLogger({ context: "Checkout" });
  const [step, setStep] = useState<CheckoutStep>("details");
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use the purchase tickets hook
  const { mutateAsync: purchaseTickets, isPending } = usePurchaseTickets(
    tickets.length > 0 ? tickets[0].event : ""
  );

  // Use the verify payment hook
  const { mutateAsync: verifyPayment } = useVerifyPayment();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const filteredTickets = tickets
    .filter((ticket) => {
      const qty = ticket.quantity
        ? parseInt(ticket.quantity.toString(), 10)
        : 0;
      return !isNaN(qty) && qty > 0;
    })
    .map((ticket) => ({
      ...ticket,
      quantity: ticket.quantity ? parseInt(ticket.quantity.toString(), 10) : 0,
      price: parseFloat(ticket.price.toString()),
    }));

  // Add total tickets calculation
  const totalTickets = filteredTickets.reduce(
    (sum, ticket) => sum + ticket.quantity,
    0
  );

  // Get event name from first ticket (assuming all tickets are for same event)
  const eventName = filteredTickets[0]?.name || "Checkout";

  const onSubmit = async (data: FormData) => {
    // Add ticket limit validation
    if (totalTickets > 10) {
      logger.warn("Ticket limit exceeded", { totalTickets });
      trackEvent({
        event: "checkout_error",
        error_type: "ticket_limit_exceeded",
        total_tickets: totalTickets,
      });
      setError("Maximum 10 tickets allowed per order");
      setStep("error");
      return;
    }

    // Early validation and logging
    if (!data || !data.email) {
      logger.error("Missing required form data", { formData: data });
      trackEvent({
        event: "checkout_error",
        error_type: "missing_form_data",
        formData: data,
      });
      setError("Missing required form data");
      setStep("error");
      return;
    }

    // Validate tickets data
    if (!filteredTickets || filteredTickets.length === 0) {
      logger.error("No valid tickets in cart", {
        tickets: filteredTickets,
        rawTickets: tickets,
      });
      trackEvent({
        event: "checkout_error",
        error_type: "no_valid_tickets",
        tickets: filteredTickets,
      });
      setError("No valid tickets selected");
      setStep("error");
      return;
    }

    setStep("processing");
    logger.info("Starting checkout process", {
      email: data.email,
      total,
      ticketCount: filteredTickets.reduce((sum, t) => sum + t.quantity, 0),
    });

    // Prepare the ticket purchase payload
    const ticketItems: TicketPurchaseItem[] = filteredTickets.map((ticket) => ({
      ticket_type_id: ticket.id,
      quantity: ticket.quantity,
    }));

    const payload: TicketPurchaseRequest = {
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      discount_code: data.discountCode || undefined,
      tickets: ticketItems,
      provider: "PAYSTACK",
    };

    try {
      // Log checkout attempt with device info
      logger.info("Checkout attempt", {
        email: data.email,
        total,
        ticketCount: filteredTickets.reduce((sum, t) => sum + t.quantity, 0),
        flashSales: filteredTickets
          .filter(
            (t) =>
              t.flash_sale &&
              isFlashSaleValid(t.flash_sale as TicketTypeWithFlashSale | null)
          )
          .map((t) => ({
            ticketId: t.id,
            flashSaleId: t.flash_sale?.id,
            discountType: t.flash_sale?.discount_type,
            discountAmount: t.flash_sale?.discount_amount,
          })),
        userAgent: window.navigator.userAgent,
        screenSize: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      });

      trackEvent({
        event: "checkout_attempt",
        total_amount: total,
        ticket_count: filteredTickets.reduce((sum, t) => sum + t.quantity, 0),
        has_flash_sale: filteredTickets.some(
          (t) =>
            t.flash_sale &&
            isFlashSaleValid(t.flash_sale as TicketTypeWithFlashSale | null)
        ),
      });

      // Use the hook to purchase tickets
      const result = await purchaseTickets(payload);

      if (result.status === "success") {
        // For free tickets, there won't be an authorization_url
        // We'll check if there's no authorization_url which indicates it's a free ticket
        if (!result.result?.payment_details?.authorization_url) {
          const reference = result.result.payment_details.reference;

          try {
            logger.info("Verifying free ticket transaction", { reference });
            trackEvent({
              event: "free_ticket_verification_start",
              reference,
            });

            const verificationResult = await verifyPayment({ reference });

            if (verificationResult.result.status === "COMPLETED") {
              logger.info("Free ticket transaction successful", { reference });
              trackEvent({
                event: "free_ticket_success",
                reference,
              });

              setStep("success");
              return;
            } else {
              throw new Error(
                "Failed to verify free ticket transaction: " +
                  verificationResult.message || "Unknown error"
              );
            }
          } catch (verifyError) {
            logger.error("Free ticket verification failed", {
              error: verifyError,
              reference,
            });
            trackEvent({
              event: "free_ticket_verification_failed",
              error:
                verifyError instanceof Error
                  ? verifyError.message
                  : "Unknown error",
              reference,
            });
            throw new Error(
              verifyError instanceof Error
                ? verifyError.message
                : "Failed to verify free ticket transaction"
            );
          }
        }

        // Handle paid tickets with authorization URL
        if (result.result?.payment_details?.authorization_url) {
          const { authorization_url } = result.result.payment_details;

          logger.info("Paid ticket checkout successful", {
            email: data.email,
            total,
            paymentUrl: authorization_url,
          });

          trackEvent({
            event: "paid_ticket_checkout_success",
            total_amount: total,
            ticket_count: filteredTickets.reduce(
              (sum, t) => sum + t.quantity,
              0
            ),
          });

          // Save paid event slug to cache
          localStorage.setItem("paidEventSlug", slug);

          window.location.href = authorization_url;
          return;
        }

        throw new Error("Invalid response format from payment service");
      } else {
        throw new Error(
          result.message || "Invalid response format from payment service"
        );
      }
    } catch (err) {
      logger.error("Checkout failed", {
        error:
          err instanceof Error
            ? {
                message: err.message,
                stack: err.stack,
                name: err.name,
              }
            : "Unknown error",
        payload,
        total,
        userAgent: window.navigator.userAgent,
        url: window.location.href,
      });

      trackEvent({
        event: "checkout_error",
        error_type: err instanceof Error ? err.name : "Unknown",
        error_message: err instanceof Error ? err.message : "Unknown error",
        total_amount: total,
      });

      setStep("error");
      setError(
        err instanceof Error
          ? `${err.message}. Please try again or contact support if the problem persists.`
          : "Failed to process ticket purchase. Please try again."
      );
    }
  };

  const calculateOriginalTotal = (ticket: TicketType, quantity: number) => {
    if (!ticket || isNaN(quantity)) return 0;
    const price = parseFloat(ticket.price.toString());
    return isNaN(price) ? 0 : price * quantity;
  };

  const calculatePotentialSavings = (ticket: TicketType, quantity: number) => {
    if (
      !ticket?.flash_sale ||
      !isFlashSaleValid(ticket.flash_sale as TicketTypeWithFlashSale | null)
    )
      return 0;
    const originalPrice = parseFloat(ticket.price.toString());
    if (isNaN(originalPrice)) return 0;

    const { discount_type, discount_amount } = ticket.flash_sale;
    if (discount_type === "PERCENTAGE") {
      return originalPrice * (discount_amount / 100) * quantity;
    }
    // For FIXED discount type
    return discount_amount * quantity;
  };

  const calculateTotal = () => {
    return filteredTickets.reduce((total, ticket) => {
      const price =
        isFlashSaleValid(ticket.flash_sale as TicketTypeWithFlashSale | null) &&
        ticket.flash_sale
          ? ticket.flash_sale.discounted_price
          : ticket.price;
      return total + price * ticket.quantity;
    }, 0);
  };

  const renderStep = () => {
    switch (step) {
      case "details":
        return (
          <div className="space-y-6">
            {/* Order Summary Card */}
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-4">
                {filteredTickets.map((ticket, index) => (
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
                          {(isFlashSaleValid(
                            ticket.flash_sale as TicketTypeWithFlashSale | null
                          ) && ticket.flash_sale
                            ? ticket.flash_sale.discounted_price *
                              ticket.quantity
                            : parseFloat(ticket.price.toString()) *
                              ticket.quantity
                          ).toFixed(2)}
                        </div>
                        {ticket.flash_sale &&
                          isFlashSaleValid(
                            ticket.flash_sale as TicketTypeWithFlashSale | null
                          ) && (
                            <div className="text-sm text-green-600 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              <span>
                                {ticket.flash_sale.discount_type ===
                                "PERCENTAGE"
                                  ? `Save ${
                                      ticket.flash_sale.discount_amount
                                    }% (-KES ${calculatePotentialSavings(
                                      ticket,
                                      ticket.quantity
                                    ).toFixed(2)})`
                                  : `Save KES ${calculatePotentialSavings(
                                      ticket,
                                      ticket.quantity
                                    ).toFixed(2)}`}
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
                  {filteredTickets.some(
                    (t) =>
                      t.flash_sale &&
                      isFlashSaleValid(
                        t.flash_sale as TicketTypeWithFlashSale | null
                      )
                  ) && (
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

            {/* Customer Details Form */}
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

                {/* Only show discount code field if no valid flash sales */}
                {!hasValidFlashSale(filteredTickets) && (
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

                {/* If there is a flash sale, show explanation why discount codes are disabled */}
                {hasValidFlashSale(filteredTickets) && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <span>
                      Discount codes are available after the flash sale expires.
                    </span>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue to Payment
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
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
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Processing your payment...</p>
          </div>
        );

      case "success":
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="text-green-500 bg-green-50 p-3 rounded-full">
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium">Payment Successful!</h3>
            <p className="text-center text-sm text-gray-600">
              Your tickets have been sent to your email address.
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        );

      case "error":
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="text-red-500 bg-red-50 p-3 rounded-full">
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium">Payment Failed</h3>
            <p className="text-center text-sm text-gray-600">{error}</p>
            <p className="text-sm text-muted-foreground text-center">
              Need help? Contact us at{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-primary hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep("details")}>
                Try Again
              </Button>
              <Button variant="destructive" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {eventName} - Checkout
          </DialogTitle>
          <DialogDescription>
            Complete your ticket purchase by providing your details below.
          </DialogDescription>
          {totalTickets > 10 && (
            <p className="text-sm text-red-500 mt-2">
              Maximum 10 tickets allowed per order. Please adjust your
              selection.
            </p>
          )}
        </DialogHeader>
        <div className="overflow-y-auto">{renderStep()}</div>
      </DialogContent>
    </Dialog>
  );
}
