import { useQuery } from "@tanstack/react-query";
import { searchService } from "@/services/search.service";
import { SearchQueryParams, SearchResults } from "@/types/search";

/**
 * Provides React Query hooks for interacting with the search API.
 */
export const useSearch = () => {
  /**
   * A hook to fetch search results based on a query.
   *
   * @param params - The search parameters, including the query `q`.
   * @returns The state of the query, including `data`, `isLoading`, and `error`.
   */
  const useSearchResults = (params: SearchQueryParams) => {
    return useQuery<SearchResults>({
      // Query key includes all params to ensure each query is cached uniquely.
      queryKey: ["search-results", params],
      // The actual fetch function.
      queryFn: () => searchService.search(params),
      // Query is only enabled if `params.q` is a non-empty string.
      enabled: !!params.q && params.q.trim().length > 0,
      // Stale time for search can be shorter, as it's more dynamic.
      staleTime: 60 * 1000, // 1 minute
    });
  };

  return {
    useSearchResults,
  };
};
