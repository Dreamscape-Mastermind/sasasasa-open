"use client";

import { Event } from "@/types/event";
import {
  Calendar,
  ChevronDown,
  Filter,
  MapPin,
  Search,
  SlidersHorizontal,
  Ticket,
  X,
} from "lucide-react";
import { useCallback, useState, Suspense, useEffect } from "react";
import { EventQueryParams, EventStatus } from "@/types/event";
import { useEvent } from "@/hooks/useEvent";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/EventCard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { EventPagination } from "../events/pagination/EventPagination";

const SORT_OPTIONS = [
  { label: "Relevance", value: "" },
  { label: "Date (Ascending)", value: "start_date" },
  { label: "Date (Descending)", value: "-start_date" },
  { label: "Name (A-Z)", value: "title" },
  { label: "Name (Z-A)", value: "-title" },
];

function SearchResults({ events, isLoading }: { events?: Event[], isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-96 bg-muted/40 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-16 sm:py-24 border-2 border-dashed border-muted/60 rounded-2xl">
        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight">No events found</h3>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Try adjusting your search query or filters to find what you're looking
          for.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} item={event} variant="default" />
      ))}
    </div>
  );
}

import { EventFilters } from "../events/filters/EventFilters";

function Filters({
  filters,
  onFilterChange,
}: {
  filters: EventQueryParams;
  onFilterChange: (filters: EventQueryParams) => void;
}) {
  return <EventFilters filters={filters} onFilterChange={onFilterChange} />;
}

export function SearchContent() {
  const { useEvents } = useEvent();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState(SORT_OPTIONS[0]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);
  
  const [filters, setFilters] = useState<EventQueryParams>({
    status: EventStatus.PUBLISHED,
  });

  const queryParams: EventQueryParams = {
    ...filters,
    page,
    page_size: pageSize,
    search: debouncedSearchTerm || undefined,
    ordering: sortOrder.value || undefined,
  };

  const { data, isLoading, error } = useEvents(queryParams);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const totalPages = data?.result?.count
    ? Math.ceil(data.result.count / pageSize)
    : 0;

  return (
    <div className="space-y-8 sm:space-y-12">
      <div className="text-center pt-8 sm:pt-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter leading-tight">
          Find Your Next Experience
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Explore a world of live events, from concerts to workshops and
          everything in between.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by event, artist, or city..."
            className="w-full h-14 pl-12 pr-4 rounded-full text-base sm:text-lg border-2 shadow-sm"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-1/4 xl:w-1/5">
          <div className="sticky top-24">
            <div className="hidden lg:block p-6 bg-muted/30 rounded-2xl border">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" /> Filters
              </h3>
              <Filters filters={filters} onFilterChange={setFilters} />
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
                    <Filters filters={filters} onFilterChange={setFilters} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </aside>

        <main className="flex-1 lg:w-3/4 xl:w-4/5">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <p className="text-sm text-muted-foreground font-medium">
              {isLoading
                ? "Searching..."
                : `Showing ${data?.result?.results?.length || 0} of ${
                    data?.result?.count || 0
                  } results`}
            </p>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-xl w-full sm:w-auto"
                >
                  Sort by: {sortOrder.label}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {SORT_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => setSortOrder(opt)}
                    className={cn(
                      "cursor-pointer",
                      sortOrder.value === opt.value && "bg-muted font-semibold"
                    )}
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {error && (
             <div className="text-center py-16 sm:py-24 border-2 border-dashed border-destructive/50 rounded-2xl bg-destructive/5">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-destructive">Something went wrong</h3>
                <p className="text-destructive/80 mt-2">Failed to load events. Please try again later.</p>
            </div>
          )}

          {!error && (
            <Suspense fallback={<p>Loading search results...</p>}>
              <SearchResults events={data?.result?.results} isLoading={isLoading} />
            </Suspense>
          )}

          {totalPages > 1 && (
            <div className="mt-12">
              <EventPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                pageSize={pageSize}
                onPageSizeChange={() => {}} // Not implemented
                showPageSizeChanger={false}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
