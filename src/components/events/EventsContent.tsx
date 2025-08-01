"use client";

import { useCallback, useState, Suspense } from "react";
import { EventQueryParams, EventStatus } from "@/types/event";
import { useEvent } from "@/hooks/useEvent";
import { EventList } from "@/components/events/list/EventList";
import { EventPagination } from "@/components/events/pagination/EventPagination";
import { EventFilters } from "@/components/events/filters/EventFilters";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter, SlidersHorizontal } from "lucide-react";
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

      const cleanedFilters = Object.fromEntries(
        Object.entries(newFilters).filter(([_, value]) => {
          if (value === null || value === undefined) return false;
          if (typeof value === "string" && value.trim() === "") return false;
          return true;
        })
      );

      setFilters(cleanedFilters as EventQueryParams);
      setPage(1);
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
  
  const totalPages = data?.result?.count
    ? Math.ceil(data.result.count / pageSize)
    : 0;

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Experiences</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover and explore upcoming experiences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-1/4 xl:w-1/5">
          <div className="sticky top-24">
            <div className="hidden lg:block p-6 bg-muted/30 rounded-2xl border">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" /> Filters
              </h3>
              <EventFilters
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full rounded-xl">
                    <Filter className="mr-2 h-4 w-4" />
                    Show Filters
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="py-6">
                    <EventFilters
                      filters={filters}
                      onFilterChange={handleFilterChange}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </aside>

        <main className="flex-1 lg:w-3/4 xl:w-4/5">
          <div className="flex flex-col space-y-4">
            <EventList
              events={data?.result?.results}
              isLoading={isLoading}
              error={error}
            />

            {totalPages > 1 && (
              <div className="mt-12">
                <EventPagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  pageSize={pageSize}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
