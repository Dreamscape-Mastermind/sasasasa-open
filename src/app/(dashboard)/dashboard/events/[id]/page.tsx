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
import { Calendar, MapPin, Plus, Search, BarChart2, Users, Ticket, CreditCard, Megaphone } from 'lucide-react';
import Link from 'next/link';
import { useMyEvents } from 'services/events/queries';
import { useParams } from 'next/navigation';

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

export default function EventDetailPage() {
  const params = useParams();
  const eventId = Number(params.id);

  const event = events.find(e => e.id === eventId);

  if (!event) {
    return <div className="text-center mt-10 text-lg text-muted-foreground">Event not found.</div>;
  }

  return (
    <div>
      
      {/* <img
        src={event.cover_image}
        alt={event.title}
        className="w-full h-64 object-cover rounded"
      />
      <h1 className="text-3xl font-bold mt-6 mb-2">{event.title}</h1>
      <p className="text-muted-foreground text-lg">{event.description}</p> */}

      {/* Navigation Bar (not fixed) */}
      {/* <nav className="mt-8 bg-gray-50 border rounded-lg">
        <div className="flex justify-between px-6 py-3">
          <Link href={`/dashboard/events/${eventId}/analytics`} className="flex flex-col items-center text-sm text-muted-foreground hover:text-primary">
            <BarChart2 className="h-5 w-5 mb-1" />
            Analytics
          </Link>
          <Link href={`/dashboard/events/${eventId}/attendees`} className="flex flex-col items-center text-sm text-muted-foreground hover:text-primary">
            <Users className="h-5 w-5 mb-1" />
            Attendees
          </Link>
          <Link href={`/dashboard/events/${eventId}/tickets`} className="flex flex-col items-center text-sm text-muted-foreground hover:text-primary">
            <Ticket className="h-5 w-5 mb-1" />
            Tickets
          </Link>
          <Link href={`/dashboard/events/${eventId}/payments`} className="flex flex-col items-center text-sm text-muted-foreground hover:text-primary">
            <CreditCard className="h-5 w-5 mb-1" />
            Payments
          </Link>
          <Link href={`/dashboard/events/${eventId}/promotions`} className="flex flex-col items-center text-sm text-muted-foreground hover:text-primary">
            <Megaphone className="h-5 w-5 mb-1" />
            Promotions
          </Link>
        </div>
      </nav> */}
    </div>
  );
}