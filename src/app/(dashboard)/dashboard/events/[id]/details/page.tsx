'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  MapPin,
  Share2,
  Ticket,
  Users,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { fetchEventById } from 'services/events/api';
import { SasasasaEvent } from '@/utils/dataStructures';

export default function EventDetailsPage() {
  const params = useParams();

  const { data: event, isLoading } = useQuery<SasasasaEvent>({
    queryKey: ['event', params.id],
    queryFn: () => fetchEventById(params.id as string),
  });

  if (isLoading) return <div>Loading...</div>;
  if (!event) return <div>Event not found</div>;

  return (
    <div className="space-y-6 animate-in pb-8">
      <div className="relative h-[300px] -mx-6 -mt-6">
        <div className="absolute inset-0">
          <img
            src={event.cover_image || 'https://placehold.co/1200x400/'}
            alt={event.title}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-background/20" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold">{event.title}</h1>
              <div className="flex gap-4 text-sm mt-2">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(event.start_date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(event.start_date).toLocaleTimeString()}
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
              <p className="whitespace-pre-line">{event.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {event.venue}
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
              {event.other_tickets?.map((ticket) => (
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
                <span className="font-semibold">{event.capacity}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4" />
                  Tickets Sold
                </div>
                <span className="font-semibold">
                  {event.other_tickets?.reduce((total, ticket) => 
                    total + (ticket.quantity - ticket.remaining_tickets), 0
                  ) || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}