import { useMutation } from "@tanstack/react-query";
import { fetchEventTeamMembers, inviteTeamMember,  } from "./api";
import { toast } from "react-hot-toast";

export function useInviteTeamMember() {

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: any }) => 
      inviteTeamMember(eventId, data),
    onMutate: (data) => {
      console.log('mutate', data)
    },
    onError: () => {
      console.log('error')
      toast.error('Error inviting member to team')
    },
    onSuccess: (data) => {
      console.log(data)
      toast.success('Team member invited successfully')
    }
  })
}

export function useFetchEventTeam() {
  return useMutation({
    mutationFn: (eventId: string) => {
      return fetchEventTeamMembers(eventId); 
    },
    onMutate: () => {
      console.log('Fetching team...');
    },
    onError: () => {
      console.log('Error fetching team event');
      toast.error('Error fetching team for event')
    },
    onSuccess: (data) => {
      console.log('Event team fetched successfully', data);
      
    }
  });
}