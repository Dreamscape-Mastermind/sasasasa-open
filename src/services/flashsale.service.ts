import {
  ActiveFlashSaleQueryParams,
  CreateFlashSaleRequest,
  FlashSaleQueryParams,
  FlashSaleResponse,
  FlashSaleStatsResponse,
  FlashSalesResponse,
  UpdateFlashSaleRequest,
  ValidatePurchaseRequest,
  ValidatePurchaseResponse,
} from "@/types/flashsale";

import { apiClient } from "./api.service";

/**
 * Flash sale service for handling all flash sale-related operations
 */
class FlashSaleService {
  private static instance: FlashSaleService;
  private readonly baseUrl = "/api/v1";

  private constructor() {}

  public static getInstance(): FlashSaleService {
    if (!FlashSaleService.instance) {
      FlashSaleService.instance = new FlashSaleService();
    }
    return FlashSaleService.instance;
  }

  /**
   * Flash sale operations
   */
  public async listFlashSales(eventId: string, params?: FlashSaleQueryParams): Promise<FlashSalesResponse> {
    return apiClient.get<FlashSalesResponse>(`${this.baseUrl}/events/${eventId}/flash-sales`, { params });
  }

  public async getFlashSale(eventId: string, flashSaleId: string): Promise<FlashSaleResponse> {
    return apiClient.get<FlashSaleResponse>(`${this.baseUrl}/events/${eventId}/flash-sales/${flashSaleId}`);
  }

  public async createFlashSale(eventId: string, data: CreateFlashSaleRequest): Promise<FlashSaleResponse> {
    return apiClient.post<FlashSaleResponse>(`${this.baseUrl}/events/${eventId}/flash-sales`, data);
  }

  public async updateFlashSale(
    eventId: string,
    flashSaleId: string,
    data: UpdateFlashSaleRequest
  ): Promise<FlashSaleResponse> {
    return apiClient.patch<FlashSaleResponse>(`${this.baseUrl}/events/${eventId}/flash-sales/${flashSaleId}`, data);
  }

  public async deleteFlashSale(eventId: string, flashSaleId: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/events/${eventId}/flash-sales/${flashSaleId}`);
  }

  /**
   * Flash sale status operations
   */
  public async cancelFlashSale(eventId: string, flashSaleId: string): Promise<FlashSaleResponse> {
    return apiClient.post<FlashSaleResponse>(`${this.baseUrl}/events/${eventId}/flash-sales/${flashSaleId}/cancel`);
  }

  public async activateFlashSale(eventId: string, flashSaleId: string): Promise<FlashSaleResponse> {
    return apiClient.get<FlashSaleResponse>(`${this.baseUrl}/events/${eventId}/flash-sales/${flashSaleId}/activate`);
  }

  /**
   * Flash sale validation and purchase operations
   */
  public async validatePurchase(
    eventId: string,
    flashSaleId: string,
    data: ValidatePurchaseRequest
  ): Promise<ValidatePurchaseResponse> {
    return apiClient.post<ValidatePurchaseResponse>(
      `${this.baseUrl}/events/${eventId}/flash-sales/${flashSaleId}/validate_purchase`,
      data
    );
  }

  public async getActiveSale(params: ActiveFlashSaleQueryParams): Promise<FlashSaleResponse> {
    return apiClient.get<FlashSaleResponse>(`${this.baseUrl}/flash-sales/active`, { params });
  }

  /**
   * Flash sale analytics operations
   */
  public async getFlashSaleStats(eventId: string, flashSaleId: string): Promise<FlashSaleStatsResponse> {
    return apiClient.get<FlashSaleStatsResponse>(`${this.baseUrl}/events/${eventId}/flash-sales/${flashSaleId}/stats`);
  }
}

export const flashSaleService = FlashSaleService.getInstance();
