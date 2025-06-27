import type {
  ComplementaryTicketRequest,
  CreateTicketTypeRequest,
  ExportTicketsQueryRequest,
  ProcessRefundRequest,
  RequestRefundRequest,
  TicketPurchaseRequest,
  TicketQueryParams,
  TicketRefundQueryParams,
  TicketTypeQueryParams,
  UpdateTicketTypeRequest,
} from "@/types/ticket";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ticketService } from "@/services/ticket.service";

export const useTicket = () => {
  const queryClient = useQueryClient();

  // Ticket Types
  const useTicketTypes = (eventId: string, params?: TicketTypeQueryParams) => {
    return useQuery({
      queryKey: ["ticket-types", eventId, params],
      queryFn: () => ticketService.listTicketTypes(eventId, params),
    });
  };

  const useTicketType = (eventId: string, ticketTypeId: string) => {
    return useQuery({
      queryKey: ["ticket-type", eventId, ticketTypeId],
      queryFn: () => ticketService.getTicketType(eventId, ticketTypeId),
    });
  };

  const useCreateTicketType = (
    eventId: string,
    config?: { onSuccess?: () => void }
  ) => {
    return useMutation({
      mutationFn: (data: CreateTicketTypeRequest) =>
        ticketService.createTicketType(eventId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["ticket-types", eventId] });
        config?.onSuccess?.();
      },
    });
  };

  const useUpdateTicketType = (
    { eventId }: { eventId: string },
    config?: { onSuccess?: () => void }
  ) => {
    return useMutation({
      mutationFn: (data: UpdateTicketTypeRequest) => {
        const { ticketTypeId, ...rest } = data;
        return ticketService.updateTicketType(eventId, data.ticketTypeId, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["ticket-types", eventId] });
        queryClient.invalidateQueries({
          queryKey: ["ticket-type", eventId],
        });
        config?.onSuccess?.();
      },
    });
  };

  const useDeleteTicketType = (eventId: string) => {
    return useMutation({
      mutationFn: (ticketTypeId: string) =>
        ticketService.deleteTicketType(eventId, ticketTypeId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["ticket-types", eventId] });
      },
    });
  };

  // Tickets
  const useTickets = (eventId: string, params?: TicketQueryParams) => {
    return useQuery({
      queryKey: ["tickets", eventId, params],
      enabled: !!eventId,
      queryFn: () => ticketService.listTickets(eventId, params),
    });
  };

  const useTicket = (eventId: string, ticketId: string) => {
    return useQuery({
      queryKey: ["ticket", eventId, ticketId],
      queryFn: () => ticketService.getTicket(eventId, ticketId),
    });
  };

  const usePurchaseTickets = (eventId: string) => {
    return useMutation({
      mutationFn: (data: TicketPurchaseRequest) =>
        ticketService.purchaseTickets(eventId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tickets", eventId] });
      },
    });
  };

  const useRequestRefund = (eventId: string, ticketId: string) => {
    return useMutation({
      mutationFn: (data: RequestRefundRequest) =>
        ticketService.requestRefund(eventId, ticketId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tickets", eventId] });
        queryClient.invalidateQueries({ queryKey: ["refunds", eventId] });
      },
    });
  };

  const useCheckInTicket = (eventId: string) => {
    return useMutation({
      mutationFn: (ticketId: string) =>
        ticketService.checkInTicket(eventId, ticketId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tickets", eventId] });
      },
    });
  };

  const useSendComplementaryTickets = (eventId: string) => {
    return useMutation({
      mutationFn: (data: ComplementaryTicketRequest) =>
        ticketService.sendComplementaryTickets(eventId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tickets", eventId] });
      },
    });
  };

  const useExportTickets = () => {
    return useMutation({
      mutationFn: (data: ExportTicketsQueryRequest) =>
        ticketService.exportTickets(data),
    });
  };

  // Refunds
  const useRefunds = (eventId: string, params?: TicketRefundQueryParams) => {
    return useQuery({
      queryKey: ["refunds", eventId, params],
      queryFn: () => ticketService.listRefunds(eventId, params),
    });
  };

  const useRefund = (eventId: string, refundId: string) => {
    return useQuery({
      queryKey: ["refund", eventId, refundId],
      queryFn: () => ticketService.getRefund(eventId, refundId),
    });
  };

  const useProcessRefund = (eventId: string, refundId: string) => {
    return useMutation({
      mutationFn: (data: ProcessRefundRequest) =>
        ticketService.processRefund(eventId, refundId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["refunds", eventId] });
        queryClient.invalidateQueries({
          queryKey: ["refund", eventId, refundId],
        });
      },
    });
  };

  return {
    // Ticket Types
    useTicketTypes,
    useTicketType,
    useCreateTicketType,
    useUpdateTicketType,
    useDeleteTicketType,
    // Tickets
    useTickets,
    useTicket,
    usePurchaseTickets,
    useRequestRefund,
    useCheckInTicket,
    useSendComplementaryTickets,
    useExportTickets,
    // Refunds
    useRefunds,
    useRefund,
    useProcessRefund,
  };
};
