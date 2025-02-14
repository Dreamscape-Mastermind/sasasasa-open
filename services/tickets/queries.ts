import { useQuery } from "@tanstack/react-query";
import { fetchTickets } from "./api";

export function useTickets(eventId: string | null) {
    return useQuery({
        queryKey: ['tickets', eventId],
        queryFn: () => fetchTickets(eventId!),
        enabled: !!eventId, // Only run query if eventId exists
        // refetchOnMount: true, // Ensure it fetches on component mount
        // refetchOnWindowFocus: true, // Refetch when window regains focus
    });
}
