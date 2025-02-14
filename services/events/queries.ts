import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "./api";
import { fetchEvent } from "./api";

export function useEvent(eventId: string | null) {
    return useQuery({
        queryKey: ['event', eventId],
        queryFn: () => fetchEvent(eventId!),
        enabled: !!eventId, // Only run query if eventId exists
    });
}

export function useEvents(){
  return useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  })
}