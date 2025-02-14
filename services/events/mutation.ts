import { useMutation } from "@tanstack/react-query";
import { createEvent, publishEvent, updateEvent } from "./api";
import toast from "react-hot-toast";

export function useCreateEvent() {
  // const router = useRouter();

  return useMutation({
    mutationFn: (data: any) => createEvent(data),
    onMutate: (data) => {
      console.log('mutate', data)
    },
    onError: () => {
      console.log('error')
    },
    onSuccess: (data) => {
      // Add the event ID as a URL parameter without redirecting
      if (data?.result?.id) {
        const url = new URL(window.location.href);
        url.searchParams.set('eventId', data.result.id);
        window.history.pushState({}, '', url.toString());
        toast.success('Event created successfully')
      }
    }
  })
}

export function useUpdateEvent() {

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: any }) => 
      updateEvent(eventId, data),
    onMutate: (data) => {
      console.log('mutate', data)
    },
    onError: () => {
      console.log('error')
    },
    onSuccess: (data) => {
      toast.success('Event updated successfully');
      if (data?.result?.id) {
        // const url = new URL(window.location.href);
        // url.searchParams.set('eventId', data.result.id);
        // window.history.pushState({}, '', url.toString());
      }
    }
  })
}

export function usePublishEvent() {
  return useMutation({
    mutationFn: (eventId: string) => {
      // Logic to publish the event, e.g., calling an API
      return publishEvent(eventId); // Assuming publishEvent is defined in your api
    },
    onMutate: () => {
      console.log('Publishing event...');
    },
    onError: () => {
      console.log('Error publishing event');
      toast.error('Error publishing event');
    },
    onSuccess: (data) => {
      console.log('Event published successfully', data);
      toast.success('Event published successfully');
    }
  });
}