"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
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
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                <Tag className="h-5 w-5 sm:h-6 sm:w-6" />
                Ticket Types
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Create and manage different ticket categories for your event
                with advanced pricing, limits, and custom attributes
              </CardDescription>
            </div>
            <Button
              onClick={handleCreateTicket}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Ticket Type</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </div>
        </CardHeader>
      </Card>

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
