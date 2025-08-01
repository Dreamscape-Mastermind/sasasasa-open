/**
 * Defines the available categories for searching.
 * Using a generic string allows for easy extension as more searchable models are added.
 */
export type SearchCategory = "events" | "performers" | string;

/**
 * Interface for the search query parameters sent to the API.
 */
export interface SearchQueryParams {
  /** The search term. */
  q: string;
  /** Optional category to filter the search. Can be a single category or 'all'. */
  category?: SearchCategory | "all";
  /** Optional limit for the number of results per category. */
  limit?: number;
  /** Optional language code for the search. */
  lang?: string;
}

/**
 * Represents the nested location data in a search result.
 */
export interface SearchResultLocation {
  city: string;
  country: string;
}

/**
 * Represents a generic search result item, updated with rich fields.
 * This interface ensures essential fields like `id` and `name` are present,
 * while allowing for any other properties returned by the backend.
 */
export interface SearchResultItem {
  id: string | number;
  /** The primary display name for the search result. */
  name: string;
  
  // Optional rich fields from the backend
  short_url?: string;     // For navigation
  cover_image?: string;   // For display
  location?: SearchResultLocation; // Nested location data
  start_date?: string;    // For events

  /** Allows for any other properties that might be returned by the serializer. */
  [key: string]: any;
}


/**
 * A dictionary of search results, keyed by category.
 * Using a generic Record type makes this adaptable to any categories
 * returned by the backend.
 */
export type SearchResults = Record<SearchCategory, SearchResultItem[]>;

/**
 * The structure of the `data` object in a successful API response.
 */
export interface SearchSuccessData {
  query: string;
  language: string;
  results: SearchResults;
}

/**
 * The full API response structure for a successful search request.
 */
export interface SearchApiResponse {
  status: "success";
  data: SearchSuccessData;
}
