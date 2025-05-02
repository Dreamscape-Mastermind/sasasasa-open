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
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState } from "react";

const events = [
  { id: 1, name: "Event 1" },
  { id: 2, name: "Event 2" },
  { id: 3, name: "Event 3" },
];

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
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState(events[0]);

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-card">
      {/* Event Dropdown */}
      <div className="px-3 py-2">
        <Select
          value={selectedEvent.id.toString()}
          onValueChange={(value) => {
            const event = events.find((event) => event.id === parseInt(value));
            if (event) {
              setSelectedEvent(event);
              router.push(`/dashboard/events/${event.id}/analytics`);
            }
          }}
        >
          <SelectTrigger className="mb-4 w-full">
            <SelectValue placeholder="Select an event" />
          </SelectTrigger>
          <SelectContent>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id.toString()}>
                {event.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Event Menus Section */}
      <div className="px-3">
        <div className="bg-purple-400 p-4 rounded-lg ">
          <h3 className="font-bold text-lg text-white">Event Management</h3>
          <div className="space-y-1">
            {eventMenus.map((menu) => (
              <Link
                key={menu.href}
                href={menu.href.replace(
                  "{eventId}",
                  selectedEvent.id.toString()
                )}
              >
                <Button
                  variant={
                    pathname.includes(
                      menu.href.replace(
                        "{eventId}",
                        selectedEvent.id.toString()
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
                        selectedEvent.id.toString()
                      )
                    ) && "bg-blue-500 text-white font-bold"
                  )}
                >
                  <menu.icon className="h-4 w-4 text-white" />
                  <span className="text-white">{menu.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* User Menus Section */}
      <div className="px-3">
        <div className="p-4 rounded-lg bg-gray-800">
          <h3 className="font-bold text-lg text-white">User Settings</h3>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-1">
              {userMenus.map((menu) => (
                <Link key={menu.href} href={menu.href}>
                  <Button
                    variant={pathname === menu.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-2",
                      pathname === menu.href &&
                        "bg-blue-500 text-white font-bold"
                    )}
                  >
                    <menu.icon className="h-4 w-4 text-white" />
                    <span className="text-white">{menu.label}</span>
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
