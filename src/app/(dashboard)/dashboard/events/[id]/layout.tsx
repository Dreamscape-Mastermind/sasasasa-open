"use client";

import { BarChart2, CreditCard, Megaphone, Ticket, Users } from "lucide-react";

import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";
import { use } from "react";
import { useEvent } from "@/hooks/useEvent";
import { usePathname } from "next/navigation";

export default function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const pathname = usePathname();
  const { id: eventId } = use(params);

  const { useEvent: useEventQuery } = useEvent();
  const { data: eventData, isLoading, error } = useEventQuery(eventId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-6 w-48" />
        </div>
        <nav className="mb-8 bg-muted border rounded-lg">
          <div className="flex justify-between px-6 py-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="h-5 w-5 mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </nav>
        <div className="mt-1">{children}</div>
      </div>
    );
  }

  if (!eventData?.result) {
    return (
      <div className="text-center mt-10 text-lg text-muted-foreground">
        Event not found.
      </div>
    );
  }

  const event = eventData.result;

  return (
    <>
      <div className="bg-transparent sm:pb-2 lg:pb-2">
        <div className="mx-auto px-1 md:px-2">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-foreground">
              {event.title}
            </h1>
            <p className="text-xl text-primary">
              {formatDateTime(event.start_date)}
            </p>
          </div>
          <nav className="mb-8 bg-muted border rounded-lg">
            <div className="flex justify-between px-6 py-3">
              <Link
                href={ROUTES.DASHBOARD_EVENT_DETAILS(eventId)}
                className={`flex flex-col items-center text-sm hover:text-primary relative ${
                  pathname === ROUTES.DASHBOARD_EVENT_DETAILS(eventId)
                    ? "text-primary after:absolute after:bottom-[-12px] after:left-0 after:w-full after:h-0.5 after:bg-primary"
                    : "text-muted-foreground"
                }`}
              >
                <BarChart2 className="h-5 w-5 mb-1" />
                Overview
              </Link>
              <Link
                href={ROUTES.DASHBOARD_EVENT_ANALYTICS(eventId)}
                className={`flex flex-col items-center text-sm hover:text-primary relative ${
                  pathname === ROUTES.DASHBOARD_EVENT_ANALYTICS(eventId)
                    ? "text-primary after:absolute after:bottom-[-12px] after:left-0 after:w-full after:h-0.5 after:bg-primary"
                    : "text-muted-foreground"
                }`}
              >
                <BarChart2 className="h-5 w-5 mb-1" />
                Analytics
              </Link>
              <Link
                href={ROUTES.DASHBOARD_EVENT_ATTENDEES(eventId)}
                className={`flex flex-col items-center text-sm hover:text-primary relative ${
                  pathname === ROUTES.DASHBOARD_EVENT_ATTENDEES(eventId)
                    ? "text-primary after:absolute after:bottom-[-12px] after:left-0 after:w-full after:h-0.5 after:bg-primary"
                    : "text-muted-foreground"
                }`}
              >
                <Users className="h-5 w-5 mb-1" />
                Attendees
              </Link>
              <Link
                href={ROUTES.DASHBOARD_EVENT_TICKETS(eventId)}
                className={`flex flex-col items-center text-sm hover:text-primary relative ${
                  pathname === ROUTES.DASHBOARD_EVENT_TICKETS(eventId)
                    ? "text-primary after:absolute after:bottom-[-12px] after:left-0 after:w-full after:h-0.5 after:bg-primary"
                    : "text-muted-foreground"
                }`}
              >
                <Ticket className="h-5 w-5 mb-1" />
                Tickets
              </Link>
              <Link
                href={ROUTES.DASHBOARD_EVENT_PAYMENTS(eventId)}
                className={`flex flex-col items-center text-sm hover:text-primary relative ${
                  pathname === ROUTES.DASHBOARD_EVENT_PAYMENTS(eventId)
                    ? "text-primary after:absolute after:bottom-[-12px] after:left-0 after:w-full after:h-0.5 after:bg-primary"
                    : "text-muted-foreground"
                }`}
              >
                <CreditCard className="h-5 w-5 mb-1" />
                Payments
              </Link>
              <Link
                href={ROUTES.DASHBOARD_EVENT_PROMOTIONS(eventId)}
                className={`flex flex-col items-center text-sm hover:text-primary relative ${
                  pathname === ROUTES.DASHBOARD_EVENT_PROMOTIONS(eventId)
                    ? "text-primary after:absolute after:bottom-[-12px] after:left-0 after:w-full after:h-0.5 after:bg-primary"
                    : "text-muted-foreground"
                }`}
              >
                <Megaphone className="h-5 w-5 mb-1" />
                Promotions
              </Link>
            </div>
          </nav>
        </div>
      </div>

      <div className="mt-1">{children}</div>
    </>
  );
}
