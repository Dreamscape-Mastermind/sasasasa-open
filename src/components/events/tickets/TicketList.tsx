import {
  Clock,
  Minus,
  Plus,
  Sparkles,
  Tag,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TicketType } from "@/types/ticket";
import { motion } from "framer-motion";
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

  const isTicketLive = (saleStartDate: string): boolean => {
    const now = new Date();
    const startDate = new Date(saleStartDate);
    return now >= startDate;
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
      {tickets.map((ticket) => (
        <motion.div
          key={ticket.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border rounded-lg p-4 sm:p-6 shadow-md transition-all duration-300 hover:shadow-lg
            ${ticket.flash_sale ? "border-primary/50 bg-primary/5" : ""}`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium text-lg">{ticket.name}</h3>
                {ticket.flash_sale && (
                  <Badge
                    variant="default"
                    className="bg-primary/10 text-primary animate-pulse"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Flash Sale
                  </Badge>
                )}
                {isPopularTicket(ticket) && (
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-100"
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                )}
              </div>

              {getTicketDemandStatus(ticket) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-sm text-orange-600"
                >
                  <Users className="w-4 h-4" />
                  <span>{getTicketDemandStatus(ticket)}</span>
                </motion.div>
              )}

              <div className="text-sm text-muted-foreground">
                {!isTicketLive(ticket.sale_start_date as unknown as string) ? (
                  <motion.div
                    className="text-amber-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div>Sales start</div>
                    <div className="font-medium">
                      {formattedDates[`start_${ticket.id}`] || "Loading..."}
                    </div>
                  </motion.div>
                ) : (
                  ticket.sale_end_date && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <div>
                        <div>Sale ends</div>
                        <div className="font-medium">
                          {formattedDates[`end_${ticket.id}`] || "Loading..."}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="space-y-2">
              {ticket.flash_sale ? (
                <motion.div
                  className="space-y-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="line-through text-muted-foreground">
                      KES {ticket.price}
                    </span>
                    <Badge variant="destructive" className="animate-pulse">
                      {ticket.flash_sale.discount_type === "PERCENTAGE"
                        ? `${ticket.flash_sale.discount_amount}% OFF`
                        : `KES ${ticket.flash_sale.discount_amount} OFF`}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    KES {ticket.flash_sale.discounted_price}
                  </div>
                  {shouldShowRemainingTickets(ticket) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 text-sm text-amber-600"
                    >
                      <Tag className="w-4 h-4" />
                      <span>
                        Only {ticket.flash_sale.remaining_tickets} left at this
                        price!
                      </span>
                    </motion.div>
                  )}
                  {ticket.flash_sale.end_date && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-muted-foreground"
                    >
                      <Clock className="w-4 h-4 inline mr-1" />
                      Flash sale ends in{" "}
                      {formatTimeRemaining(ticket.flash_sale.end_date)}
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xl font-semibold">
                    KES {ticket.price}
                  </div>
                  {shouldShowRemainingTickets(ticket) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 text-sm text-amber-600"
                    >
                      <Tag className="w-4 h-4" />
                      <span>Only {ticket.remaining_tickets} tickets left!</span>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(ticket.id, -1)}
                disabled={quantities[ticket.id] === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">
                {quantities[ticket.id] || 0}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(ticket.id, 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
