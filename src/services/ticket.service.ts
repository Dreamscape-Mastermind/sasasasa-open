import {
  ComplementaryTicketRequest,
  CreateTicketTypeRequest,
  ProcessRefundRequest,
  RequestRefundRequest,
  TicketExportResponse,
  TicketPurchaseRequest,
  TicketPurchaseResponse,
  TicketQueryParams,
  TicketRefundQueryParams,
  TicketRefundResponse,
  TicketRefundsResponse,
  TicketResponse,
  TicketTypeQueryParams,
  TicketTypeResponse,
  TicketTypesResponse,
  TicketsResponse,
  UpdateTicketTypeRequest,
  UserTicketsResponse,
  type ExportTicketsQueryRequest,
} from "@/types/ticket";

import { apiClient } from "./api.service";

/**
 * Ticket service for handling all ticket-related operations
 */
class TicketService {
  private static instance: TicketService;
  private readonly baseUrl = "/api/v1";

  private constructor() {}

  public static getInstance(): TicketService {
    if (!TicketService.instance) {
      TicketService.instance = new TicketService();
    }
    return TicketService.instance;
  }

  /**
   * Ticket Type operations
   */
  public async listTicketTypes(
    eventId: string,
    params?: TicketTypeQueryParams
  ): Promise<TicketTypesResponse> {
    return apiClient.get<TicketTypesResponse>(
      `${this.baseUrl}/events/${eventId}/ticket-types`,
      { params }
    );
  }

  public async getTicketType(
    eventId: string,
    ticketTypeId: string
  ): Promise<TicketTypeResponse> {
    return apiClient.get<TicketTypeResponse>(
      `${this.baseUrl}/events/${eventId}/ticket-types/${ticketTypeId}`
    );
  }

  public async createTicketType(
    eventId: string,
    data: CreateTicketTypeRequest
  ): Promise<TicketTypeResponse> {
    return apiClient.post<TicketTypeResponse>(
      `${this.baseUrl}/events/${eventId}/ticket-types`,
      data
    );
  }

  public async updateTicketType(
    eventId: string,
    ticketTypeId: string,
    data: UpdateTicketTypeRequest
  ): Promise<TicketTypeResponse> {
    return apiClient.patch<TicketTypeResponse>(
      `${this.baseUrl}/events/${eventId}/ticket-types/${ticketTypeId}`,
      data
    );
  }

  public async deleteTicketType(
    eventId: string,
    ticketTypeId: string
  ): Promise<void> {
    return apiClient.delete(
      `${this.baseUrl}/events/${eventId}/ticket-types/${ticketTypeId}`
    );
  }

  /**
   * Ticket operations
   */
  public async listTickets(
    eventId: string,
    params?: TicketQueryParams
  ): Promise<TicketsResponse> {
    return apiClient.get<TicketsResponse>(
      `${this.baseUrl}/events/${eventId}/tickets`,
      { params }
    );
  }

  public async getTicket(
    eventId: string,
    ticketId: string
  ): Promise<TicketResponse> {
    return apiClient.get<TicketResponse>(
      `${this.baseUrl}/events/${eventId}/tickets/${ticketId}`
    );
  }

  public async purchaseTickets(
    eventId: string,
    data: TicketPurchaseRequest
  ): Promise<TicketPurchaseResponse> {
    return apiClient.post<TicketPurchaseResponse>(
      `${this.baseUrl}/events/${eventId}/tickets/purchase`,
      data
    );
  }

  public async requestRefund(
    eventId: string,
    ticketId: string,
    data: RequestRefundRequest
  ): Promise<TicketRefundResponse> {
    return apiClient.post<TicketRefundResponse>(
      `${this.baseUrl}/events/${eventId}/tickets/${ticketId}/request-refund`,
      data
    );
  }

  public async checkInTicket(
    eventId: string,
    ticketId: string
  ): Promise<TicketResponse> {
    return apiClient.post<TicketResponse>(
      `${this.baseUrl}/events/${eventId}/tickets/${ticketId}/check-in`
    );
  }

  public async sendComplementaryTickets(
    eventId: string,
    data: ComplementaryTicketRequest
  ): Promise<TicketResponse> {
    return apiClient.post<TicketResponse>(
      `${this.baseUrl}/events/${eventId}/tickets/send-complementary`,
      data
    );
  }

  public async exportTickets(
    data: ExportTicketsQueryRequest
  ): Promise<TicketExportResponse> {
    return apiClient.post<TicketExportResponse>(
      `${this.baseUrl}/events/${data.event_id}/tickets/export_tickets`,
      data
    );
  }

  /**
   * User tickets operations (cross-event)
   */
  public async getUserTickets(params?: {
    page?: number;
    page_size?: number;
    status?: string;
    search?: string;
  }): Promise<UserTicketsResponse> {
    return apiClient.get<UserTicketsResponse>(`${this.baseUrl}/my-tickets`, {
      params,
    });
  }

  /**
   * Refund operations
   */
  public async listRefunds(
    eventId: string,
    params?: TicketRefundQueryParams
  ): Promise<TicketRefundsResponse> {
    return apiClient.get<TicketRefundsResponse>(
      `${this.baseUrl}/events/${eventId}/refunds`,
      { params }
    );
  }

  public async getRefund(
    eventId: string,
    refundId: string
  ): Promise<TicketRefundResponse> {
    return apiClient.get<TicketRefundResponse>(
      `${this.baseUrl}/events/${eventId}/refunds/${refundId}`
    );
  }

  public async processRefund(
    eventId: string,
    refundId: string,
    data: ProcessRefundRequest
  ): Promise<TicketRefundResponse> {
    return apiClient.post<TicketRefundResponse>(
      `${this.baseUrl}/events/${eventId}/refunds/${refundId}/process-refund`,
      data
    );
  }
}

export const ticketService = TicketService.getInstance();
