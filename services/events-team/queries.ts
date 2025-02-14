import { useQuery } from "@tanstack/react-query";
import { fetchEventTeamMembers } from "./api";

export function useTeamMembers(eventId: string | null) {
    return useQuery({
        queryKey: ['team', eventId],
        queryFn: () => fetchEventTeamMembers(eventId!),
        enabled: !!eventId, // Only run query if eventId exists
    });
}
