import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Gift,
  Minus,
  Plus,
  Tag,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { TicketType } from "@/types/ticket";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLogger } from "@/hooks/useLogger";

interface TicketListProps {
  tickets: TicketType[];
  formatDate: (dateString: string) => Promise<string>;
  onQuantityChange: (ticketId: string, quantity: number) => void;
  quantities: { [key: string]: number };
}

export function TicketList({
  tickets,
  formatDate,
  onQuantityChange,
  quantities,
}: TicketListProps) {
  const analytics = useAnalytics();
  const logger = useLogger({ context: "TicketList" });
  const [formattedDates, setFormattedDates] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    const formatDates = async () => {
      const formatted: { [key: string]: string } = {};
      for (const ticket of tickets) {
        if (ticket.sale_start_date) {
          formatted[`start_${ticket.id}`] = await formatDate(
            ticket.sale_start_date as unknown as string
          );
        }
        if (ticket.sale_end_date) {
          formatted[`end_${ticket.id}`] = await formatDate(
            ticket.sale_end_date as unknown as string
          );
        }
      }
      setFormattedDates(formatted);
    };

    formatDates();
  }, [tickets, formatDate]);

  const isTicketSoldOut = (ticket: TicketType): boolean => {
    return ticket.remaining_tickets === 0;
  };

  const isFlashSaleSoldOut = (ticket: TicketType): boolean => {
    return ticket.flash_sale?.remaining_tickets === 0;
  };

  const isTicketLive = (saleStartDate: string): boolean => {
    const now = new Date();
    const startDate = new Date(saleStartDate);
    return now >= startDate;
  };

  const isTicketEnded = (saleEndDate: string): boolean => {
    const now = new Date();
    const endDate = new Date(saleEndDate);
    return now > endDate;
  };

  const shouldShowRemainingTickets = (ticket: TicketType): boolean => {
    if (ticket.flash_sale) {
      return ticket.flash_sale.remaining_tickets <= 10;
    }
    return ticket.remaining_tickets <= 10;
  };

  const isPopularTicket = (ticket: TicketType): boolean => {
    const totalSold = ticket.quantity - ticket.remaining_tickets;
    return totalSold > 50;
  };

  const getTicketDemandStatus = (ticket: TicketType): string | null => {
    const totalSold = ticket.quantity - ticket.remaining_tickets;
    const soldPercentage = (totalSold / ticket.quantity) * 100;

    if (soldPercentage >= 75) return "Selling fast";
    if (soldPercentage >= 50) return "High demand";
    return null;
  };

  const formatTimeRemaining = (endDate: string): string => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? "s" : ""}`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes} minutes`;
  };

  const handleQuantityChange = (ticketId: string, change: number) => {
    const newQuantity = Math.max(0, (quantities[ticketId] || 0) + change);
    onQuantityChange(ticketId, newQuantity);

    analytics.trackEvent({
      event: "ticket_quantity_changed",
      ticket_id: ticketId,
      quantity: newQuantity,
      change: change,
    });

    logger.info("Ticket quantity changed", {
      ticket_id: ticketId,
      quantity: newQuantity,
      change: change,
    });
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {tickets.map((ticket, index) => {
          const soldOut = isTicketSoldOut(ticket);
          const flashSaleSoldOut = isFlashSaleSoldOut(ticket);
          const hasFlashSale = ticket.flash_sale && !soldOut;
          const ticketEnded = ticket.sale_end_date
            ? isTicketEnded(ticket.sale_end_date as unknown as string)
            : false;

          return (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              className={`group relative rounded-xl border transition-all duration-300 ease-out
                ${soldOut || ticketEnded ? "opacity-60" : ""}
                bg-background border-[#8B4545] hover:border-[#A55A5A]
              `}
            >
              <div className="flex items-center justify-between p-6">
                {/* Left side - Ticket info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3
                      className={`text-xl font-bold ${
                        soldOut || ticketEnded ? "text-gray-500" : "text-white"
                      }`}
                    >
                      {ticket.name}
                    </h3>
                    <div className="text-right">
                      <div
                        className={`text-xl font-bold ${
                          soldOut || ticketEnded
                            ? "text-gray-500"
                            : "text-white"
                        }`}
                      >
                        {ticket.is_free
                          ? "FREE"
                          : ticket.flash_sale &&
                            !flashSaleSoldOut &&
                            !soldOut &&
                            !ticketEnded
                          ? `KES ${parseFloat(
                              String(ticket.flash_sale.discounted_price)
                            ).toFixed(2)}`
                          : `KES ${parseFloat(ticket.price).toFixed(2)}`}
                      </div>
                    </div>
                  </div>

                  {/* Sale end date */}
                  {ticket.sale_end_date && !soldOut && !ticketEnded && (
                    <div className="flex items-center gap-2 text-[#E0B0B0] text-sm">
                      <Clock className="w-4 h-4" />
                      <span>
                        Sale ends{" "}
                        {formattedDates[`end_${ticket.id}`] || "Loading..."}
                      </span>
                    </div>
                  )}

                  {/* Availability warning */}
                  {shouldShowRemainingTickets(ticket) &&
                    !soldOut &&
                    !ticketEnded && (
                      <div className="flex items-center gap-2 text-[#FFA500] text-sm mt-2">
                        <Tag className="w-4 h-4" />
                        <span>
                          Only{" "}
                          {ticket.flash_sale
                            ? ticket.flash_sale.remaining_tickets
                            : ticket.remaining_tickets}{" "}
                          tickets left!
                        </span>
                      </div>
                    )}

                  {/* Complementary policy info */}
                  {ticket.has_complementary_policy &&
                    !soldOut &&
                    !ticketEnded && (
                      <div className="mt-3 p-3 bg-card rounded-lg border border-[#8B4545]">
                        <div className="flex items-center gap-2 text-white text-sm">
                          <Gift className="w-4 h-4 text-blue-400" />
                          <span className="font-semibold">
                            BONUS TICKETS INCLUDED
                          </span>
                        </div>
                        <div className="text-white text-sm mt-1">
                          Buy {ticket.complementary_ratio} ticket
                          {ticket.complementary_ratio > 1 ? "s" : ""}, get{" "}
                          {ticket.complementary_ratio} FREE!
                        </div>
                        {ticket.complementary_max_per_purchase && (
                          <div className="text-[#E0B0B0] text-xs mt-1">
                            Max {ticket.complementary_max_per_purchase} free per
                            order
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-[#E0B0B0] text-xs mt-2">
                          <CheckCircle className="w-3 h-3" />
                          <span>
                            Free tickets are automatically added to your cart -
                            no extra steps needed!
                          </span>
                        </div>
                      </div>
                    )}
                </div>

                {/* Right side - Quantity selector */}
                <div className="flex items-center gap-3 ml-6">
                  {soldOut || ticketEnded ? (
                    <div className="text-center">
                      <XCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">
                        {soldOut ? "Sold Out" : "Sales Ended"}
                      </p>
                    </div>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(ticket.id, -1)}
                        disabled={quantities[ticket.id] === 0}
                        className="w-10 h-10 rounded-full border border-[#8B4545] bg-[#8B4545] hover:bg-[#A55A5A] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="h-4 w-4 text-white" />
                      </Button>

                      <div className="text-center min-w-[40px]">
                        <span className="text-2xl font-bold text-white">
                          {quantities[ticket.id] || 0}
                        </span>
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(ticket.id, 1)}
                        className="w-10 h-10 rounded-full border border-[#8B4545] bg-[#8B4545] hover:bg-[#A55A5A]"
                      >
                        <Plus className="h-4 w-4 text-white" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
