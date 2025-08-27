"use client";

import { EventStatus } from "@/types/event";
import TeamOverviewCard from "@/components/dashboard/event/overview/TeamOverviewCard";
import { formatDateTime } from "@/lib/utils";
import { useEvent } from "@/hooks/useEvent";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export function OverviewContent({ eventId }: { eventId: string }) {
  const { useEvent: useSingleEvent, usePublishEvent } = useEvent();
  const router = useRouter();

  const { data: event, isLoading, error } = useSingleEvent(eventId);
  const publishEvent = usePublishEvent();

  const handlePublish = async () => {
    try {
      if (eventId) {
        await publishEvent.mutateAsync(eventId);
      }
    } catch (error) {
      console.error("Error publishing event:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center mt-10 text-lg text-muted-foreground">
        Loading event details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-lg text-red-500">
        Error: {error.message}
      </div>
    );
  }

  if (!event?.result) {
    return (
      <div className="text-center mt-10 text-lg text-muted-foreground">
        Event not found.
      </div>
    );
  }

  const isPublished = event.result.status === EventStatus.PUBLISHED;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <section className="mb-8 sm:mb-12">
          <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
            <div className="flex flex-col justify-center space-y-6 sm:space-y-8">
              <div className="space-y-6">
                <p className="text-lg font-semibold text-primary tracking-wide">
                  {formatDateTime(event.result.start_date)}
                </p>

                <h1 className="text-5xl font-bold text-foreground leading-tight sm:text-6xl lg:text-7xl">
                  {event.result.title}
                </h1>

                <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                  {event.result.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:gap-4">
                {!isPublished && (
                  <button
                    className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-semibold text-primary-foreground shadow-lg transition-all duration-200 hover:bg-primary/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]"
                    onClick={handlePublish}
                    disabled={publishEvent.isPending}
                  >
                    {publishEvent.isPending ? "Publishing..." : "Publish Event"}
                  </button>
                )}

                <button
                  onClick={() => router.push(ROUTES.DASHBOARD_EVENT_EDIT(eventId))}
                  className="inline-flex items-center justify-center rounded-2xl bg-secondary px-5 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-semibold text-secondary-foreground shadow-lg transition-all duration-200 hover:bg-secondary/80 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 active:scale-[0.98]"
                >
                  Edit Details
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square overflow-hidden rounded-2xl sm:rounded-3xl bg-muted shadow-2xl ring-1 ring-black/5">
                {event.result.cover_image ? (
                  <img
                    src={event.result.cover_image}
                    loading="lazy"
                    alt={event.result.title}
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <p className="text-muted-foreground">No image available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-xl bg-card p-4 sm:p-6 shadow ring-1 ring-border/40">
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="mt-2 text-lg sm:text-xl font-semibold">{isPublished ? 'Published' : 'Draft'}</div>
          </div>
          <div className="rounded-xl bg-card p-4 sm:p-6 shadow ring-1 ring-border/40">
            <div className="text-sm text-muted-foreground">Start</div>
            <div className="mt-2 text-lg sm:text-xl font-semibold">{formatDateTime(event.result.start_date)}</div>
          </div>
          <div className="rounded-xl bg-card p-4 sm:p-6 shadow ring-1 ring-border/40">
            <div className="text-sm text-muted-foreground">Venue</div>
            <div className="mt-2 text-lg sm:text-xl font-semibold truncate">{event.result.venue || 'TBA'}</div>
          </div>
          <div className="col-span-2 sm:col-span-3">
            <TeamOverviewCard eventId={eventId} />
          </div>
        </section>

        <section className="mt-6 sm:mt-10 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <Link href={ROUTES.DASHBOARD_EVENT_DETAILS(eventId)} className="rounded-xl bg-card p-4 sm:p-6 shadow ring-1 ring-border/40 hover:ring-border transition">
            <div className="text-sm text-muted-foreground">Overview</div>
            <div className="mt-2 text-lg sm:text-xl font-semibold">Insights</div>
          </Link>
          <Link href={ROUTES.DASHBOARD_EVENT_ANALYTICS(eventId)} className="rounded-xl bg-card p-4 sm:p-6 shadow ring-1 ring-border/40 hover:ring-border transition">
            <div className="text-sm text-muted-foreground">Analytics</div>
            <div className="mt-2 text-lg sm:text-xl font-semibold">Performance</div>
          </Link>
          <Link href={ROUTES.DASHBOARD_EVENT_ATTENDEES(eventId)} className="rounded-xl bg-card p-4 sm:p-6 shadow ring-1 ring-border/40 hover:ring-border transition">
            <div className="text-sm text-muted-foreground">Attendees</div>
            <div className="mt-2 text-lg sm:text-xl font-semibold">Manage</div>
          </Link>
          <Link href={ROUTES.DASHBOARD_EVENT_TICKETS(eventId)} className="rounded-xl bg-card p-4 sm:p-6 shadow ring-1 ring-border/40 hover:ring-border transition">
            <div className="text-sm text-muted-foreground">Tickets</div>
            <div className="mt-2 text-lg sm:text-xl font-semibold">Configure</div>
          </Link>
          <Link href={ROUTES.DASHBOARD_EVENT_PAYMENTS(eventId)} className="rounded-xl bg-card p-4 sm:p-6 shadow ring-1 ring-border/40 hover:ring-border transition">
            <div className="text-sm text-muted-foreground">Payments</div>
            <div className="mt-2 text-lg sm:text-xl font-semibold">Payouts</div>
          </Link>
          <Link href={ROUTES.DASHBOARD_EVENT_PROMOTIONS(eventId)} className="rounded-xl bg-card p-4 sm:p-6 shadow ring-1 ring-border/40 hover:ring-border transition">
            <div className="text-sm text-muted-foreground">Promotions</div>
            <div className="mt-2 text-lg sm:text-xl font-semibold">Boost</div>
          </Link>
        </section>
      </div>
    </div>
  );
}
