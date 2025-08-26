"use client";

import { Calendar, MapPin, Plus, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Event } from "@/types";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useEvent } from "@/hooks/useEvent";

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date
    .toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(",", "");
};
let events: Event[] = [];

function EventsContent() {
  const [imageErrors, setImageErrors] = useState({});
  const { data: userEvents, isLoading, isError } = useEvent().useMyEvents();
  if (!isLoading && userEvents) {
    events = userEvents.result ? [...userEvents.result.results] : [];
  }

  // Helper to parse and compare dates
  const now = new Date();

  const [currentEvents, pastEvents] = events.reduce<
    [typeof events, typeof events]
  >(
    ([current, past]: any, event: { start_date: string | number | Date }) => {
      const eventDate = new Date(event.start_date);
      if (eventDate >= now) {
        return [[...current, event], past];
      } else {
        return [current, [...past, event]];
      }
    },
    [[], []]
  );

  return (
    <div className="space-y-6 animate-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Events</h1>
      </div>

      {/* Current Events */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Current Events</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentEvents.length === 0 && (
            <p className="text-muted-foreground">No current events.</p>
          )}
          {currentEvents.map((event) => (
            <Link
              href={`/dashboard/events/${event.id}/overview`}
              key={event.id}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  <img
                    src={imageErrors[event.id] ? '/images/placeholdere.jpeg' : event.cover_image || '/images/placeholdere.jpeg'}
                    alt={event.title}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      setImageErrors(prev => ({
                        ...prev,
                        [event.id]: true
                      }));
                    }}
                  />
                </div>
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      {formatDate(event.start_date)}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      {
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4" />
                          {event.location ? (
                            <span>{event.location.name}</span>
                          ) : (
                            <span>Location not available</span>
                          )}
                        </div>
                      }
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {event.description.slice(0, 100)}...
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Past Events */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Past Events</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pastEvents.length === 0 && (
            <p className="text-muted-foreground">No past events.</p>
          )}
          {pastEvents.map((event) => (
            <Link
              href={`/dashboard/events/${event.id}/overview`}
              key={event.id}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                <img
                    src={imageErrors[event.id] ? '/images/placeholdere.jpeg' : event.cover_image || '/images/placeholdere.jpeg'}
                    alt={event.title}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      setImageErrors(prev => ({
                        ...prev,
                        [event.id]: true
                      }));
                    }}
                  />
                </div>
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      {formatDate(event.start_date)}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      {event.location ? (
                        <span>{event.location.name}</span>
                      ) : (
                        <span>Location not available</span>
                      )}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {event.description.slice(0, 100)}...
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventsContent />
    </Suspense>
  );
}
