import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTickets, deleteTicket, updateTicket } from "./api";
import toast from 'react-hot-toast';

import { useSearchParams } from 'next/navigation';

export function useCreateTicket() {
    const searchParams = useSearchParams();
    const eventId = searchParams.get('eventId');
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ticketData: any) => {
            if (!eventId) {
                throw new Error('No event ID found in URL');
            }
            return createTickets(eventId, ticketData);
        },
        onError: (error) => {
            console.error('Failed to create ticket:', error);
            toast.error('Error creating ticket')
        },
        onSuccess: (data) => {
            console.log('Ticket created successfully:', data);
            // Invalidate and refetch tickets query after successful creation
            queryClient.invalidateQueries({ queryKey: ['tickets', eventId] });
            toast.success('Ticket created successfully');
        }
    });
}

export function useUpdateTicket() {
  // const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, ticketId, data }: { eventId: string; ticketId: string; data: any }) => 
      updateTicket(eventId, ticketId, data),
    onMutate: () => {
      console.log('mutate')
    },
    onError: () => {
      console.log('error')
      toast.error('Error updating ticket')
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tickets', eventId] });
      toast.success('Ticket updated successfully');
    }
  })
}

export function useDeleteTicket() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, ticketId }: { eventId: string; ticketId: string;}) => 
      deleteTicket(eventId, ticketId),
    onMutate: () => {
      console.log('mutate')
    },
    onError: () => {
      console.log('error')
      toast.error('Error deleting ticket')
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tickets', eventId] });
      toast.success('Ticket deleted successfully');
    }
  })
}
