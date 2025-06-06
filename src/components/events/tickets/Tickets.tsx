import { Button } from "@/components/ui/button";
import { EventCheckout } from "./EventCheckout";
import { TicketList } from "./TicketList";
import { TicketType } from "@/types/ticket";
import { motion } from "framer-motion";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLogger } from "@/hooks/useLogger";
import { useState } from "react";

interface TicketsProps {
  tickets: TicketType[];
  formatDate: (dateString: string) => Promise<string>;
  slug: string;
}

export function Tickets({ tickets, formatDate, slug }: TicketsProps) {
  const analytics = useAnalytics();
  const logger = useLogger({ context: "Tickets" });
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [showCheckout, setShowCheckout] = useState(false);

  const handleQuantityChange = (ticketId: string, quantity: number) => {
    setQuantities((prev) => ({
      ...prev,
      [ticketId]: quantity,
    }));
  };

  const calculateTotal = () => {
    return Object.entries(quantities).reduce((total, [ticketId, quantity]) => {
      const ticket = tickets.find((t) => t.id === ticketId);
      if (ticket && quantity > 0) {
        const price = ticket.flash_sale?.discounted_price || ticket.price;
        return total + price * quantity;
      }
      return total;
    }, 0);
  };

  const hasValidTickets = (): boolean => {
    return Object.values(quantities).some((quantity) => quantity > 0);
  };

  const handleCheckoutClick = () => {
    analytics.trackEvent({
      event: "checkout_initiated",
      total: calculateTotal(),
      ticket_count: Object.values(quantities).reduce(
        (sum, qty) => sum + qty,
        0
      ),
    });

    logger.info("Checkout initiated", {
      total: calculateTotal(),
      ticket_count: Object.values(quantities).reduce(
        (sum, qty) => sum + qty,
        0
      ),
    });

    setShowCheckout(true);
  };

  const ticketsWithQuantity = tickets
    .filter((ticket) => quantities[ticket.id] > 0)
    .map((ticket) => ({
      ...ticket,
      quantity: quantities[ticket.id],
      price: ticket.flash_sale?.discounted_price || ticket.price,
    }));

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <TicketList
        tickets={tickets}
        formatDate={formatDate}
        onQuantityChange={handleQuantityChange}
        quantities={quantities}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6"
      >
        <Button
          className="w-full rounded-[4rem]"
          size="lg"
          onClick={handleCheckoutClick}
          disabled={!hasValidTickets()}
        >
          Checkout{" "}
          {hasValidTickets() ? `(KES ${calculateTotal().toFixed(2)})` : ""}
        </Button>
      </motion.div>

      {showCheckout && (
        <EventCheckout
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          total={calculateTotal()}
          tickets={ticketsWithQuantity}
          slug={slug}
        />
      )}
    </div>
  );
}
