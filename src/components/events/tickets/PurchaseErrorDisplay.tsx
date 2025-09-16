import {
  AlertCircle,
  AlertTriangle,
  CreditCard,
  Package,
  RefreshCw,
  ShoppingCart,
  Ticket,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { TicketPurchaseErrorType } from "@/lib/ticketPurchaseHandler";

interface PurchaseErrorDisplayProps {
  errorType: TicketPurchaseErrorType;
  message: string;
  detail?: string;
  onRetry?: () => void;
  onClose?: () => void;
}

const ERROR_ICONS: Record<TicketPurchaseErrorType, React.ComponentType<any>> = {
  validation: AlertCircle,
  ticket_type: Ticket,
  purchase_limit: ShoppingCart,
  sale_period: AlertTriangle,
  inventory: Package,
  payment: CreditCard,
  discount: AlertCircle,
  balance: CreditCard,
  payment_config: CreditCard,
  general: XCircle,
};

const ERROR_COLORS: Record<TicketPurchaseErrorType, string> = {
  validation: "text-blue-600 dark:text-blue-400",
  ticket_type: "text-orange-600 dark:text-orange-400",
  purchase_limit: "text-yellow-600 dark:text-yellow-400",
  sale_period: "text-red-600 dark:text-red-400",
  inventory: "text-red-600 dark:text-red-400",
  payment: "text-red-600 dark:text-red-400",
  discount: "text-purple-600 dark:text-purple-400",
  balance: "text-red-600 dark:text-red-400",
  payment_config: "text-red-600 dark:text-red-400",
  general: "text-gray-600 dark:text-gray-400",
};

const ERROR_BG_COLORS: Record<TicketPurchaseErrorType, string> = {
  validation:
    "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
  ticket_type:
    "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800",
  purchase_limit:
    "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800",
  sale_period:
    "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
  inventory: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
  payment: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
  discount:
    "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800",
  balance: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
  payment_config:
    "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
  general:
    "bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800",
};

const ERROR_TITLES: Record<TicketPurchaseErrorType, string> = {
  validation: "Please Check Your Information",
  ticket_type: "Ticket Type Unavailable",
  purchase_limit: "Purchase Limit Reached",
  sale_period: "Sales Not Available",
  inventory: "Tickets Unavailable",
  payment: "Payment Failed",
  discount: "Invalid Discount Code",
  balance: "Insufficient Balance",
  payment_config: "Payment Service Unavailable",
  general: "Something Went Wrong",
};

const ERROR_SUGGESTIONS: Record<TicketPurchaseErrorType, string[]> = {
  validation: [
    "Check that all required fields are filled",
    "Verify your email address is correct",
    "Ensure ticket quantities are valid",
  ],
  ticket_type: [
    "The ticket type may have been removed",
    "Try selecting a different ticket type",
    "Refresh the page to see updated options",
  ],
  purchase_limit: [
    "You've reached the maximum tickets per person",
    "Try reducing the quantity",
    "Contact support if you need more tickets",
  ],
  sale_period: [
    "Ticket sales may not have started yet",
    "Sales may have ended for this event",
    "Check the event page for sale dates",
  ],
  inventory: [
    "Not enough tickets available",
    "Try reducing the quantity",
    "Check back later for more tickets",
  ],
  payment: [
    "Check your payment method",
    "Ensure sufficient funds",
    "Try a different payment method",
  ],
  discount: [
    "Verify the discount code is correct",
    "Check if the code has expired",
    "Ensure the code applies to your tickets",
  ],
  balance: [
    "Add funds to your account balance",
    "Use a different payment method",
    "Contact support for assistance",
  ],
  payment_config: [
    "Payment service is temporarily down",
    "Try again in a few minutes",
    "Contact support if the issue persists",
  ],
  general: [
    "Try refreshing the page",
    "Check your internet connection",
    "Contact support if the problem continues",
  ],
};

export function PurchaseErrorDisplay({
  errorType,
  message,
  detail,
  onRetry,
  onClose,
}: PurchaseErrorDisplayProps) {
  const Icon = ERROR_ICONS[errorType];
  const color = ERROR_COLORS[errorType];
  const bgColor = ERROR_BG_COLORS[errorType];
  const title = ERROR_TITLES[errorType];
  const suggestions = ERROR_SUGGESTIONS[errorType];

  const canRetry = ["payment", "payment_config", "general"].includes(errorType);
  const isInventoryIssue = ["inventory", "ticket_type"].includes(errorType);
  const isValidationIssue = errorType === "validation";

  return (
    <div className="space-y-6">
      {/* Error Header */}
      <div className={`${bgColor} border rounded-lg p-6`}>
        <div className="flex items-start gap-4">
          <div
            className={`${color} p-2 rounded-full bg-white/50 dark:bg-black/20`}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${color} mb-2`}>{title}</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">{message}</p>
            {detail && (
              <div className="bg-white/50 dark:bg-black/20 rounded p-3 border border-current/20">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Details:</strong> {detail}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
          What you can do:
        </h4>
        <ul className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
            >
              <span className="text-gray-400 dark:text-gray-500 mt-1">•</span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Special handling for different error types */}
      {isInventoryIssue && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-2">
            <Package className="h-4 w-4" />
            <span className="font-medium">Limited Availability</span>
          </div>
          <p className="text-sm text-amber-700 dark:text-amber-400">
            This event has limited tickets available. Try reducing your quantity
            or check back later for more tickets.
          </p>
        </div>
      )}

      {isValidationIssue && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-2">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Form Validation</span>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Please review your information and make sure all required fields are
            completed correctly.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        {onClose && (
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300 dark:border-gray-600"
          >
            Close
          </Button>
        )}
        {canRetry && onRetry && (
          <Button
            onClick={onRetry}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>

      {/* Support Contact */}
      <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Still having trouble? Contact us at{" "}
          <a
            href="mailto:support@sasasasa.co"
            className="text-primary hover:text-primary/80 font-medium"
          >
            support@sasasasa.co
          </a>
        </p>
      </div>
    </div>
  );
}
