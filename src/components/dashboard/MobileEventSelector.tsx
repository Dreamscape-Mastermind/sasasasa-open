"use client";

import { useState, useMemo } from "react";
import { ChevronDown, Calendar, Plus, CheckCircle, Clock, MapPin, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Event, EventStatus } from "@/types/event";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import moment from "moment-timezone";

interface MobileEventSelectorProps {
  events: Event[];
  selectedEventId: string | null;
  onEventSelect: (eventId: string) => void;
  isLoading?: boolean;
}

// Human-centered helper functions
const getEventStatus = (event: Event) => {
  const now = new Date();
  const startDate = new Date(event.start_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;
  
  if (event.status !== EventStatus.PUBLISHED) return { status: 'draft', label: 'Draft', color: 'bg-gray-500' };
  if (startDate > now) return { status: 'upcoming', label: 'Upcoming', color: 'bg-blue-500' };
  if (endDate && endDate < now) return { status: 'ended', label: 'Ended', color: 'bg-gray-500' };
  return { status: 'live', label: 'Live', color: 'bg-green-500' };
};

const getEventPriority = (event: Event) => {
  const now = new Date();
  const startDate = new Date(event.start_date);
  const daysUntil = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntil < 0) return 0; // Past events
  if (daysUntil <= 7) return 3; // This week
  if (daysUntil <= 30) return 2; // This month
  return 1; // Future
};

// Search and filter functions
const searchEvents = (events: Event[], searchTerm: string) => {
  if (!searchTerm.trim()) return events;
  
  const term = searchTerm.toLowerCase();
  return events.filter(event => {
    // Search in title
    if (event.title.toLowerCase().includes(term)) return true;
    // Search in description
    if (event.description?.toLowerCase().includes(term)) return true;
    // Search in venue/location
    if (event.venue?.toLowerCase().includes(term)) return true;
    // Search in date (formatted)
    const dateStr = moment(event.start_date).format('MMM D, YYYY');
    if (dateStr.toLowerCase().includes(term)) return true;
    // Search in status
    const status = getEventStatus(event);
    if (status.label.toLowerCase().includes(term)) return true;
    
    return false;
  });
};

export function MobileEventSelector({
  events,
  selectedEventId,
  onEventSelect,
  isLoading = false,
}: MobileEventSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  const selectedEvent = events.find(event => event.id === selectedEventId) || events[0];
  
  // Human-centered: Sort events by priority (upcoming first, then by date)
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const priorityA = getEventPriority(a);
      const priorityB = getEventPriority(b);
      if (priorityA !== priorityB) return priorityB - priorityA;
      return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
    });
  }, [events]);

  // Filter events based on search
  const filteredEvents = useMemo(() => {
    return searchEvents(sortedEvents, searchTerm);
  }, [sortedEvents, searchTerm]);
  
  const displayEvents = filteredEvents.slice(0, 10);

  const handleEventSelect = (eventId: string) => {
    onEventSelect(eventId);
    setSearchTerm(""); // Clear search when selecting
    router.push(ROUTES.DASHBOARD_EVENT_DETAILS(eventId));
  };

  const handleSearchClear = () => {
    setSearchTerm("");
  };

  if (isLoading) {
    return (
      <div className="md:hidden p-4 border-b border-muted/40 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-4 p-4 rounded-xl border border-muted/50 bg-muted/20 animate-pulse">
          <div className="w-16 h-16 bg-muted/40 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <div className="h-5 bg-muted/40 rounded w-3/4" />
            <div className="h-4 bg-muted/40 rounded w-1/2" />
            <div className="h-3 bg-muted/40 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="md:hidden p-4 border-b border-muted/40 bg-background/95 backdrop-blur-sm">
        <div className="text-center p-8 border-2 border-dashed border-muted/40 rounded-xl bg-gradient-to-br from-muted/20 to-muted/10">
          <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No events yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Create your first event to start managing tickets, attendees, and analytics
          </p>
          <Link href={ROUTES.DASHBOARD_EVENT_CREATE()}>
            <Button className="gap-2 rounded-xl px-6 py-3">
              <Plus className="h-5 w-5" />
              Create Your First Event
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const eventStatus = selectedEvent ? getEventStatus(selectedEvent) : null;
  const isSearching = searchTerm.trim().length > 0;

  return (
    <div className="md:hidden p-4 border-b border-muted/40 bg-background/95 backdrop-blur-sm">
      {/* Search Bar */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search your events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 h-10 rounded-lg border-2 border-muted/50 focus:border-primary/60 transition-colors"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSearchClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted/50"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Search Results - Immediately visible when searching */}
      {isSearching && (
        <div className="mb-4 p-3 bg-muted/20 rounded-xl border border-muted/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Search Results</h3>
            <Badge variant="secondary" className="text-xs">
              {filteredEvents.length} found
            </Badge>
          </div>
          
          {displayEvents.length > 0 ? (
            <div className="space-y-2">
              {displayEvents.map((event) => {
                const status = getEventStatus(event);
                const priority = getEventPriority(event);
                const isSelected = event.id === selectedEventId;
                
                return (
                  <div
                    key={event.id}
                    onClick={() => handleEventSelect(event.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-primary/10 border-primary/30' 
                        : 'border-muted/50 hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 flex-shrink-0">
                        <img
                          src={event.cover_image || '/images/placeholdere.jpeg'}
                          alt={event.title}
                          className="w-full h-full object-cover rounded-lg border border-muted/30"
                        />
                        <div className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 ${status.color} rounded-full border border-background`} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm text-foreground truncate">
                            {event.title}
                          </h4>
                          {isSelected && <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{moment(event.start_date).format('MMM D, YYYY')}</span>
                          {priority === 3 && (
                            <Badge variant="destructive" className="text-xs px-1 py-0.5">
                              This Week
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-4 border-2 border-dashed border-muted/40 rounded-lg">
              <Search className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium text-muted-foreground mb-1">No events found</p>
              <p className="text-xs text-muted-foreground">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      )}

      {/* Current Event Selector with Dropdown - Only show when not searching */}
      {!isSearching && (
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <div className="w-full p-4 rounded-xl border-2 border-muted/50 hover:border-primary/50 hover:bg-primary/5 transition-all bg-background cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <img
                    src={selectedEvent?.cover_image || '/images/placeholdere.jpeg'}
                    alt={selectedEvent?.title}
                    className="w-full h-full object-cover rounded-xl border border-muted/30"
                  />
                  {eventStatus && (
                    <div className={`absolute -top-1 -right-1 w-4 h-4 ${eventStatus.color} rounded-full border-2 border-background`} />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base text-foreground truncate">
                      {selectedEvent?.title}
                    </h3>
                    {eventStatus && (
                      <Badge variant="secondary" className="text-xs px-2 py-0.5 rounded-full">
                        {eventStatus.label}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span className="truncate">
                        {selectedEvent?.start_date ? moment(selectedEvent.start_date).format('MMM D') : 'TBD'}
                      </span>
                    </div>
                    {selectedEvent?.venue && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-20">{selectedEvent.venue}</span>
                      </div>
                    )}
                  </div>
                </div>
                <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            className="w-[calc(100vw-3rem)] max-w-sm p-4 max-h-[75vh] overflow-y-auto"
            sideOffset={8}
          >
            <div className="space-y-4">
              {/* Header with context */}
              <div className="text-center pb-3 border-b border-muted/40">
                <h3 className="text-lg font-semibold text-foreground mb-1">Switch Event</h3>
                <p className="text-sm text-muted-foreground">
                  {sortedEvents.length} events • {sortedEvents.filter(e => getEventPriority(e) > 0).length} upcoming
                </p>
              </div>
              
              {/* Event list with priority indicators */}
              <div className="space-y-2">
                {sortedEvents.slice(0, 10).map((event) => {
                  const status = getEventStatus(event);
                  const priority = getEventPriority(event);
                  const isSelected = event.id === selectedEventId;
                  
                  return (
                    <DropdownMenuItem
                      key={event.id}
                      className="p-0 focus:bg-transparent focus:outline-none"
                      onClick={() => handleEventSelect(event.id)}
                    >
                      <div className={`w-full p-3 rounded-xl border transition-all ${
                        isSelected 
                          ? 'bg-primary/10 border-primary/30' 
                          : 'border-muted/50 hover:bg-muted/30'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 flex-shrink-0">
                            <img
                              src={event.cover_image || '/images/placeholdere.jpeg'}
                              alt={event.title}
                              className="w-full h-full object-cover rounded-lg border border-muted/30"
                            />
                            <div className={`absolute -top-0.5 -right-0.5 w-3 h-3 ${status.color} rounded-full border border-background`} />
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm text-foreground truncate">
                                {event.title}
                              </h4>
                              {isSelected && <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{moment(event.start_date).format('MMM D, YYYY')}</span>
                              {priority === 3 && (
                                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                                  This Week
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </div>
              
              {/* Actions */}
              <div className="space-y-3 pt-3 border-t border-muted/40">
                {sortedEvents.length > 10 && (
                  <Link href={ROUTES.DASHBOARD_EVENTS}>
                    <Button variant="outline" className="w-full gap-2 rounded-xl">
                      <span>View All Events</span>
                      <Badge variant="secondary" className="text-xs">
                        {sortedEvents.length}
                      </Badge>
                    </Button>
                  </Link>
                )}
                
                <Link href={ROUTES.DASHBOARD_EVENT_CREATE()}>
                  <Button className="w-full gap-2 rounded-xl">
                    <Plus className="h-4 w-4" />
                    Create New Event
                  </Button>
                </Link>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Quick Actions */}
      <div className="mt-4 flex gap-2">
        <Link href={ROUTES.DASHBOARD_EVENTS} className="flex-1">
          <Button variant="outline" className="w-full gap-2 rounded-xl">
            <span>All Events</span>
            <Badge variant="secondary" className="text-xs">
              {events.length}
            </Badge>
          </Button>
        </Link>
        <Link href={ROUTES.DASHBOARD_EVENT_CREATE()}>
          <Button className="gap-2 rounded-xl px-4">
            <Plus className="h-4 w-4" />
            New
          </Button>
        </Link>
      </div>
    </div>
  );
} 