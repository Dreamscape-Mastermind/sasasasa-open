"use client";

import {
  BarChart2,
  Calendar,
  Check,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  CreditCard,
  Layout,
  LucideIcon,
  Settings,
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
import Image from "next/image";
import Link from "next/link";
import { NAV_ITEMS } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserRole } from "@/types/user";
import { cn } from "@/lib/utils";
import siteMetadata from "@/config/siteMetadata";
import { useAuth } from "@/contexts/AuthContext";
import { useEvent } from "@/hooks/useEvent";
import { useSidebar } from "@/contexts/SidebarContext";

interface MenuItem {
  label: string;
  href: string;
  icon?: LucideIcon;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { isSidebarOpen, toggleSidebar } = useSidebar();
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
  }, [events, selectedEvent]);

  const renderMenu = (items: MenuItem[], isSubmenu = false, eventId?: string) => (
    <div className={cn("space-y-1", isSubmenu && "ml-4")}>
      {items.map((menu: MenuItem) => (
        <Link
          key={menu.href}
          href={eventId ? menu.href.replace("{eventId}", eventId) : menu.href}
          onClick={() => {
            if (window.innerWidth < 1024) {
              toggleSidebar();
            }
          }}
        >
          <Button
            variant={
              pathname === (eventId ? menu.href.replace("{eventId}", eventId) : menu.href)
                ? "secondary"
                : "ghost"
            }
            className="w-full justify-start gap-2"
          >
            {menu.icon && <menu.icon className={cn("h-4 w-4", !isSidebarOpen && "h-6 w-6")} />}
            {isSidebarOpen && <span>{menu.label}</span>}
          </Button>
        </Link>
      ))}
    </div>
  );

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800",
        isSidebarOpen ? "w-64" : "w-20"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        {isSidebarOpen && (
          <Link href="/" aria-label={siteMetadata.headerTitle}>
            <div className="flex items-center justify-between">
              <Image
                src={siteMetadata.siteLogo}
                alt="Logo"
                width={30}
                height={30}
                className="mr-2"
              />
              <span className="text-xl font-semibold">
                {siteMetadata.headerTitle}
              </span>
            </div>
          </Link>
        )}
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          {isSidebarOpen ? <ChevronsLeft /> : <ChevronsRight />}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 py-4">
          {isSidebarOpen && (
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
          )}

          <div className="px-3">
            {isSidebarOpen && (
              <h2 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Experience Menu
              </h2>
            )}
            {selectedEvent ? (
              renderMenu(NAV_ITEMS.DASHBOARD_EVENT_ORGANIZER, isSidebarOpen, selectedEvent.id.toString())
            ) : (
              isSidebarOpen && (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Select an event to see more options.
                </div>
              )
            )}
          </div>

          {isAdmin && (
            <div className="px-3">
              {isSidebarOpen && (
                <h2 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Blog
                </h2>
              )}
              {renderMenu(NAV_ITEMS.DASHBOARD_BLOG_ADMIN, isSidebarOpen)}
            </div>
          )}

          <div className="px-3">
            {isSidebarOpen && (
              <h2 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                My Account
              </h2>
            )}
            {renderMenu(NAV_ITEMS.DASHBOARD_ADMIN, isSidebarOpen)}
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
