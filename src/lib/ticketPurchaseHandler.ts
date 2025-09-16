import { ErrorResponse } from "@/types/common";
import { TicketPurchaseResponse } from "@/types/ticket";

/**
 * Error types from the API response
 */
export type TicketPurchaseErrorType =
  | "validation"
  | "ticket_type"
  | "purchase_limit"
  | "sale_period"
  | "inventory"
  | "payment"
  | "discount"
  | "balance"
  | "payment_config"
  | "general";

/**
 * User-friendly error messages for different error types
 */
const ERROR_MESSAGES: Record<TicketPurchaseErrorType, string> = {
  validation: "Please check your information and try again.",
  ticket_type: "The selected ticket type is no longer available.",
  purchase_limit:
    "You've reached the maximum number of tickets you can purchase.",
  sale_period: "Ticket sales are not currently available for this event.",
  inventory: "Sorry, there aren't enough tickets available.",
  payment: "We couldn't process your payment. Please try again.",
  discount: "The discount code you entered is invalid or expired.",
  balance: "You don't have enough balance to complete this purchase.",
  payment_config:
    "Payment service is temporarily unavailable. Please try again later.",
  general: "Something went wrong. Please try again or contact support.",
};

/**
 * Success messages for different ticket types
 */
const SUCCESS_MESSAGES = {
  free: "🎉 Your free tickets have been confirmed!",
  balance_paid: "🎉 Your tickets have been purchased using your balance!",
  paid: "🎉 Your payment is being processed!",
  partial_balance: "🎉 Your payment is being processed with balance applied!",
};

/**
 * Extract error type from API error response
 */
export function getErrorType(
  errorResponse: ErrorResponse
): TicketPurchaseErrorType {
  const errorType = errorResponse.result?.errors?.error_type;

  if (typeof errorType === "string") {
    return errorType as TicketPurchaseErrorType;
  }

  // Fallback to general error if no specific type
  return "general";
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(errorResponse: ErrorResponse): string {
  const errorType = getErrorType(errorResponse);
  const detail = errorResponse.result?.errors?.detail;

  // Use specific detail if available, otherwise use generic message
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail) && detail.length > 0) {
    return detail[0];
  }
  return ERROR_MESSAGES[errorType];
}

/**
 * Get success message for ticket type
 */
export function getSuccessMessage(ticketType: string): string {
  return (
    SUCCESS_MESSAGES[ticketType as keyof typeof SUCCESS_MESSAGES] ||
    SUCCESS_MESSAGES.paid
  );
}

/**
 * Handle successful ticket purchase response
 */
export function handlePurchaseSuccess(response: TicketPurchaseResponse) {
  const {
    ticket_type,
    redirect_type,
    payment_reference,
    authorization_url,
    amount,
    balance_used,
    message,
  } = response.result!;

  return {
    success: true,
    ticketType: ticket_type,
    redirectType: redirect_type,
    paymentReference: payment_reference,
    authorizationUrl: authorization_url,
    amount: amount || 0,
    balanceUsed: balance_used || 0,
    message: message || getSuccessMessage(ticket_type),
    isFree: ticket_type === "free",
    isBalanceOnly: ticket_type === "balance_paid",
    isPartialBalance: ticket_type === "partial_balance",
    isPaid: ticket_type === "paid",
  };
}

/**
 * Handle failed ticket purchase response
 */
export function handlePurchaseError(errorResponse: ErrorResponse) {
  const errorType = getErrorType(errorResponse);
  const message = getErrorMessage(errorResponse);
  const detail = errorResponse.result?.errors?.detail;

  return {
    success: false,
    errorType,
    message,
    detail,
    isValidationError: errorType === "validation",
    isInventoryError: errorType === "inventory",
    isPaymentError: errorType === "payment" || errorType === "payment_config",
    isBusinessLogicError: [
      "ticket_type",
      "purchase_limit",
      "sale_period",
      "discount",
      "balance",
    ].includes(errorType),
  };
}

/**
 * Main handler for ticket purchase responses
 */
export function handleTicketPurchaseResponse(
  response: TicketPurchaseResponse | ErrorResponse
):
  | ReturnType<typeof handlePurchaseSuccess>
  | ReturnType<typeof handlePurchaseError> {
  // Handle malformed responses
  if (!response || typeof response !== "object") {
    return handlePurchaseError({
      status: "error",
      message: "Invalid response received",
      result: {
        errors: {
          general: ["The server returned an invalid response"],
        },
        error_type: "general",
      },
    } as ErrorResponse);
  }

  if (response.status === "success") {
    return handlePurchaseSuccess(response as TicketPurchaseResponse);
  } else {
    return handlePurchaseError(response as ErrorResponse);
  }
}

/**
 * Check if response indicates immediate success (no payment required)
 */
export function isImmediateSuccess(
  ticketType: string,
  redirectType: string
): boolean {
  return (
    (ticketType === "free" || ticketType === "balance_paid") &&
    redirectType === "checkout_success"
  );
}

/**
 * Check if response requires payment provider redirect
 */
export function requiresPaymentRedirect(
  ticketType: string,
  redirectType: string
): boolean {
  return (
    redirectType === "payment_provider" &&
    (ticketType === "paid" || ticketType === "partial_balance")
  );
}

/**
 * Get appropriate action for the response
 */
export function getResponseAction(
  response: TicketPurchaseResponse | ErrorResponse
) {
  if (response.status === "error") {
    return "show_error";
  }

  const { ticket_type, redirect_type } = response.result!;

  if (isImmediateSuccess(ticket_type, redirect_type)) {
    return "redirect_to_success";
  }

  if (requiresPaymentRedirect(ticket_type, redirect_type)) {
    return "redirect_to_payment";
  }

  return "show_error";
}
