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
import { Calendar, Clock, DollarSign, Tag, Users } from "lucide-react";
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
  const { data: tickets, isLoading } = useTicketTypes(eventId, {
    ordering: "-created_at",
  });
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

  const getSystemAttributes = (customAttributes: any) => {
    const systemKeys = [
      "is_auto_generated",
      "complementary_policy",
      "parent_ticket_type_id",
    ];
    const systemAttrs: any = {};
    const userAttrs: any = {};

    Object.entries(customAttributes || {}).forEach(([key, value]) => {
      if (systemKeys.includes(key)) {
        systemAttrs[key] = value;
      } else {
        userAttrs[key] = value;
      }
    });

    return { systemAttrs, userAttrs };
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 4, 5, 6].map((i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 sm:h-6 w-3/4" />
                  <Skeleton className="h-3 sm:h-4 w-full" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 sm:gap-4 p-2 sm:p-3 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-4 sm:h-5 w-16" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 sm:h-5 w-20" />
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

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {tickets.result.results.map((ticket) => (
        <Card key={ticket.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base sm:text-lg flex flex-wrap items-center gap-1 mb-1">
                  <span className="truncate">{ticket.name}</span>
                  <div className="flex flex-wrap gap-1">
                    {ticket.is_free && (
                      <Badge variant="secondary" className="text-xs">
                        Free
                      </Badge>
                    )}
                    {!ticket.is_active && (
                      <Badge variant="outline" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                    {!ticket.is_public && (
                      <Badge variant="secondary" className="text-xs">
                        Private
                      </Badge>
                    )}
                  </div>
                </CardTitle>
                <CardDescription className="text-sm line-clamp-2">
                  {ticket.description || "No description provided"}
                </CardDescription>
              </div>
              <div className="flex-shrink-0">{getStatusBadge(ticket)}</div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Price and Availability */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 p-2 sm:p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">Price</span>
                </p>
                <p className="text-sm sm:text-lg font-bold text-foreground truncate">
                  {ticket.is_free
                    ? "Free"
                    : `KES ${parseFloat(ticket.price).toFixed(2)}`}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                  Available
                </p>
                <p className="text-sm sm:text-lg font-bold text-foreground">
                  {ticket.remaining_tickets} / {ticket.quantity}
                </p>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1 min-w-0">
                  <Clock className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">Timeout:</span>
                </span>
                <span className="font-medium text-right">
                  {ticket.reserve_timeout_minutes} min
                </span>
              </div>
              {ticket.per_user_purchase_limit && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1 min-w-0">
                    <Users className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">Limit:</span>
                  </span>
                  <span className="font-medium text-right">
                    {ticket.per_user_purchase_limit} per user
                  </span>
                </div>
              )}
            </div>

            {/* Sale Period */}
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1 min-w-0">
                  <Calendar className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">Sale Start:</span>
                </span>
                <span className="font-medium text-right text-xs sm:text-sm">
                  {format(new Date(ticket.sale_start_date), "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground truncate">
                  Sale End:
                </span>
                <span className="font-medium text-right text-xs sm:text-sm">
                  {format(new Date(ticket.sale_end_date), "MMM d, yyyy")}
                </span>
              </div>
            </div>

            {/* Complementary Policy */}
            {ticket.has_complementary_policy && (
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                  <Users className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">Complementary Policy:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {ticket.complementary_ratio}:1 ratio
                  </Badge>
                  {ticket.complementary_max_per_purchase && (
                    <Badge variant="outline" className="text-xs">
                      Max {ticket.complementary_max_per_purchase} per purchase
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    Auto-created
                  </Badge>
                </div>
              </div>
            )}

            {/* System Attributes */}
            {(() => {
              const { systemAttrs, userAttrs } = getSystemAttributes(
                ticket.custom_attributes
              );
              const hasSystemAttrs = Object.keys(systemAttrs).length > 0;
              const hasUserAttrs = Object.keys(userAttrs).length > 0;

              return (
                <>
                  {/* System Attributes */}
                  {hasSystemAttrs && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                        <Tag className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">System Info:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {systemAttrs.is_auto_generated && (
                          <Badge variant="secondary" className="text-xs">
                            Auto-generated
                          </Badge>
                        )}
                        {systemAttrs.complementary_policy && (
                          <Badge variant="outline" className="text-xs">
                            Policy: {systemAttrs.complementary_policy.ratio}:1
                            {systemAttrs.complementary_policy
                              .max_per_purchase &&
                              ` (max ${systemAttrs.complementary_policy.max_per_purchase})`}
                          </Badge>
                        )}
                        {systemAttrs.parent_ticket_type_id && (
                          <Badge variant="outline" className="text-xs">
                            Parent Ticket
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* User Custom Attributes */}
                  {hasUserAttrs && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                        <Tag className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">Custom Attributes:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(userAttrs)
                          .slice(0, 3)
                          .map(([key, value]) => (
                            <Badge
                              key={key}
                              variant="outline"
                              className="text-xs"
                            >
                              {key}:{" "}
                              {Array.isArray(value)
                                ? value.join(", ")
                                : String(value)}
                            </Badge>
                          ))}
                        {Object.keys(userAttrs).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{Object.keys(userAttrs).length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                onClick={() => onEditTicket(ticket)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Edit</span>
                <span className="sm:hidden">Edit Ticket</span>
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
                    <span className="hidden sm:inline">Delete</span>
                    <span className="sm:hidden">Delete Ticket</span>
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
