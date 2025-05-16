'use client'
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { BarChart2, Users, Ticket, CreditCard, Megaphone } from 'lucide-react';
import { useEvent } from '@/lib/hooks/useEvents';
import { formatDateTime } from '@/lib/utils';


export default function EventLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const eventId = params.id as string;

  const { data: event, isLoading, error } = useEvent(eventId);

  if (isLoading) {
    return <div className="text-center mt-10 text-lg text-muted-foreground">Loading event details...</div>;
  }

  // const event = events.find(e => e.id === eventId);

  if (!event) {
    return <div className="text-center mt-10 text-lg text-muted-foreground">Event not found.</div>;
  }

  return (
    <>
      <div className="bg-white sm:pb-2 lg:pb-2">
        <div className="mx-auto max-w-screen-2xl px-1 md:px-2">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">{event.title}</h1>
            <p className="text-xl text-[#CC322D]">{formatDateTime(event.start_date)}</p>
          </div>
          <nav className="mb-8 bg-gray-50 border rounded-lg">
            <div className="flex justify-between px-6 py-3">
              <Link
                href={`/dashboard/events/${eventId}/overview`}
                className={`flex flex-col items-center text-sm hover:text-primary relative ${pathname === `/dashboard/events/${eventId}/overview`
                    ? 'text-[#CC322D] after:absolute after:bottom-[-12px] after:left-0 after:w-full after:h-0.5 after:bg-[#CC322D]'
                    : 'text-muted-foreground'
                  }`}
              >
                <BarChart2 className="h-5 w-5 mb-1" />
                Overview
              </Link>
              <Link
                href={`/dashboard/events/${eventId}/analytics`}
                className={`flex flex-col items-center text-sm hover:text-primary relative ${pathname === `/dashboard/events/${eventId}/analytics`
                    ? 'text-[#CC322D] after:absolute after:bottom-[-12px] after:left-0 after:w-full after:h-0.5 after:bg-[#CC322D]'
                    : 'text-muted-foreground'
                  }`}
              >
                <BarChart2 className="h-5 w-5 mb-1" />
                Analytics
              </Link>
              <Link
                href={`/dashboard/events/${eventId}/attendees`}
                className={`flex flex-col items-center text-sm hover:text-primary relative ${pathname === `/dashboard/events/${eventId}/attendees`
                    ? 'text-[#CC322D] after:absolute after:bottom-[-12px] after:left-0 after:w-full after:h-0.5 after:bg-[#CC322D]'
                    : 'text-muted-foreground'
                  }`}
              >
                <Users className="h-5 w-5 mb-1" />
                Attendees
              </Link>
              <Link
                href={`/dashboard/events/${eventId}/tickets`}
                className={`flex flex-col items-center text-sm hover:text-primary relative ${pathname === `/dashboard/events/${eventId}/tickets`
                    ? 'text-[#CC322D] after:absolute after:bottom-[-12px] after:left-0 after:w-full after:h-0.5 after:bg-[#CC322D]'
                    : 'text-muted-foreground'
                  }`}
              >
                <Ticket className="h-5 w-5 mb-1" />
                Tickets
              </Link>
              <Link
                href={`/dashboard/events/${eventId}/payments`}
                className={`flex flex-col items-center text-sm hover:text-primary relative ${pathname === `/dashboard/events/${eventId}/payments`
                    ? 'text-[#CC322D] after:absolute after:bottom-[-12px] after:left-0 after:w-full after:h-0.5 after:bg-[#CC322D]'
                    : 'text-muted-foreground'
                  }`}
              >
                <CreditCard className="h-5 w-5 mb-1" />
                Payments
              </Link>
              <Link
                href={`/dashboard/events/${eventId}/promotions`}
                className={`flex flex-col items-center text-sm hover:text-primary relative ${pathname === `/dashboard/events/${eventId}/promotions`
                    ? 'text-[#CC322D] after:absolute after:bottom-[-12px] after:left-0 after:w-full after:h-0.5 after:bg-[#CC322D]'
                    : 'text-muted-foreground'
                  }`}
              >
                <Megaphone className="h-5 w-5 mb-1" />
                Promotions
              </Link>
            </div>
          </nav>

        </div>
      </div>

      <div className="mt-1">
        {children}
      </div></>
  );
}

