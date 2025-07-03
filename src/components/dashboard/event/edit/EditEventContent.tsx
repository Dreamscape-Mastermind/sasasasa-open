"use client";

import EventForm from "@/components/forms/event-form";
import CreateEvent from "@/app/(dashboard)/dashboard/events/create/page";

export function EditEventContent({ eventId }: { eventId: string }) {
  return (
    <CreateEvent eventId={eventId} />
  );
}
