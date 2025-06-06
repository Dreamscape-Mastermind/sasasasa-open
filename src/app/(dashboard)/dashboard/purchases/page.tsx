"use client";

import { TicketEnhanced, TicketStatus } from "@/types/ticket";
import { useEffect, useState } from "react";

import EnhancedTicketCard from "./enhanced-ticket-card";
import EnhancedTicketShowcase from "./enhanced-ticket-showcase";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export default function PurchasesPage() {
  const { user, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<TicketEnhanced[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "showcase">("grid");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);

        if (!isAuthenticated) {
          throw new Error("Not authenticated");
        }

        // TODO: Implement API call to fetch tickets
        // This will be implemented once the API endpoint is available
        // For now, using mock data
        const mockTickets: TicketEnhanced[] = [
          {
            id: "T-12345",
            user_id: "U-001",
            ticket_type: "VIP",
            status: TicketStatus.VALID,
            purchase_date: "2024-03-14",
            price: 150,
            eventName: "Future Music Festival",
            date: "March 15, 2025",
            time: "8:00 PM",
            venue: "Tech Arena",
            section: "A",
            row: "10",
            seat: "15",
            isBlockchainVerified: true,
            transferLimit: 2,
            transfersUsed: 1,
            tokenId: "0x7a69...4e21",
            name: "Future Music Festival",
            quantity: 1,
            remaining_tickets: 1,
            sale_start_date: "2024-03-14",
            sale_end_date: "2024-03-15",
            event: "E-001",
            is_active: true,
            flash_sale: null,
            created_at: "2024-03-14",
            images: [
              "/placeholder.svg?height=200&width=400&text=Music+Festival+1",
              "/placeholder.svg?height=200&width=400&text=Music+Festival+2",
              "/placeholder.svg?height=200&width=400&text=Music+Festival+3",
            ],
          },
          {
            id: "T-12346",
            user_id: "U-001",
            ticket_type: "General",
            status: TicketStatus.VALID,
            purchase_date: "2024-03-15",
            price: 75,
            eventName: "Rock Revolution",
            date: "April 20, 2025",
            time: "7:30 PM",
            venue: "Stadium Arena",
            section: "B",
            row: "15",
            seat: "22",
            isBlockchainVerified: true,
            transferLimit: 3,
            transfersUsed: 0,
            tokenId: "0x8b79...5f32",
            name: "Rock Revolution",
            quantity: 1,
            remaining_tickets: 1,
            sale_start_date: "2024-03-15",
            sale_end_date: "2024-04-19",
            event: "E-002",
            is_active: true,
            flash_sale: null,
            created_at: "2024-03-15",
            images: [
              "/placeholder.svg?height=200&width=400&text=Rock+Concert+1",
              "/placeholder.svg?height=200&width=400&text=Rock+Concert+2",
              "/placeholder.svg?height=200&width=400&text=Rock+Concert+3",
            ],
          },
          {
            id: "T-12347",
            ticket_type: "Premium",
            status: TicketStatus.VALID,
            purchase_date: "2024-03-16",
            price: 200,
            eventName: "EDM Night",
            date: "May 5, 2025",
            time: "9:00 PM",
            venue: "Club Max",
            section: "VIP",
            row: "2",
            seat: "8",
            isBlockchainVerified: true,
            transferLimit: 1,
            transfersUsed: 0,
            tokenId: "0x9c89...6e43",
            name: "EDM Night",
            quantity: 1,
            remaining_tickets: 1,
            sale_start_date: "2024-03-16",
            sale_end_date: "2024-05-04",
            event: "E-003",
            is_active: true,
            flash_sale: null,
            created_at: "2024-03-16",
            images: [
              "/placeholder.svg?height=200&width=400&text=EDM+Night+1",
              "/placeholder.svg?height=200&width=400&text=EDM+Night+2",
              "/placeholder.svg?height=200&width=400&text=EDM+Night+3",
            ],
          },

          // Add more mock tickets as needed
        ];

        setTickets(mockTickets);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch tickets"
        );
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-primary">Loading your tickets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-destructive">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            <span className="text-primary">My Tickets</span>
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("showcase")}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === "showcase"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Showcase
            </button>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No tickets found</p>
          </div>
        ) : viewMode === "showcase" ? (
          <div className="flex justify-center">
            <EnhancedTicketShowcase />
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 md:gap-6"
          >
            {tickets.map((ticket) => (
              <EnhancedTicketCard
                key={ticket.id}
                id={ticket.id}
                eventName={ticket.event_title}
                date={ticket.created_at || ""}
                time={ticket.created_at || ""}
                venue={ticket.event_title}
                price={ticket.purchase_price}
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
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
