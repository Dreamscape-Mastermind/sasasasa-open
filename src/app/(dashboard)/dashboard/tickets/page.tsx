"use client";

import ModernTicketCard from "@/components/tickets/ModernTicketCard";
import { EventPagination } from "@/components/events/pagination/EventPagination";
import { MobilePagination } from "@/components/ui/mobile-pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { useTicket } from "@/hooks/useTicket";
import { TicketStatus } from "@/types/ticket";
import {
  Search,
  Filter,
  Ticket,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";

export default function TicketsPage() {
  const { useUserTickets } = useTicket();

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteTickets, setFavoriteTickets] = useState<Set<string>>(
    new Set()
  );
  const [sharingTicket, setSharingTicket] = useState<string | null>(null);

  // API call with pagination and filters
  const {
    data: ticketsData,
    isLoading,
    error,
    refetch,
  } = useUserTickets({
    page: currentPage,
    page_size: pageSize,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: searchQuery || undefined,
  });

  const tickets = ticketsData?.result?.results || [];
  const totalCount = ticketsData?.result?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Filter tickets locally for additional filtering
  const filteredTickets = useMemo(() => {
    if (!tickets) return [];

    return tickets.filter((ticket) => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          ticket.event_title?.toLowerCase().includes(searchLower) ||
          ticket.ticket_type_name?.toLowerCase().includes(searchLower) ||
          ticket.ticket_number?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [tickets, searchQuery]);

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card
          key={i}
          className="overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        >
          <Skeleton className="h-32 sm:h-40 w-full bg-slate-700" />
          <CardContent className="p-4 sm:p-6">
            <Skeleton className="h-5 w-3/4 mb-2 bg-slate-700" />
            <Skeleton className="h-3 w-1/2 mb-4 bg-slate-700" />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Skeleton className="h-16 w-full bg-slate-700" />
              <Skeleton className="h-16 w-full bg-slate-700" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 flex-1 bg-slate-700" />
              <Skeleton className="h-8 w-8 bg-slate-700" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
        <Ticket className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        No tickets found
      </h3>
      <p className="text-muted-foreground mb-6">
        {searchQuery || statusFilter !== "all"
          ? "Try adjusting your search or filter criteria."
          : "You haven't purchased any tickets yet. Start exploring events to get your first ticket!"}
      </p>
      {(searchQuery || statusFilter !== "all") && (
        <Button
          variant="outline"
          onClick={() => {
            setSearchQuery("");
            setStatusFilter("all");
          }}
        >
          Clear filters
        </Button>
      )}
    </motion.div>
  );

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="border-destructive">
            <CardContent className="p-8 text-center">
              <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-destructive mb-2">
                Error Loading Tickets
              </h2>
              <p className="text-muted-foreground mb-6">
                {error.message ||
                  "Something went wrong while loading your tickets."}
              </p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                My Tickets
              </h1>
              <p className="text-muted-foreground">
                Manage and view all your event tickets
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-slate-600 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Total Tickets</p>
                      <p className="text-2xl font-bold text-white">
                        {totalCount}
                      </p>
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Ticket className="w-8 h-8 text-blue-400" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-emerald-900/20 to-green-900/20 border-emerald-700/30 hover:border-emerald-600/50 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-emerald-400">Valid Tickets</p>
                      <p className="text-2xl font-bold text-emerald-300">
                        {
                          tickets.filter((t) => t.status === TicketStatus.VALID)
                            .length
                        }
                      </p>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-700/30 hover:border-blue-600/50 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-400">Used Tickets</p>
                      <p className="text-2xl font-bold text-blue-300">
                        {
                          tickets.filter((t) => t.status === TicketStatus.USED)
                            .length
                        }
                      </p>
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Clock className="w-8 h-8 text-blue-400" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-red-900/20 to-rose-900/20 border-red-700/30 hover:border-red-600/50 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-400">Invalid Tickets</p>
                      <p className="text-2xl font-bold text-red-300">
                        {
                          tickets.filter(
                            (t) => t.status === TicketStatus.INVALID
                          ).length
                        }
                      </p>
                    </div>
                    <motion.div
                      animate={{ x: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <XCircle className="w-8 h-8 text-red-400" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-6 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        placeholder="Search tickets by event name, ticket type, or ticket number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-slate-800/50 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20">
                      <Filter className="w-4 h-4 mr-2 text-slate-400" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem
                        value="all"
                        className="text-white hover:bg-slate-700"
                      >
                        All Status
                      </SelectItem>
                      <SelectItem
                        value={TicketStatus.VALID}
                        className="text-white hover:bg-slate-700"
                      >
                        Valid
                      </SelectItem>
                      <SelectItem
                        value={TicketStatus.USED}
                        className="text-white hover:bg-slate-700"
                      >
                        Used
                      </SelectItem>
                      <SelectItem
                        value={TicketStatus.INVALID}
                        className="text-white hover:bg-slate-700"
                      >
                        Invalid
                      </SelectItem>
                      <SelectItem
                        value={TicketStatus.CANCELLED}
                        className="text-white hover:bg-slate-700"
                      >
                        Cancelled
                      </SelectItem>
                      <SelectItem
                        value={TicketStatus.REFUNDED}
                        className="text-white hover:bg-slate-700"
                      >
                        Refunded
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Content Section */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <LoadingSkeleton />
          ) : filteredTickets.length === 0 ? (
            <EmptyState />
          ) : (
            <motion.div
              key="modern-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8"
            >
              {filteredTickets.map((ticket) => (
                <motion.div
                  key={ticket.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ModernTicketCard
                    id={ticket.id}
                    eventName={ticket.event_title || "Event Title"}
                    date={ticket.event_date || ticket.created_at || ""}
                    time={ticket.event_date || ticket.created_at || ""}
                    venue={ticket.event_location || "Venue TBD"}
                    price={ticket.purchase_price || 0}
                    section={
                      ticket.ticket_type_details?.name ||
                      ticket.ticket_type_name ||
                      "General"
                    }
                    row={ticket.ticket_number}
                    seat={ticket.ticket_number}
                    status={ticket.status}
                    qrCode={ticket.qr_code_url || undefined}
                    paymentStatus={ticket.purchase_info?.payment_status}
                    paymentReference={
                      ticket.purchase_info?.payment_reference || undefined
                    }
                    paymentMethod={
                      ticket.purchase_info?.payment_method || undefined
                    }
                    eventImage={ticket.event_cover_image || undefined}
                    ticketNumber={ticket.ticket_number}
                    isFavorite={favoriteTickets.has(ticket.id)}
                    onFavorite={() => {
                      const newFavorites = new Set(favoriteTickets);
                      if (newFavorites.has(ticket.id)) {
                        newFavorites.delete(ticket.id);
                      } else {
                        newFavorites.add(ticket.id);
                      }
                      setFavoriteTickets(newFavorites);
                    }}
                    onShare={async () => {
                      // Prevent multiple simultaneous share operations
                      if (sharingTicket) return;

                      setSharingTicket(ticket.id);

                      try {
                        if (navigator.share) {
                          await navigator.share({
                            title: ticket.event_title,
                            text: `Check out my ticket for ${ticket.event_title}`,
                            url: window.location.href,
                          });
                        } else {
                          await navigator.clipboard.writeText(
                            window.location.href
                          );
                          // You could add a toast notification here
                          console.log("✅ Ticket link copied to clipboard!");
                        }
                      } catch (error) {
                        console.error("❌ Error sharing ticket:", error);

                        // If it's a user cancellation, don't show error
                        if (
                          error instanceof Error &&
                          error.name === "AbortError"
                        ) {
                          console.log("ℹ️ Share cancelled by user");
                          return;
                        }

                        // Fallback to clipboard if share fails
                        try {
                          await navigator.clipboard.writeText(
                            window.location.href
                          );
                          console.log(
                            "✅ Ticket link copied to clipboard as fallback!"
                          );
                        } catch (clipboardError) {
                          console.error(
                            "❌ Failed to copy to clipboard:",
                            clipboardError
                          );
                          // You could show an error toast here
                        }
                      } finally {
                        setSharingTicket(null);
                      }
                    }}
                    onDownload={() => {
                      // Download ticket as PDF or image
                      console.log("Download ticket:", ticket.id);
                    }}
                    isSharing={sharingTicket === ticket.id}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {!isLoading && filteredTickets.length > 0 && totalPages > 1 && (
          <div className="mt-8">
            {/* Desktop pagination */}
            <div className="hidden sm:block">
              <EventPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                showPageSizeChanger={true}
              />
            </div>

            {/* Mobile pagination */}
            <div className="sm:hidden">
              <MobilePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                showPageSizeChanger={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
