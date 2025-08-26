"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import TicketFormPopup from "./TicketFormPopup";
import TicketList from "./TicketList";
import { useState } from "react";

export function TicketsContent({ eventId }: { eventId: string }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<any>(null);

  const handleEditTicket = (ticket: any) => {
    setEditingTicket(ticket);
    setIsFormOpen(true);
  };

  const handleCreateTicket = () => {
    setEditingTicket(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTicket(null);
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Ticket Types</h2>
          <p className="text-sm text-muted-foreground">
            Manage ticket types for this event
          </p>
        </div>
        <Button
          onClick={handleCreateTicket}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Ticket Type
        </Button>
      </div>

      <TicketList eventId={eventId} onEditTicket={handleEditTicket} />

      <TicketFormPopup
        eventId={eventId}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        editingTicket={editingTicket}
      />
    </div>
  );
}

// Skeleton component for when the entire tickets section is loading
export function TicketsContentSkeleton() {
  return (
    <div className="space-y-6 animate-in">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>

            <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 flex-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
