"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileEventSelector } from "@/components/dashboard/MobileEventSelector";
import { useEvent } from "@/hooks/useEvent";
import { Event } from "@/types/event";

import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

import { useMobile } from "@/hooks/use-mobile";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const { useMyEvents } = useEvent();
  const { data: eventsData, isLoading: eventsLoading } = useMyEvents();
  const { isSidebarOpen } = useSidebar();
  const isMobile = useMobile();

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
        {!isMobile && <Sidebar />}
        <div
          className={cn(
            "flex-1 w-full transition-all duration-300 ease-in-out",
            !isMobile && (isSidebarOpen ? "ml-64" : "ml-20")
          )}
        >
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
