import { apiClient, ApiError } from "./api.service";
import {
  SearchApiResponse,
  SearchQueryParams,
  SearchResults,
} from "../types/search";

class SearchService {
  /**
   * Performs a search across multiple categories using the backend API.
   *
   * @param params - The search query parameters (query, category, etc.).
   * @returns A promise that resolves to the search results, keyed by category.
   */
  public async search(params: SearchQueryParams): Promise<SearchResults> {
    if (!params.q || params.q.trim() === "") {
      // Return empty results if the query is empty to avoid unnecessary API calls.
      return {};
    }

    try {
      // Note the trailing slash to match the backend URL configuration
      const response = await apiClient.get<SearchApiResponse>("/api/v1/search/", {
        params,
      });

      // The API response nests the actual results inside `data.results`.
      return response.data.results;
    } catch (error) {
      // The apiClient is configured with interceptors to normalize errors.
      // We can log it here and re-throw to be handled by the UI layer.
      console.error("Search service error:", error);

      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new Error("An unexpected error occurred during search.");
    }
  }
}

export const searchService = new SearchService();

