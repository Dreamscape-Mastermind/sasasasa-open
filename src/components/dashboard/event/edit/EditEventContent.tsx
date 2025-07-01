"use client";

import EventForm from "@/components/forms/event-form";
import CreateEvent from "@/app/(dashboard)/dashboard/events/create/page";

export function EditEventContent({ eventId }: { eventId: string }) {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-200 p-6">
      <div className="max-w-6xl mx-auto">
        <CreateEvent />
      </div>
    </div>
  );
}
