"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edit, Loader2, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useState } from "react";
import { useTicket } from "@/hooks/useTicket";

interface TicketListProps {
  eventId: string;
  onEditTicket: (ticket: any) => void;
}

export default function TicketList({ eventId, onEditTicket }: TicketListProps) {
  const [deletingTicketId, setDeletingTicketId] = useState<string | null>(null);

  const { useTicketTypes, useDeleteTicketType } = useTicket();
  const { data: tickets, isLoading } = useTicketTypes(eventId);
  const deleteTicket = useDeleteTicketType(eventId);

  const handleDeleteTicket = async (ticketId: string) => {
    setDeletingTicketId(ticketId);
    try {
      await deleteTicket.mutateAsync(ticketId);
    } catch (error) {
      console.error("Error deleting ticket:", error);
    } finally {
      setDeletingTicketId(null);
    }
  };

  const getStatusBadge = (ticket: any) => {
    const now = new Date();
    const startDate = new Date(ticket.sale_start_date);
    const endDate = new Date(ticket.sale_end_date);
    const isSoldOut = ticket.remaining_tickets === 0;

    if (isSoldOut) {
      return <Badge variant="destructive">Sold Out</Badge>;
    } else if (now < startDate) {
      return <Badge variant="secondary">Not Started</Badge>;
    } else if (now > endDate) {
      return <Badge variant="destructive">Ended</Badge>;
    } else {
      return <Badge variant="default">Active</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 4, 5, 6].map((i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!tickets?.result?.results || tickets.result.results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Edit className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No tickets created yet
        </h3>
        <p className="text-muted-foreground">
          Create your first ticket type to start selling tickets for your event.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tickets.result.results.map((ticket) => (
        <Card key={ticket.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{ticket.name}</CardTitle>
                <CardDescription className="mt-1">
                  {ticket.description}
                </CardDescription>
              </div>
              {getStatusBadge(ticket)}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Price
                </p>
                <p className="text-lg font-bold text-foreground">
                  ${ticket.price}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Available
                </p>
                <p className="text-lg font-bold text-foreground">
                  {ticket.remaining_tickets} / {ticket.quantity}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sale Start:</span>
                <span className="font-medium">
                  {format(new Date(ticket.sale_start_date), "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sale End:</span>
                <span className="font-medium">
                  {format(new Date(ticket.sale_end_date), "MMM d, yyyy")}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => onEditTicket(ticket)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    disabled={deletingTicketId === ticket.id}
                  >
                    {deletingTicketId === ticket.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Ticket Type</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{ticket.name}"? This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteTicket(ticket.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
