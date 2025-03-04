'use client';

import { createContext, useContext, useCallback, useState, useEffect, ReactNode } from 'react';

// Types
interface Event {
  id: string;
  name: string;
  // Add other event properties as needed
}

interface Ticket {
  id: string;
  eventId: string;
  price: number;
  [key: string]: any;
  // Add other ticket properties as needed
}

interface EventContextType {
  currentEvent: Event | null;
  tickets: Ticket[];
  setCurrentEventId: (eventId: string) => void;
  loading: boolean;
  error: Error | null;
}

// Create context
const EventContext = createContext<EventContextType | undefined>(undefined);

// Cache for storing event data
const eventCache = new Map<string, { event: Event; tickets: Ticket[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export function EventProvider({ children }: { children: ReactNode }) {
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchEventData = useCallback(async (eventId: string) => {
    // Check cache first
    const cachedData = eventCache.get(eventId);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      setCurrentEvent(cachedData.event);
      setTickets(cachedData.tickets);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Replace these with your actual API calls
      const eventResponse = await fetch(`/api/events/${eventId}`);
      const ticketsResponse = await fetch(`/api/events/${eventId}/tickets`);

      if (!eventResponse.ok || !ticketsResponse.ok) {
        throw new Error('Failed to fetch event data');
      }

      const eventData = await eventResponse.json();
      const ticketsData = await ticketsResponse.json();

      // Update cache
      eventCache.set(eventId, {
        event: eventData,
        tickets: ticketsData,
        timestamp: Date.now(),
      });

      setCurrentEvent(eventData);
      setTickets(ticketsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setLoading(false);
    }
  }, []);

  const setCurrentEventId = useCallback((eventId: string) => {
    fetchEventData(eventId);
  }, [fetchEventData]);

  // Clear old cache entries periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of eventCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          eventCache.delete(key);
        }
      }
    }, CACHE_DURATION);

    return () => clearInterval(cleanup);
  }, []);

  return (
    <EventContext.Provider
      value={{
        currentEvent,
        tickets,
        setCurrentEventId,
        loading,
        error,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

// Custom hook for using the event context
export function useEvent() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
} 