"use client";

import {
  BarChart2,
  Calendar,
  Check,
  ChevronsUpDown,
  CreditCard,
  FileText,
  FolderTree,
  Layout,
  MessageSquare,
  Settings,
  Tags,
  Ticket,
  Users,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Event } from "@/types/event";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useMyEvents } from "@/lib/hooks/useEvents";

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

const blogMenus = [
  {
    label: "Blog Posts",
    icon: FileText,
    href: "/dashboard/blog/posts",
  },
  {
    label: "Categories",
    icon: FolderTree,
    href: "/dashboard/blog/categories",
  },
  {
    label: "Tags",
    icon: Tags,
    href: "/dashboard/blog/tags",
  },
  {
    label: "Comments",
    icon: MessageSquare,
    href: "/dashboard/blog/comments",
  },
  {
    label: "Analytics",
    icon: BarChart2,
    href: "/dashboard/blog/analytics",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data: myEventsData, isLoading: isLoadingEvents } = useMyEvents();
  const events = myEventsData?.results || [];
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (
      events.length > 0 &&
      (!selectedEvent || !events.find((e) => e.id === selectedEvent.id))
    ) {
      setSelectedEvent(events[0]);
    }
  }, [events]);

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-card">
      {/* Event Dropdown */}
      <div className="px-3 py-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between rounded-xl bg-[#CC322D] px-4 py-2 text-sm font-medium text-white hover:bg-[#CC322D]/4 hover:font-extrabold hover:text-white"
              disabled={isLoadingEvents || events.length === 0}
            >
              {isLoadingEvents
                ? "Loading..."
                : selectedEvent
                ? selectedEvent.title
                : "No Events"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-full p-0 rounded-xl shadow-lg border-none bg-[#CC322D] px-4 text-sm font-medium text-white animate-fade-in-scale"
            sideOffset={8}
          >
            <Command className="rounded-xl bg-[#CC322D] text-white">
              <CommandInput
                placeholder="Search events..."
                className="bg-[#CC322D] text-white placeholder:text-white/60 focus:ring-0 focus:outline-none [&_svg]:text-white [&_svg]:opacity-100"
              />
              <CommandList>
                <CommandEmpty className="text-white">
                  {isLoadingEvents ? "Loading..." : "No event found."}
                </CommandEmpty>
                <CommandGroup>
                  {events &&
                    events.map((event) => (
                      <CommandItem
                        key={event.id}
                        value={event.title}
                        onSelect={() => {
                          setSelectedEvent(event);
                          setOpen(false);
                          router.push(
                            `/dashboard/events/${event.id}/analytics`
                          );
                        }}
                        className={cn(
                          "hover:bg-white/10 focus:bg-white/20 text-white font-medium rounded-lg transition-all cursor-pointer",
                          selectedEvent &&
                            selectedEvent.id === event.id &&
                            "bg-white/10 font-bold"
                        )}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedEvent && selectedEvent.id === event.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {event.title}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Event Menus Section */}
      {selectedEvent && (
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
                  className="hover:opacity-80 transition-opacity"
                >
                  <Button
                    variant={
                      (pathname ?? "").includes(
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
                      (pathname ?? "").includes(
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
      )}

      {/* Blog Menus Section */}
      <div className="px-3">
        <div className="p-4 rounded-lg bg-gray-800">
          <h3 className="font-bold text-lg text-white">Blog Management</h3>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-1">
              {blogMenus.map((menu) => (
                <Link key={menu.href} href={menu.href}>
                  <Button
                    variant={pathname === menu.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-2 hover:bg-blue-500 transition-opacity",
                      pathname === menu.href &&
                        "bg-blue-500 text-white font-bold "
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
                      "w-full justify-start gap-2 hover:bg-blue-500 transition-opacity",
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
