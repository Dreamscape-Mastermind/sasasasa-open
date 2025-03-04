'use client';

import { SasasasaEvent, Ticket } from '@/utils/dataStructures';
import { createContext, useContext, useCallback, useState, useEffect, ReactNode } from 'react';
import { fetchEvent } from 'services/events/api';
import { fetchTickets } from 'services/tickets/api';

interface EventContextType {
  currentEvent: SasasasaEvent | null;
  tickets: Ticket[];
  setCurrentEventId: (eventId: string) => void;
  loading: boolean;
  error: Error | null;
}

// Create context
const EventContext = createContext<EventContextType | undefined>(undefined);

// Cache for storing event data
const eventCache = new Map<string, { event: SasasasaEvent; tickets: Ticket[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export function EventProvider({ children }: { children: ReactNode }) {
  const [currentEvent, setCurrentEvent] = useState<SasasasaEvent | null>(null);
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
      // Use the API functions from services instead of direct fetch calls
      const eventData = await fetchEvent(eventId);
      const ticketsData = await fetchTickets(eventId);

      // Update cache
      eventCache.set(eventId, {
        event: eventData,
        tickets: ticketsData.result.results,
        timestamp: Date.now(),
      });

      setCurrentEvent(eventData);
      setTickets(ticketsData.result.results);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      console.error("Error fetching event data:", err);
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