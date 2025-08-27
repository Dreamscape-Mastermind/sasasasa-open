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
import { RotateCcw } from "lucide-react";

export function EventsContent() {
  const logger = useLogger({ context: "EventsPage" });
  const analytics = useAnalytics();
  const { useEvents } = useEvent();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [resetKey, setResetKey] = useState(0);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<EventQueryParams>({
    status: EventStatus.PUBLISHED,
    page: 1,
    page_size: 10,
  });

  const { data, isLoading, error } = useEvents(filters);

  const resultsCount = data?.result?.count ?? 0;

  const hasActiveFilters = (() => {
    const defaultFilters: EventQueryParams = {
      status: EventStatus.PUBLISHED,
      page: 1,
      page_size: pageSize,
    };
    const keys = new Set([
      ...Object.keys(filters ?? {}),
      ...Object.keys(defaultFilters),
    ]);
    for (const key of keys) {
      const current = (filters as Record<string, unknown>)[key];
      const def = (defaultFilters as Record<string, unknown>)[key];
      if (current !== def && !(current == null && def == null)) {
        return true;
      }
    }
    return false;
  })();

  const activeFilterCount = (() => {
    const excluded = new Set(["page", "page_size"]);
    let count = 0;
    for (const [key, value] of Object.entries(filters ?? {})) {
      if (excluded.has(key)) continue;
      if (key === "status" && value === EventStatus.PUBLISHED) continue;
      if (value === null || value === undefined) continue;
      if (typeof value === "string" && value.trim() === "") continue;
      count += 1;
    }
    return count;
  })();

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

      setFilters({
        ...(cleanedFilters as EventQueryParams),
        page: 1,
        page_size: pageSize,
      });
      setPage(1);
    },
    [logger, analytics, pageSize]
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
      setFilters((prev) => ({ ...prev, page: newPage }));
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
      setFilters((prev) => ({ ...prev, page_size: newPageSize, page: 1 }));
      setPage(1);
    },
    [logger, analytics]
  );

  const handleResetFilters = useCallback(() => {
    logger.info("Resetting filters");
    analytics.trackUserAction("reset_filters", "filter", "all");
    setFilters({ status: EventStatus.PUBLISHED, page: 1, page_size: pageSize });
    setPage(1);
    setResetKey((k) => k + 1);
  }, [logger, analytics, pageSize]);
  
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
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" /> Filters
              </h3>
              <div className="flex items-center justify-between mb-4">
                <span
                  aria-live="polite"
                  className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                >
                  {activeFilterCount} active
                </span>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-lg"
                    onClick={handleResetFilters}
                    aria-label="Reset all filters"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" /> Reset
                  </Button>
                )}
              </div>
              <EventFilters
                key={resetKey}
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>
            <div className="lg:hidden">
              <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
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
                  <div className="py-4">
                    <div className="flex items-center justify-between mb-4">
                      <span
                        aria-live="polite"
                        className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                      >
                        {activeFilterCount} active
                      </span>
                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-lg"
                          onClick={handleResetFilters}
                          aria-label="Reset all filters"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" /> Reset
                        </Button>
                      )}
                    </div>
                    <EventFilters
                      key={resetKey}
                      filters={filters}
                      onFilterChange={handleFilterChange}
                    />
                    <div className="mt-6 flex items-center gap-3">
                      <Button
                        variant="default"
                        className="flex-1 rounded-xl"
                        onClick={() => setIsMobileFiltersOpen(false)}
                        aria-label="Apply filters and close"
                      >
                        Show {resultsCount > 0 ? resultsCount : ""} results
                      </Button>
                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          className="rounded-xl"
                          onClick={handleResetFilters}
                          aria-label="Reset all filters"
                        >
                          Reset
                        </Button>
                      )}
                    </div>
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
