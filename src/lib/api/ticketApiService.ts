import {
  ComplementaryTicketRequest,
  ComplementaryTicketsResult,
  DeleteResponse,
  ExportTicketsResult,
  ProcessRefundRequest,
  RefundFilterParams,
  RefundListResponse,
  RefundRequest,
  RefundResponse,
  TicketFilterParams,
  TicketListResponse,
  TicketPurchaseRequest,
  TicketPurchaseResult,
  TicketResponse,
  TicketTypeCreateRequest,
  TicketTypeListResponse,
  TicketTypeResponse,
  TicketTypeUpdateRequest,
} from "@/types";

import axios from "./axios";

export const ticketApi = {
  // Ticket Types
  /** Retrieves a paginated list of ticket types for an event */
  listTicketTypes: async (eventId: string, ordering?: string) => {
    const params = ordering ? { ordering } : undefined;
    const response = await axios.get<TicketTypeListResponse>(
      `/api/v1/events/${eventId}/ticket-types`,
      { params }
    );
    return response.data;
  },

  /** Creates a new ticket type for an event */
  createTicketType: async (eventId: string, data: TicketTypeCreateRequest) => {
    const response = await axios.post<TicketTypeResponse>(
      `/api/v1/events/${eventId}/ticket-types`,
      data
    );
    return response.data;
  },

  /** Gets details of a specific ticket type */
  getTicketType: async (eventId: string, ticketTypeId: string) => {
    const response = await axios.get<TicketTypeResponse>(
      `/api/v1/events/${eventId}/ticket-types/${ticketTypeId}`
    );
    return response.data;
  },

  /** Updates an existing ticket type's details */
  updateTicketType: async (
    eventId: string,
    ticketTypeId: string,
    data: TicketTypeUpdateRequest
  ) => {
    const response = await axios.patch<TicketTypeResponse>(
      `/api/v1/events/${eventId}/ticket-types/${ticketTypeId}`,
      data
    );
    return response.data;
  },

  /** Deletes a ticket type from an event */
  deleteTicketType: async (eventId: string, ticketTypeId: string) => {
    const response = await axios.delete<DeleteResponse>(
      `/api/v1/events/${eventId}/ticket-types/${ticketTypeId}`
    );
    return response.data;
  },

  // Tickets
  /** Retrieves a paginated list of tickets for an event */
  listTickets: async (eventId: string, params?: TicketFilterParams) => {
    const response = await axios.get<TicketListResponse>(
      `/api/v1/events/${eventId}/tickets`,
      { params }
    );
    return response.data;
  },

  /** Processes a ticket purchase request for an event */
  purchaseTickets: async (eventId: string, data: TicketPurchaseRequest) => {
    const response = await axios.post<TicketPurchaseResult>(
      `/api/v1/events/${eventId}/tickets/purchase`,
      data
    );
    return response.data;
  },

  /** Initiates a refund request for a specific ticket */
  requestRefund: async (
    eventId: string,
    ticketId: string,
    data: RefundRequest
  ) => {
    const response = await axios.post<RefundResponse>(
      `/api/v1/events/${eventId}/tickets/${ticketId}/request_refund`,
      data
    );
    return response.data;
  },

  /** Marks a ticket as checked-in at the event */
  checkInTicket: async (eventId: string, ticketId: string) => {
    const response = await axios.post<TicketResponse>(
      `/api/v1/events/${eventId}/tickets/${ticketId}/check_in`
    );
    return response.data;
  },

  /** Initiates an export job for all tickets of an event */
  exportTickets: async (eventId: string) => {
    const response = await axios.post<ExportTicketsResult>(
      `/api/v1/events/${eventId}/tickets/export_tickets`
    );
    return response.data;
  },

  // Refunds
  /** Retrieves a paginated list of refunds for an event */
  listRefunds: async (eventId: string, params?: RefundFilterParams) => {
    const response = await axios.get<RefundListResponse>(
      `/api/v1/events/${eventId}/refunds`,
      { params }
    );
    return response.data;
  },

  /** Gets details of a specific refund */
  getRefund: async (eventId: string, refundId: string) => {
    const response = await axios.get<RefundResponse>(
      `/api/v1/events/${eventId}/refunds/${refundId}`
    );
    return response.data;
  },

  /** Processes a pending refund request */
  processRefund: async (
    eventId: string,
    refundId: string,
    data: ProcessRefundRequest
  ) => {
    const response = await axios.post<RefundResponse>(
      `/api/v1/events/${eventId}/refunds/${refundId}/process_refund`,
      data
    );
    return response.data;
  },

  // Complementary Tickets
  /** Issues complementary tickets to specified recipients */
  sendComplementaryTickets: async (
    eventId: string,
    data: ComplementaryTicketRequest
  ) => {
    const response = await axios.post<ComplementaryTicketsResult>(
      `/api/v1/events/${eventId}/tickets/send_complementary`,
      data
    );
    return response.data;
  },
};
