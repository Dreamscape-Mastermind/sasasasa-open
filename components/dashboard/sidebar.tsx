"use client";

import {
  BarChart2,
  Calendar,
  CreditCard,
  Layout,
  Settings,
  Ticket,
  Users,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "services/events/api";

// Borrow the interfaces from dashboard page
interface ApiResponse {
  status: string;
  message: string;
  result: {
    count: number;
    results: Event[];
  };
}

interface Event {
  id: string;
  title: string;
  status: "PUBLISHED" | "DRAFT";
}

const eventMenus = [
  {
    label: "Analytics",
    icon: BarChart2,
    href: "/dashboard/events/{eventId}/analytics",
  },
  {
    label: "Event Details",
    icon: Layout,
    href: "/dashboard/events/{eventId}/details",
  },
  {
    label: "Tickets",
    icon: Ticket,
    href: "/dashboard/events/{eventId}/tickets",
  },
  {
    label: "Attendees",
    icon: Users,
    href: "/dashboard/events/{eventId}/attendees",
  },
  {
    label: "Payments",
    icon: CreditCard,
    href: "/dashboard/events/{eventId}/payments",
  },
  {
    label: "Promotions",
    icon: Calendar,
    href: "/dashboard/events/{eventId}/promotions",
  },
  {
    label: "Reports",
    icon: BarChart2,
    href: "/dashboard/events/{eventId}/reports",
  },
];

const userMenus = [
  {
    label: "Dashboard",
    icon: Layout,
    href: "/dashboard",
  },
  {
    label: "Events",
    icon: Calendar,
    href: "/dashboard/events",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
  {
    label: "My Purchases",
    icon: Ticket,
    href: "/dashboard/purchases",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Fetch events data
  const { data: eventsData, isLoading } = useQuery<ApiResponse>({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  // Get the currently selected event
  const selectedEvent = useMemo(() => {
    if (!eventsData?.result.results || !selectedEventId) {
      // Default to first event if none selected
      return eventsData?.result.results[0];
    }
    return eventsData.result.results.find(event => event.id === selectedEventId);
  }, [eventsData, selectedEventId]);

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-card">
      {/* Event Dropdown */}
      <div className="px-3 py-2">
        <Select
          value={selectedEventId || eventsData?.result.results[0]?.id}
          onValueChange={(value) => {
            setSelectedEventId(value);
            router.push(`/dashboard/events/${value}/analytics`);
          }}
        >
          <SelectTrigger className="mb-4 w-full">
            <SelectValue placeholder="Select an event">
              {selectedEvent?.title || "Select an event"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {eventsData?.result.results.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Event Menus Section */}
      <div className="px-3">
        <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
          <h3 className="font-bold text-lg text-foreground">Event Management</h3>
          <div className="space-y-1">
            {eventMenus.map((menu) => (
              <Link
                key={menu.href}
                href={menu.href.replace(
                  "{eventId}",
                  selectedEventId || eventsData?.result.results[0]?.id || ""
                )}
              >
                <Button
                  variant={
                    pathname.includes(
                      menu.href.replace(
                        "{eventId}",
                        selectedEventId || eventsData?.result.results[0]?.id || ""
                      )
                    )
                      ? "secondary"
                      : "ghost"
                  }
                  className={cn(
                    "w-full justify-start gap-2",
                    pathname.includes(
                      menu.href.replace(
                        "{eventId}",
                        selectedEventId || eventsData?.result.results[0]?.id || ""
                      )
                    ) && "bg-primary text-primary-foreground font-medium"
                  )}
                >
                  <menu.icon className="h-4 w-4" />
                  <span>{menu.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* User Menus Section */}
      <div className="px-3">
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <h3 className="font-bold text-lg text-foreground">User Settings</h3>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-1">
              {userMenus.map((menu) => (
                <Link key={menu.href} href={menu.href}>
                  <Button
                    variant={pathname === menu.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-2",
                      pathname === menu.href &&
                        "bg-primary text-primary-foreground font-medium"
                    )}
                  >
                    <menu.icon className="h-4 w-4" />
                    <span>{menu.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
