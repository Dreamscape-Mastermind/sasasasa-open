import {
  ComplementaryTicketRequest,
  ProcessRefundRequest,
  RefundRequest,
  TicketPurchaseRequest,
  TicketType,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ticketApi } from "../api/ticketApiService";
import toast from "react-hot-toast";

/**
 * Hook to fetch all ticket types for an event
 */
export const useTicketTypes = (eventId: string) => {
  return useQuery({
    queryKey: ["ticketTypes", eventId],
    queryFn: () => ticketApi.listTicketTypes(eventId),
  });
};

/**
 * Hook to fetch a specific ticket type by ID
 */
export const useTicketType = (eventId: string, ticketTypeId: string) => {
  return useQuery({
    queryKey: ["ticketType", eventId, ticketTypeId],
    queryFn: () => ticketApi.getTicketType(eventId, ticketTypeId),
  });
};

/**
 * Hook to create a new ticket type for an event
 */
export const useCreateTicketType = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<TicketType, "id" | "event" | "created_at">) =>
      ticketApi.createTicketType(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticketTypes", eventId] });
      toast.success("Ticket type created successfully");
    },
    onError: () => {
      toast.error("Failed to create ticket type");
    },
  });
};

/**
 * Hook to update an existing ticket type
 */
export const useUpdateTicketType = (eventId: string, ticketTypeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<TicketType>) =>
      ticketApi.updateTicketType(eventId, ticketTypeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticketTypes", eventId] });
      queryClient.invalidateQueries({
        queryKey: ["ticketType", eventId, ticketTypeId],
      });
      toast.success("Ticket type updated successfully");
    },
    onError: () => {
      toast.error("Failed to update ticket type");
    },
  });
};

/**
 * Hook to delete a ticket type
 */
export const useDeleteTicketType = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticketTypeId: string) =>
      ticketApi.deleteTicketType(eventId, ticketTypeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticketTypes", eventId] });
      toast.success("Ticket type deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete ticket type");
    },
  });
};

/**
 * Hook to fetch all tickets for an event
 */
export const useTickets = (eventId: string) => {
  return useQuery({
    queryKey: ["tickets", eventId],
    queryFn: () => ticketApi.listTickets(eventId),
  });
};

/**
 * Hook to purchase tickets for an event
 */
export const usePurchaseTickets = (eventId: string) => {
  return useMutation({
    mutationFn: (data: TicketPurchaseRequest) =>
      ticketApi.purchaseTickets(eventId, data),
    onSuccess: () => {
      toast.success("Tickets purchased successfully");
    },
    onError: () => {
      toast.error("Failed to purchase tickets");
    },
  });
};

/**
 * Hook to request a refund for a ticket
 */
export const useRequestRefund = (eventId: string, ticketId: string) => {
  return useMutation({
    mutationFn: (data: RefundRequest) =>
      ticketApi.requestRefund(eventId, ticketId, data),
    onSuccess: () => {
      toast.success("Refund requested successfully");
    },
    onError: () => {
      toast.error("Failed to request refund");
    },
  });
};

/**
 * Hook to check in a ticket at an event
 */
export const useCheckInTicket = (eventId: string, ticketId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ticketApi.checkInTicket(eventId, ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets", eventId] });
      toast.success("Ticket checked in successfully");
    },
    onError: () => {
      toast.error("Failed to check in ticket");
    },
  });
};

/**
 * Hook to export tickets for an event
 */
export const useExportTickets = (eventId: string) => {
  return useMutation({
    mutationFn: () => ticketApi.exportTickets(eventId),
    onSuccess: () => {
      toast.success("Tickets exported successfully");
    },
    onError: () => {
      toast.error("Failed to export tickets");
    },
  });
};

/**
 * Hook to fetch all refund requests for an event
 */
export const useRefunds = (eventId: string) => {
  return useQuery({
    queryKey: ["refunds", eventId],
    queryFn: () => ticketApi.listRefunds(eventId),
  });
};

/**
 * Hook to process a refund request
 */
export const useProcessRefund = (eventId: string, refundId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProcessRefundRequest) =>
      ticketApi.processRefund(eventId, refundId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["refunds", eventId] });
      toast.success("Refund processed successfully");
    },
    onError: () => {
      toast.error("Failed to process refund");
    },
  });
};

/**
 * Hook to send complementary tickets for an event
 */
export const useSendComplementaryTickets = (eventId: string) => {
  return useMutation({
    mutationFn: (data: ComplementaryTicketRequest) =>
      ticketApi.sendComplementaryTickets(eventId, data),
    onSuccess: () => {
      toast.success("Complementary tickets sent successfully");
    },
    onError: () => {
      toast.error("Failed to send complementary tickets");
    },
  });
};
