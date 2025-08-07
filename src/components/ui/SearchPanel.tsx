"use client";

import { AnimatePresence, m } from "framer-motion";
import { Filter, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "@/components/Link";
import { SearchResults } from "@/types/search";
import React from "react";

interface SearchPanelProps {
  isSearchMode: boolean;
  searchScrollRef: React.RefObject<HTMLDivElement>;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  FILTER_OPTIONS: string[];
  debouncedSearchValue: string;
  recentSearches: string[];
  setSearchValue: (value: string) => void;
  debouncedSetSearch: (value: string) => void;
  handleSearchSubmit: (query: string) => void;
  isSearchLoading: boolean;
  searchResults: SearchResults | undefined;
  handleNavItemClick: () => void;
  handleRecentSearchClick: (query: string) => void;
  clearSearches: () => void;
}

const SearchPanel = ({
  isSearchMode,
  searchScrollRef,
  activeFilter,
  setActiveFilter,
  FILTER_OPTIONS,
  debouncedSearchValue,
  recentSearches,
  setSearchValue,
  debouncedSetSearch,
  handleSearchSubmit,
  isSearchLoading,
  searchResults,
  handleNavItemClick,
  handleRecentSearchClick,
  clearSearches,
}: SearchPanelProps) => {
  return (
    <AnimatePresence>
      {isSearchMode && (
        <m.div
          className="absolute top-0 left-0 right-0 min-h-screen bg-white/95 dark:bg-gray-950/95 backdrop-blur-md pt-24 z-40"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            type: "spring",
            stiffness: 450,
            damping: 28,
            duration: 0.35,
          }}
        >
          <div
            ref={searchScrollRef}
            className="h-full overflow-y-auto p-6 pb-24"
            style={{ maxHeight: "calc(100vh - 6rem)" }}
          >
            {/* Filter Bar  TODO reinstate when implemented*/}
            {/* <m.div
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <Filter className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                {FILTER_OPTIONS.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex-shrink-0 ${
                      activeFilter === filter
                        ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
                        : "bg-gray-100/80 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-gray-700/60 border border-transparent"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </m.div> */}

            {/* Recent Searches */}
            {!debouncedSearchValue && recentSearches.length > 0 && (
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Recent Searches
                  </h3>
                  <button
                    onClick={clearSearches}
                    className="text-xs font-medium text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 transition-colors flex items-center gap-1"
                  >
                    <X size={12} />
                    Clear
                  </button>
                </div>
                <div className="space-y-3 mb-8">
                  {recentSearches.map((search, index) => (
                    <m.button
                      key={search}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 hover:bg-gray-100/80 dark:hover:bg-gray-700/60 cursor-pointer transition-all duration-300 border border-gray-200/30 dark:border-gray-700/30 hover:border-gray-300/50 dark:hover:border-gray-600/50 text-left"
                      onClick={() => handleRecentSearchClick(search)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ x: 6, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">
                        {search}
                      </span>
                    </m.button>
                  ))}
                </div>
              </m.div>
            )}

            {/* Search Results */}
            {debouncedSearchValue && !isSearchLoading && searchResults && (
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                  Results for "{debouncedSearchValue}"
                </h3>
                <div className="space-y-4">
                  {Object.keys(searchResults).length > 0 ? (
                    Object.entries(searchResults).map(
                      ([category, items]) => (
                        <div key={category}>
                          <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                            {category}
                          </h4>
                          <div className="space-y-2">
                            {items.map((item) => (
                              <Link
                                href={`/e/${item.short_url}` || "#"}
                                key={item.id}
                                className="block w-full"
                                onClick={handleNavItemClick}
                              >
                                <m.div
                                  className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 hover:bg-gray-100/80 dark:hover:bg-gray-700/60 transition-all duration-300 border border-gray-200/30 dark:border-gray-700/30"
                                  whileHover={{ x: 4, scale: 1.01 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  {item.cover_image && (
                                    <Image
                                      src={item.cover_image}
                                      alt={item.name}
                                      width={48}
                                      height={48}
                                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                    />
                                  )}
                                  <div className="flex-1 truncate">
                                    <p className="font-medium text-gray-800 dark:text-gray-100 truncate">
                                      {item.name || item.title}
                                    </p>
                                    {item.location && (
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {item.location.city},{" "}
                                        {item.location.country}
                                      </p>
                                    )}
                                  </div>
                                </m.div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div className="text-center py-20">
                      <Search className="h-16 w-16 text-gray-200 dark:text-gray-700 mx-auto mb-6" />
                      <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                        No results found
                      </h3>
                      <p className="text-gray-400 dark:text-gray-500">
                        Try a different search term or filter.
                      </p>
                    </div>
                  )}
                </div>
              </m.div>
            )}

            {/* Loading State */}
            {isSearchLoading && (
              <div className="text-center py-20">
                <Search className="h-16 w-16 text-gray-200 dark:text-gray-700 mx-auto mb-6 animate-pulse" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Searching...
                </h3>
              </div>
            )}

            {/* Default state when no search value and no previous searches */}
            {!debouncedSearchValue &&
              !isSearchLoading &&
              recentSearches.length === 0 && (
                <m.div
                  className="text-center py-20"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Search className="h-16 w-16 text-gray-200 dark:text-gray-700 mx-auto mb-6" />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    What are you looking for?
                  </h3>
                  <p className="text-gray-400 dark:text-gray-500">
                    Search for events, venues, artists, and more
                  </p>
                </m.div>
              )}
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default SearchPanel;