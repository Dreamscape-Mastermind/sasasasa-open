import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'recentSearches';
const MAX_SEARCHES = 5; // Cap the history at 5 items

/**
 * A hook to manage a client-side list of recent search queries.
 * It uses localStorage for persistence across sessions.
 *
 * @returns An object with the list of searches, a function to add a new search,
 *          and a function to clear the history.
 */
export const useRecentSearches = () => {
  const [searches, setSearches] = useState<string[]>([]);

  // On initial mount, load searches from localStorage
  useEffect(() => {
    try {
      const storedSearches = window.localStorage.getItem(STORAGE_KEY);
      if (storedSearches) {
        setSearches(JSON.parse(storedSearches));
      }
    } catch (error) {
      console.error("Failed to read recent searches from localStorage", error);
    }
  }, []);

  const addSearch = useCallback((query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setSearches(prevSearches => {
      // Remove the query if it already exists to move it to the front
      const filtered = prevSearches.filter(s => s.toLowerCase() !== trimmedQuery.toLowerCase());
      // Add the new query to the beginning and respect the MAX_SEARCHES limit
      const newSearches = [trimmedQuery, ...filtered].slice(0, MAX_SEARCHES);

      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newSearches));
      } catch (error) {
        console.error("Failed to save recent searches to localStorage", error);
      }
      
      return newSearches;
    });
  }, []);
  
  const clearSearches = useCallback(() => {
    setSearches([]);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear recent searches from localStorage", error);
    }
  }, []);

  return { searches, addSearch, clearSearches };
};
