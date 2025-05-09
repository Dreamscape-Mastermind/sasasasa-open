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
import { useMyEvents } from 'services/events/queries';

let events = [
  {
    id: 1,
    title: 'Tech Conference 2025',
    start_date: 'March 15, 2025',
    location: 'San Francisco, CA',
    description: 'Join us for the biggest tech conference of the year.',
    cover_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
  },
  {
    id: 2,
    title: 'Music Festival',
    start_date: 'April 20, 2025',
    location: 'Austin, TX',
    description: 'A three-day music festival featuring top artists.',
    cover_image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=400&fit=crop',
  },
  {
    id: 3,
    title: 'Food & Wine Expo',
    start_date: 'May 10, 2025',
    location: 'New York, NY',
    description: 'Experience the finest cuisine and wines from around the world.',
    cover_image: 'https://images.unsplash.com/photo-1510924199351-4e9d94df18a6?w=800&h=400&fit=crop',
  },
];

export default function EventsPage() {
  const { data: userEvents, isLoading, isError } = useMyEvents();
  if (!isLoading && userEvents) {
    // events = userEvents.result.results;
    console.log({ userEvents: userEvents.result.results });
  }

  // Helper to parse and compare dates
  const now = new Date();

  const [currentEvents, pastEvents] = events.reduce<[typeof events, typeof events]>(
    ([current, past], event) => {
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
            <Link href={`/dashboard/events/${event.id}`} key={event.id}>
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
                      {event.start_date}
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
            <Link href={`/dashboard/events/${event.id}`} key={event.id}>
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
                      {event.start_date}
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