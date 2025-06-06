"use client";

import { useCallback, useState } from "react";
import { EventQueryParams, EventStatus } from "@/types/event";
import { EventFilters } from "@/components/events/filters/EventFilters";
import { EventList } from "@/components/events/list/EventList";
import { EventPagination } from "@/components/events/pagination/EventPagination";
import { EventSearch } from "@/components/events/search/EventSearch";
import { EventSort } from "@/components/events/sort/EventSort";
import { useEvent } from "@/hooks/useEvent";
import { useLogger } from "@/hooks/useLogger";
import { useAnalytics } from "@/hooks/useAnalytics";

export function EventsContent() {
  const logger = useLogger({ context: "EventsPage" });
  const analytics = useAnalytics();
  const { useEvents } = useEvent();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<EventQueryParams>({
    status: EventStatus.PUBLISHED,
    page_size: 10,
  });

  const { data, isLoading, error } = useEvents(filters);

  const handleFilterChange = useCallback(
    (newFilters: EventQueryParams) => {
      logger.info("Filtering events", { filters: newFilters });
      analytics.trackUserAction(
        "filter_events",
        "filter",
        JSON.stringify(newFilters)
      );

      // Clean up empty filters
      const cleanedFilters = Object.fromEntries(
        Object.entries(newFilters).filter(([_, value]) => {
          if (value === null || value === undefined) return false;
          if (typeof value === "string" && value.trim() === "") return false;
          return true;
        })
      );

      setFilters(cleanedFilters as EventQueryParams);
      setPage(1); // Reset to first page when filters change
    },
    [logger, analytics]
  );

  const handleSearch = useCallback(
    (searchTerm: string) => {
      logger.info("Searching events", { searchTerm });
      analytics.trackUserAction("search_events", "search", searchTerm);

      setFilters((prev) => {
        const newFilters = { ...prev };
        if (searchTerm.trim()) {
          newFilters.search = searchTerm;
        } else {
          delete newFilters.search;
        }
        return newFilters;
      });
      setPage(1);
    },
    [logger, analytics]
  );

  const handleSort = useCallback(
    (ordering: string) => {
      logger.info("Sorting events", { ordering });
      analytics.trackUserAction("sort_events", "sort", ordering);

      setFilters((prev) => {
        const newFilters = { ...prev };
        if (ordering) {
          newFilters.ordering = ordering;
        } else {
          delete newFilters.ordering;
        }
        return newFilters;
      });
    },
    [logger, analytics]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      logger.info("Changing page", { page: newPage });
      analytics.trackUserAction(
        "change_page",
        "pagination",
        newPage.toString()
      );
      setPage(newPage);
    },
    [logger, analytics]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      logger.info("Changing page size", { pageSize: newPageSize });
      analytics.trackUserAction(
        "change_page_size",
        "pagination",
        newPageSize.toString()
      );
      setPageSize(newPageSize);
      setFilters((prev) => ({ ...prev, page_size: newPageSize }));
      setPage(1);
    },
    [logger, analytics]
  );

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Events</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover and explore upcoming events
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <EventFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            className="sticky top-4"
          />
        </div>

        <div className="lg:col-span-3">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <EventSearch onSearch={handleSearch} />
              <EventSort onSort={handleSort} />
            </div>

            <EventList
              events={data?.result?.results}
              isLoading={isLoading}
              error={error}
            />

            <EventPagination
              currentPage={page}
              totalPages={
                data?.result?.count
                  ? Math.ceil(data.result.count / pageSize)
                  : 0
              }
              onPageChange={handlePageChange}
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
