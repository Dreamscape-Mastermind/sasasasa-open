"use client";

import EnhancedTicketCard from "../purchases/enhanced-ticket-card";
import EnhancedTicketShowcase from "../purchases/enhanced-ticket-showcase";
import { TicketStatus } from "@/types/ticket";
import { motion } from "framer-motion";
import { useState } from "react";
import { useTicket } from "@/hooks/useTicket";

export default function TicketsPage() {
  const { useTickets } = useTicket();
  const [viewMode, setViewMode] = useState<"grid" | "showcase">("grid");

  const {
    data: ticketsData,
    isLoading,
    error,
  } = useTickets("", {
    owner: "me",
  });

  const tickets = ticketsData?.result?.results || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-cyan-400">Loading your tickets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              My Tickets
            </span>
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-cyan-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("showcase")}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === "showcase"
                  ? "bg-cyan-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Showcase
            </button>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg">No tickets found</p>
          </div>
        ) : viewMode === "showcase" ? (
          <div className="flex justify-center">
            <EnhancedTicketShowcase />
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {tickets.map((ticket) => (
              <EnhancedTicketCard
                key={ticket.id}
                id={ticket.id}
                event_id={ticket.event}
                user_id={ticket.owner || ""}
                ticket_type={ticket.ticket_type_name}
                status={ticket.status}
                purchase_date={ticket.created_at}
                price={ticket.purchase_price}
                eventName={ticket.event_title}
                date={ticket.created_at}
                time={ticket.created_at}
                venue={ticket.event_title}
                section={ticket.ticket_type_name}
                row={ticket.ticket_number}
                seat={ticket.ticket_number}
                isBlockchainVerified={true}
                transferLimit={2}
                transfersUsed={1}
                tokenId={ticket.id}
                images={[
                  "/placeholder.svg?height=200&width=400&text=Music+Festival+1",
                  "/placeholder.svg?height=200&width=400&text=Music+Festival+2",
                  "/placeholder.svg?height=200&width=400&text=Music+Festival+3",
                ]}
                name={ticket.event_title}
                quantity={1}
                remaining_tickets={1}
                sale_start_date={ticket.created_at}
                sale_end_date={ticket.created_at}
                event={ticket.event}
                is_active={ticket.status === TicketStatus.VALID}
                flash_sale={null}
                created_at={ticket.created_at}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
