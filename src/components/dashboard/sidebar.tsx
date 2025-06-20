"use client";

import {
  BarChart2,
  Calendar,
  Check,
  ChevronsUpDown,
  CreditCard,
  Layout,
  LucideIcon,
  Settings,
  Ticket,
  Users,
  X,
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
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Event } from "@/types/event";
import Link from "next/link";
import { NAV_ITEMS } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useEvent } from "@/hooks/useEvent";
import { useSidebar } from "@/contexts/SidebarContext";

interface MenuItem {
  label: string;
  href: string;
  icon?: LucideIcon;
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
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { isOpen, toggleSidebar } = useSidebar();
  const [open, setOpen] = useState(false);
  const { useMyEvents } = useEvent();
  const { data: eventsData, isLoading: isLoadingEvents } = useMyEvents({
    page: 1,
  });
  const events = eventsData?.result?.results || [];

  useEffect(() => {
    if (
      events.length > 0 &&
      (!selectedEvent || !events.find((e) => e.id === selectedEvent.id))
    ) {
      setSelectedEvent(events[0]);
    }
  }, [events]);

  const sidebarContent = (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-[60px] items-center border-b px-6 lg:hidden">
        <Button
          variant="ghost"
          className="-ml-3 h-9 w-9 p-0"
          onClick={toggleSidebar}
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Close sidebar</span>
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 py-4">
          {/* Event Dropdown */}
          <div className="px-3 py-2">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 hover:font-extrabold hover:text-primary-foreground"
                  disabled={isLoadingEvents || events.length === 0}
                >
                  {isLoadingEvents
                    ? "Loading..."
                    : selectedEvent
                    ? selectedEvent.title.length > 20
                      ? `${selectedEvent.title.slice(0, 20)}...`
                      : selectedEvent.title
                    : "No Events"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-full p-0 rounded-xl shadow-lg border-none px-4 text-sm font-medium text-primary-foreground animate-fade-in-scale"
                sideOffset={8}
              >
                <Command className="rounded-xl">
                  <CommandInput
                    placeholder="Search events..."
                    className="border-none focus:ring-0 focus:outline-none"
                  />
                  <CommandList>
                    <CommandEmpty className="text-muted-foreground">
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
                              "hover:bg-accent focus:bg-accent text-foreground font-medium rounded-lg transition-all cursor-pointer",
                              selectedEvent &&
                                selectedEvent.id === event.id &&
                                "bg-accent font-bold"
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
            <div className="px-3 bg-transparent">
              <div className="bg-primary p-4 rounded-lg border border-primary/20">
                <h3 className="font-bold text-lg text-foreground">
                  Experiences
                </h3>
                <div className="space-y-1">
                  {NAV_ITEMS.DASHBOARD_EVENT_ORGANIZER.map((menu: MenuItem) => (
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
                          ) && "bg-primary text-primary-foreground font-medium"
                        )}
                      >
                        {menu.icon && <menu.icon className="h-4 w-4" />}
                        <span>{menu.label}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Blog Menus Section */}
          <div className="px-3">
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
              <h3 className="font-bold text-lg text-foreground">
                Stories
              </h3>
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-1">
                  {NAV_ITEMS.DASHBOARD_BLOG_ADMIN.map((menu: MenuItem) => (
                    <Link key={menu.href} href={menu.href}>
                      <Button
                        variant={pathname === menu.href ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-2",
                          pathname === menu.href &&
                            "bg-primary text-primary-foreground font-medium"
                        )}
                      >
                        {menu.icon && <menu.icon className="h-4 w-4" />}
                        <span>{menu.label}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* User Menus Section */}
          <div className="px-3">
            <div className="p-4 rounded-lg bg-transparent border border-border">
              <h3 className="font-bold text-lg text-foreground">
                My Account
              </h3>
              <div className="space-y-1">
                {NAV_ITEMS.DASHBOARD_ADMIN.map((menu) => (
                  <Link
                    key={menu.href}
                    href={menu.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        toggleSidebar();
                      }
                    }}
                  >
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
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 border-r shrink-0">
        <div className="sticky top-0 h-screen overflow-y-auto bg-transparent">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={isOpen} onOpenChange={toggleSidebar}>
        <SheetContent side="left" className="p-0 w-64">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    </>
  );
}
