"use client";

import { useCallback, useState } from "react";

import { EventFilterParams } from "@/types/event";
import { EventFilters } from "@/components/events/filters/EventFilters";
import { EventList } from "@/components/events/list/EventList";
import { EventPagination } from "@/components/events/pagination/EventPagination";
import { EventSearch } from "@/components/events/search/EventSearch";
import { EventSort } from "@/components/events/sort/EventSort";
import { trackEvent } from "@/lib/analytics";
import { useEvents } from "@/lib/hooks/useEvents";
import { useLogger } from "@/lib/hooks/useLogger";

export default function EventsContent() {
  const logger = useLogger({ context: "EventsPage" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<EventFilterParams>({
    status: "PUBLISHED",
    page_size: 10,
  });

  const { data, isLoading, error } = useEvents(page, filters);

  const handleFilterChange = useCallback(
    (newFilters: EventFilterParams) => {
      logger.info("Filtering events", { filters: newFilters });
      trackEvent({
        event: "filter_events",
        filters: newFilters,
      });

      // Clean up empty filters
      const cleanedFilters = Object.fromEntries(
        Object.entries(newFilters).filter(([_, value]) => {
          if (value === null || value === undefined) return false;
          if (typeof value === "string" && value.trim() === "") return false;
          return true;
        })
      );

      setFilters(cleanedFilters as EventFilterParams);
      setPage(1); // Reset to first page when filters change
    },
    [logger]
  );

  const handleSearch = useCallback(
    (searchTerm: string) => {
      logger.info("Searching events", { searchTerm });
      trackEvent({
        event: "search_events",
        searchTerm,
      });

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
    [logger]
  );

  const handleSort = useCallback(
    (ordering: string) => {
      logger.info("Sorting events", { ordering });
      trackEvent({
        event: "sort_events",
        ordering,
      });

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
    [logger]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      logger.info("Changing page", { page: newPage });
      trackEvent({
        event: "change_page",
        page: newPage,
      });
      setPage(newPage);
    },
    [logger]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      logger.info("Changing page size", { pageSize: newPageSize });
      trackEvent({
        event: "change_page_size",
        pageSize: newPageSize,
      });
      setPageSize(newPageSize);
      setFilters((prev) => ({ ...prev, page_size: newPageSize }));
      setPage(1);
    },
    [logger]
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
              events={data?.results}
              isLoading={isLoading}
              error={error}
            />

            <EventPagination
              currentPage={page}
              totalPages={data?.count ? Math.ceil(data.count / pageSize) : 0}
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
