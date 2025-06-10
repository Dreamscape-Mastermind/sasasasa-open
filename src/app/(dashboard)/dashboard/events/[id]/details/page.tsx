"use client";

import { Calendar, Clock, MapPin, Share2, Ticket, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { TicketType } from "@/types/ticket";
import moment from "moment-timezone";
import { useEvent } from "@/hooks/useEvent";
import { useParams } from "next/navigation";

function EventDetailsContent() {
  const eventId = useParams().id as string;

  const { useEvent: useEventQuery } = useEvent();
  const { data: eventData, isLoading, error } = useEventQuery(eventId || "");
  const currentEvent = eventData?.result;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-cyan-400">Loading event details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-yellow-500">Event not found</div>
      </div>
    );
  }

  // Format dates using moment-timezone with proper timezone handling
  const timezone = currentEvent.timezone || "UTC";
  const startDate = currentEvent.start_date
    ? moment.tz(currentEvent.start_date, timezone).format("MMM D, YYYY")
    : "TBA";
  const startTime = currentEvent.start_date
    ? moment.tz(currentEvent.start_date, timezone).format("h:mm A")
    : "TBA";

  // Calculate tickets sold correctly based on the data structure
  const ticketsSold =
    currentEvent.available_tickets?.reduce(
      (total, ticket) =>
        total + (Number(ticket.quantity) - Number(ticket.remaining_tickets)),
      0
    ) || 0;

  return (
    <div className="space-y-6 animate-in pb-8">
      <div className="relative h-[300px] -mx-6 -mt-6">
        <div className="absolute inset-0">
          <img
            src={currentEvent.cover_image || "https://placehold.co/1200x400/"}
            alt={currentEvent.title}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-background/20" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold">{currentEvent.title}</h1>
              <div className="flex gap-4 text-sm mt-2">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {startDate}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {startTime}
                </div>
              </div>
            </div>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{currentEvent.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {currentEvent.venue}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-4 aspect-video bg-muted rounded-lg" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tickets</CardTitle>
              <CardDescription>Select your ticket type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentEvent.available_tickets?.map((ticket: TicketType) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-semibold">{ticket.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Ticket className="h-4 w-4" />
                      {ticket.remaining_tickets} available
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${ticket.price}</div>
                    <Button size="sm" className="mt-2">
                      Buy Ticket
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Capacity
                </div>
                <span className="font-semibold">{currentEvent.capacity}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4" />
                  Tickets Sold
                </div>
                <span className="font-semibold">{ticketsSold}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function EventDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-cyan-400">Loading event details...</div>
        </div>
      }
    >
      <EventDetailsContent />
    </Suspense>
  );
}
