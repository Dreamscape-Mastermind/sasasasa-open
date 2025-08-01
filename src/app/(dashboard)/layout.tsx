"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileEventSelector } from "@/components/dashboard/MobileEventSelector";
import { useEvent } from "@/hooks/useEvent";
import { Event } from "@/types/event";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const { useEvents } = useEvent();
  const { data: eventsData, isLoading: eventsLoading } = useEvents();

  const events = eventsData?.result?.results || [];

  // Set the first event as selected when events load
  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex">
        <Sidebar />
        <div className="flex-1 w-full">
          <MobileEventSelector
            events={events}
            selectedEventId={selectedEventId}
            onEventSelect={handleEventSelect}
            isLoading={eventsLoading}
          />
          <main className="min-h-screen overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
