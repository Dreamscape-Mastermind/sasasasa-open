'use client'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar, MapPin, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useMyEvents } from '@/lib/hooks/useEvents';
import { Event } from '@/types';


// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(',', '');
};
let events: Event[] = [];

export default function EventsPage() {
  const { data: userEvents, isLoading, isError } = useMyEvents();
  if (!isLoading && userEvents) {
    events = userEvents.results ? [...userEvents.results] : [];
    console.log({ userEvents: userEvents.results});
  }

  // Helper to parse and compare dates
  const now = new Date();

  const [currentEvents, pastEvents] = events.reduce<[typeof events, typeof events]>(
    ([current, past]: any, event: { start_date: string | number | Date; }) => {
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
        <Link href="/dashboard/events/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            className="w-full pl-9"
            type="search"
          />
        </div>
        <Button variant="outline">Filters</Button>
      </div>

      {/* Current Events */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Current Events</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentEvents.length === 0 && (
            <p className="text-muted-foreground">No current events.</p>
          )}
          {currentEvents.map((event) => (
            <Link href={`/dashboard/events/${event.id}/overview`} key={event.id}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  <img
                    src={event.cover_image ? event.cover_image : ''}
                    alt={event.title}
                    className="object-cover w-full h-full"
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
                      {event.location}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {event.description}
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
            <Link href={`/dashboard/events/${event.id}/overview`} key={event.id}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  <img
                    src={event.cover_image}
                    alt={event.title}
                    className="object-cover w-full h-full"
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
                      {event.location}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {event.description}
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
