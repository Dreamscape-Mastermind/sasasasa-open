import { AnimatePresence, motion } from "framer-motion";
import { CreditCard, ShoppingCart, Sparkles } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { EventCheckout } from "./EventCheckout";
import { TicketList } from "./TicketList";
import { TicketType } from "@/types/ticket";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLogger } from "@/hooks/useLogger";

interface TicketsProps {
  tickets: TicketType[];
  formatDate: (dateString: string) => Promise<string>;
  slug: string;
}

const Tickets = memo(function Tickets({
  tickets,
  formatDate,
  slug,
}: TicketsProps) {
  const analytics = useAnalytics();
  const logger = useLogger({ context: "Tickets" });
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [showCheckout, setShowCheckout] = useState(false);

  const handleQuantityChange = useCallback(
    (ticketId: string, quantity: number) => {
      setQuantities((prev) => ({
        ...prev,
        [ticketId]: quantity,
      }));
    },
    []
  );

  const calculateTotal = useCallback(() => {
    return Object.entries(quantities).reduce((total, [ticketId, quantity]) => {
      const ticket = tickets.find((t) => t.id === ticketId);
      if (ticket && quantity > 0) {
        const price = ticket.flash_sale?.discounted_price || ticket.price;
        return (
          total +
          (typeof price === "string" ? parseFloat(price) : price) * quantity
        );
      }
      return total;
    }, 0);
  }, [quantities, tickets]);

  const hasValidTickets = useCallback((): boolean => {
    return Object.values(quantities).some((quantity) => quantity > 0);
  }, [quantities]);

  const totalTickets = useMemo(() => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  }, [quantities]);

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
      price: String(ticket.flash_sale?.discounted_price || ticket.price),
    }));

  return (
    <div className="mx-auto p-2 sm:p-2">
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
        <AnimatePresence>
          {hasValidTickets() && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background backdrop-blur-sm rounded-xl p-4 border border-[#8B4545] shadow-xl mb-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#8B4545]/20 rounded-lg">
                    <ShoppingCart className="w-5 h-5 text-[#8B4545]" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      Order Summary
                    </h3>
                    <p className="text-xs text-gray-400">
                      {totalTickets} ticket{totalTickets > 1 ? "s" : ""}{" "}
                      selected
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">
                    KES {calculateTotal().toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-400">Total</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            className={`w-full rounded-xl h-12 text-base font-bold transition-all duration-300 ${
              hasValidTickets()
                ? "bg-[#8B4545] hover:bg-[#A55A5A] shadow-lg hover:shadow-xl text-white"
                : "bg-[#8B4545]/50 hover:bg-[#8B4545]/70 cursor-not-allowed text-white/70"
            }`}
            size="lg"
            onClick={handleCheckoutClick}
            disabled={!hasValidTickets()}
          >
            <div className="flex items-center gap-3">
              {hasValidTickets() ? (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Proceed to Checkout</span>
                  <div className="ml-auto flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-medium">
                      KES {calculateTotal().toFixed(0)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span>Select tickets to continue</span>
                </>
              )}
            </div>
          </Button>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showCheckout && (
          <EventCheckout
            isOpen={showCheckout}
            onClose={() => setShowCheckout(false)}
            total={calculateTotal()}
            tickets={ticketsWithQuantity}
            slug={slug}
          />
        )}
      </AnimatePresence>
    </div>
  );
});

export { Tickets };
export default Tickets;
