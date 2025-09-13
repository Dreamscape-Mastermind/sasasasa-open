import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Crown,
  Gift,
  Minus,
  Plus,
  Sparkles,
  Tag,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-6">
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
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              whileHover={{
                y: -4,
                scale: 1.02,
                transition: { duration: 0.2 },
              }}
              className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ease-out
                ${
                  hasFlashSale
                    ? "border-pink-400/50 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-pink-500/10 shadow-pink-500/20"
                    : "border-zinc-700/50 bg-gradient-to-br from-zinc-800/80 via-zinc-900/80 to-zinc-800/80"
                }
                ${
                  soldOut
                    ? "opacity-60 grayscale-[0.3] hover:grayscale-[0.2]"
                    : ""
                }
              ${
                ticketEnded
                  ? "opacity-50 grayscale-[0.2] border-gray-500/50"
                  : ""
              }
                hover:shadow-2xl hover:border-pink-400/30
                backdrop-blur-sm
              `}
              style={{
                background: hasFlashSale
                  ? `linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(139, 92, 246, 0.05) 50%, rgba(236, 72, 153, 0.1) 100%),
                     radial-gradient(circle at 20% 80%, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
                     radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)`
                  : `linear-gradient(135deg, rgba(24, 24, 27, 0.8) 0%, rgba(39, 39, 42, 0.6) 50%, rgba(24, 24, 27, 0.8) 100%),
                     radial-gradient(circle at 20% 80%, rgba(236, 72, 153, 0.05) 0%, transparent 50%),
                     radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)`,
              }}
            >
              {/* Status Badges */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                {soldOut && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      duration: 0.6,
                      delay: 0.2,
                    }}
                  >
                    <Badge
                      variant="secondary"
                      className="bg-red-500/20 text-red-300 border-red-400/30 shadow-lg backdrop-blur-sm"
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Sold Out
                    </Badge>
                  </motion.div>
                )}

                {ticketEnded && !soldOut && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      duration: 0.6,
                      delay: 0.2,
                    }}
                  >
                    <Badge
                      variant="outline"
                      className="bg-orange-500/20 text-orange-300 border-orange-400/30 shadow-lg backdrop-blur-sm"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      Ended
                    </Badge>
                  </motion.div>
                )}

                {flashSaleSoldOut && !soldOut && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      duration: 0.6,
                      delay: 0.2,
                    }}
                  >
                    <Badge
                      variant="outline"
                      className="bg-amber-500/20 text-amber-300 border-amber-400/30 shadow-lg backdrop-blur-sm"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      Flash Sale Ended
                    </Badge>
                  </motion.div>
                )}

                {hasFlashSale &&
                  !flashSaleSoldOut &&
                  !soldOut &&
                  !ticketEnded && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        type: "spring",
                        duration: 0.6,
                        delay: 0.3,
                      }}
                    >
                      <Badge
                        variant="default"
                        className="bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg animate-pulse"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Flash Sale
                      </Badge>
                    </motion.div>
                  )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4">
                {/* Ticket Info Section */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 flex-wrap">
                    <div className="flex-1">
                      <h3
                        className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                          soldOut || ticketEnded
                            ? "text-gray-500"
                            : "text-white group-hover:text-pink-300"
                        }`}
                      >
                        {ticket.name}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {ticket.is_free && (
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                          >
                            <Badge
                              variant="secondary"
                              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                            >
                              <Gift className="w-3 h-3 mr-1" />
                              Free
                            </Badge>
                          </motion.div>
                        )}
                        {isPopularTicket(ticket) &&
                          !soldOut &&
                          !ticketEnded && (
                            <motion.div
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              whileHover={{ scale: 1.05 }}
                            >
                              <Badge
                                variant="secondary"
                                className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                              >
                                <Crown className="w-3 h-3 mr-1" />
                                Popular
                              </Badge>
                            </motion.div>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* Ticket Description */}
                  {ticket.description && (
                    <motion.p
                      className="text-gray-300 leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {ticket.description}
                    </motion.p>
                  )}

                  {/* Complementary Policy Information */}
                  {ticket.has_complementary_policy && (
                    <motion.div
                      className="mt-4 p-4 bg-gradient-to-r from-blue-500/20 via-indigo-500/10 to-blue-500/20 rounded-xl border border-blue-400/30 shadow-lg backdrop-blur-sm"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                          <Gift className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-blue-200 text-lg">
                              🎁 BONUS TICKETS INCLUDED
                            </span>
                          </div>
                          <div className="text-blue-100 mb-3">
                            <span className="font-semibold text-lg">
                              Buy {ticket.complementary_ratio} ticket
                              {ticket.complementary_ratio > 1 ? "s" : ""}, get{" "}
                              {ticket.complementary_ratio} FREE!
                            </span>
                            {ticket.complementary_max_per_purchase && (
                              <motion.span
                                className="inline-block ml-3 px-3 py-1 bg-blue-400/30 rounded-full text-sm font-medium"
                                whileHover={{ scale: 1.05 }}
                              >
                                Max {ticket.complementary_max_per_purchase} free
                                per order
                              </motion.span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-blue-200">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Free tickets are automatically added to your cart
                              - no extra steps needed!
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {getTicketDemandStatus(ticket) &&
                    !soldOut &&
                    !ticketEnded && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-sm bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 px-3 py-2 rounded-lg border border-orange-200 dark:border-orange-800"
                      >
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-medium">
                          🔥 {getTicketDemandStatus(ticket)}
                        </span>
                      </motion.div>
                    )}

                  {soldOut && !ticketEnded && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <XCircle className="w-4 h-4" />
                      <span className="font-medium">
                        ❌ All tickets claimed
                      </span>
                    </motion.div>
                  )}

                  {ticketEnded && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-2 text-sm bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800"
                    >
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">⏰ Sales have ended</span>
                    </motion.div>
                  )}

                  <div className="text-sm">
                    {!isTicketLive(
                      ticket.sale_start_date as unknown as string
                    ) ? (
                      <motion.div
                        className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <div>
                            <div className="font-medium">⏰ Sales start</div>
                            <div className="text-sm">
                              {formattedDates[`start_${ticket.id}`] ||
                                "Loading..."}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      ticket.sale_end_date && (
                        <div className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <div>
                              <div className="font-medium">⏰ Sale ends</div>
                              <div className="text-sm">
                                {formattedDates[`end_${ticket.id}`] ||
                                  "Loading..."}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Pricing and Quantity Section */}
                <div className="space-y-4 flex flex-col justify-between">
                  {ticket.flash_sale ? (
                    <motion.div
                      className="space-y-3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-center gap-3 flex-wrap">
                        <span
                          className={`text-xl line-through ${
                            soldOut || ticketEnded
                              ? "text-gray-500/70"
                              : "text-gray-400"
                          }`}
                        >
                          KES {parseFloat(ticket.price).toFixed(0)}
                        </span>
                        {!soldOut && !flashSaleSoldOut && !ticketEnded && (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Badge
                              variant="destructive"
                              className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg animate-pulse px-4 py-2 text-sm font-bold"
                            >
                              🔥{" "}
                              {ticket.flash_sale.discount_type === "PERCENTAGE"
                                ? `${ticket.flash_sale.discount_amount}% OFF`
                                : `KES ${ticket.flash_sale.discount_amount} OFF`}
                            </Badge>
                          </motion.div>
                        )}
                        {flashSaleSoldOut && !soldOut && !ticketEnded && (
                          <Badge
                            variant="outline"
                            className="text-gray-400 px-3 py-1 text-sm border-gray-500"
                          >
                            Flash Sale Ended
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-baseline gap-3">
                        <motion.div
                          className={`text-3xl font-bold transition-all duration-300 ${
                            soldOut || ticketEnded
                              ? "text-gray-500"
                              : flashSaleSoldOut
                              ? "text-gray-400"
                              : "text-green-400 group-hover:text-green-300"
                          }`}
                          whileHover={{ scale: 1.05 }}
                        >
                          KES{" "}
                          {flashSaleSoldOut && !soldOut && !ticketEnded
                            ? parseFloat(ticket.price).toFixed(0)
                            : parseFloat(
                                String(ticket.flash_sale.discounted_price)
                              ).toFixed(0)}
                        </motion.div>
                        {!soldOut && !flashSaleSoldOut && !ticketEnded && (
                          <span className="text-sm text-green-300 font-medium">
                            per ticket
                          </span>
                        )}
                      </div>
                      {shouldShowRemainingTickets(ticket) &&
                        !soldOut &&
                        !flashSaleSoldOut &&
                        !ticketEnded && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2 text-sm bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800"
                          >
                            <Tag className="w-4 h-4" />
                            <span className="font-medium">
                              ⚡ Only {ticket.flash_sale.remaining_tickets} left
                              at this price!
                            </span>
                          </motion.div>
                        )}
                      {flashSaleSoldOut && !soldOut && !ticketEnded && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="flex items-center gap-2 text-sm text-amber-600"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Flash sale ended - regular price applies</span>
                        </motion.div>
                      )}
                      {ticket.flash_sale.end_date &&
                        !soldOut &&
                        !flashSaleSoldOut &&
                        !ticketEnded && (
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
                    <motion.div
                      className="space-y-3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-baseline gap-3">
                        <motion.div
                          className={`text-3xl font-bold transition-all duration-300 ${
                            soldOut || ticketEnded
                              ? "text-gray-500"
                              : ticket.is_free
                              ? "text-green-400 group-hover:text-green-300"
                              : "text-pink-400 group-hover:text-pink-300"
                          }`}
                          whileHover={{ scale: 1.05 }}
                        >
                          {ticket.is_free
                            ? "FREE"
                            : `KES ${parseFloat(ticket.price).toFixed(0)}`}
                        </motion.div>
                        {!ticket.is_free && !soldOut && !ticketEnded && (
                          <span className="text-sm text-gray-300 font-medium">
                            per ticket
                          </span>
                        )}
                      </div>
                      {shouldShowRemainingTickets(ticket) &&
                        !soldOut &&
                        !ticketEnded && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2 text-sm bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800"
                          >
                            <Tag className="w-4 h-4" />
                            <span className="font-medium">
                              ⚡ Only {ticket.remaining_tickets} tickets left!
                            </span>
                          </motion.div>
                        )}
                    </motion.div>
                  )}

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-center mt-4">
                    {soldOut || ticketEnded ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex-1 text-center"
                      >
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                          <XCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                          <p className="text-gray-400 text-sm">
                            {soldOut ? "Sold Out" : "Sales Ended"}
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        className="flex items-center gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(ticket.id, -1)}
                            disabled={quantities[ticket.id] === 0}
                            className="w-12 h-12 rounded-full border-2 border-red-400/50 hover:bg-red-500/20 hover:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed bg-red-500/10 backdrop-blur-sm shadow-lg"
                          >
                            <Minus className="h-5 w-5 text-red-400" />
                          </Button>
                        </motion.div>

                        <motion.div
                          className="flex flex-col items-center bg-gradient-to-br from-zinc-800 to-zinc-700 rounded-xl p-4 min-w-[80px] border border-zinc-600/50 shadow-lg"
                          whileHover={{ scale: 1.05 }}
                        >
                          <span className="text-2xl font-bold text-white">
                            {quantities[ticket.id] || 0}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">
                            tickets
                          </span>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(ticket.id, 1)}
                            className="w-12 h-12 rounded-full border-2 border-green-400/50 hover:bg-green-500/20 hover:border-green-400 bg-green-500/10 backdrop-blur-sm shadow-lg"
                          >
                            <Plus className="h-5 w-5 text-green-400" />
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
