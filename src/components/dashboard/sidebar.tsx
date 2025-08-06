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
import { UserRole } from "@/types/user";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
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
  const { hasRole } = useAuth();
  const isAdmin = hasRole(UserRole.ADMIN) || hasRole(UserRole.SUPER_ADMIN);

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
          <div className="px-3 py-2">
            <h2 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Selected Experience
            </h2>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between rounded-lg bg-transparent px-3 py-5 text-base"
                  disabled={isLoadingEvents || events.length === 0}
                >
                  <span className="truncate">
                    {isLoadingEvents
                      ? "Loading..."
                      : selectedEvent
                      ? selectedEvent.title
                      : "No Event Selected"}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-[var(--radix-popover-trigger-width)] p-0 rounded-lg border shadow-md"
              >
                <Command className="rounded-lg">
                  <CommandInput
                    placeholder="Search events..."
                    className="h-9 rounded-md border focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring"
                  />
                  <CommandList>
                    <CommandEmpty>
                      <div className="space-y-2 text-center py-4">
                        <p className="text-sm text-muted-foreground">
                          No event found.
                        </p>
                        <Link href="/dashboard/events/create">
                          <Button size="sm" className="rounded-lg">
                            Create an Event
                          </Button>
                        </Link>
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      {events.map((event) => (
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
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedEvent?.id === event.id
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

          <div className="px-3">
            <h2 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Experience Menu
            </h2>
            <div className="ml-4">
              {selectedEvent ? (
                <div className="space-y-1">
                  {NAV_ITEMS.DASHBOARD_EVENT_ORGANIZER.map((menu: MenuItem) => (
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
                        className="w-full justify-start gap-2"
                      >
                        {menu.icon && <menu.icon className="h-4 w-4" />}
                        <span>{menu.label}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Select an event to see more options.
                </div>
              )}
            </div>
          </div>

          {/* Blog Menus Section */}
          {isAdmin && (
            <div className="px-3">
              <h2 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Blog
              </h2>
              <div className="space-y-1">
                {NAV_ITEMS.DASHBOARD_BLOG_ADMIN.map((menu: MenuItem) => (
                  <Link key={menu.href} href={menu.href}>
                    <Button
                      variant={pathname === menu.href ? "secondary" : "ghost"}
                      className="w-full justify-start gap-2"
                    >
                      {menu.icon && <menu.icon className="h-4 w-4" />}
                      <span>{menu.label}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* User Menus Section */}
          <div className="px-3">
            <h2 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              My Account
            </h2>
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
                    className="w-full justify-start gap-2"
                  >
                    <menu.icon className="h-4 w-4" />
                    <span>{menu.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <>
      <Sheet open={isOpen} onOpenChange={toggleSidebar}>
        <SheetContent side="right" className="p-0 w-80 lg:w-96">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    </>
  );
}
