import "react-datepicker/dist/react-datepicker.css";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Checkbox } from "@/components/ui/checkbox";
import DatePicker from "react-datepicker";
import { EventQueryParams } from "@/types/event";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useEvent } from "@/hooks/useEvent";

interface EventFiltersProps {
  filters: EventQueryParams;
  onFilterChange: (filters: EventQueryParams) => void;
  className?: string;
}

export function EventFilters({
  filters,
  onFilterChange,
  className,
}: EventFiltersProps) {
  const { useCategories, useEventTypes, useEventFormats, useEventTags } =
    useEvent();

  // Fetch filter options with loading states
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories();
  const { data: eventTypesData, isLoading: eventTypesLoading } =
    useEventTypes();
  const { data: eventFormatsData, isLoading: eventFormatsLoading } =
    useEventFormats();
  const { data: eventTagsData, isLoading: eventTagsLoading } = useEventTags({
    trending: true,
    limit: 20,
  });

  const handleCheckboxChange = (
    key: keyof EventQueryParams,
    value: boolean
  ) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const handleInputChange = (key: keyof EventQueryParams, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const handleNumberInputChange = (
    key: keyof EventQueryParams,
    value: string
  ) => {
    const numValue = value === "" ? undefined : Number(value);
    onFilterChange({
      ...filters,
      [key]: numValue,
    });
  };

  const handleDateChange = (
    key: keyof EventQueryParams,
    value: string | undefined
  ) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const handleOrderingChange = (value: string) => {
    onFilterChange({
      ...filters,
      ordering: value,
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search */}
      <div className="space-y-2">
        <Label>Search</Label>
        <Input
          placeholder="Search events..."
          value={filters.search || ""}
          onChange={(e) => handleInputChange("search", e.target.value)}
        />
      </div>

      <Separator />

      {/* Status Filter */}
      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={filters.status}
          onValueChange={(value) => handleInputChange("status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Category Filter */}
      <div className="space-y-2">
        <Label>Category</Label>
        {categoriesLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select
            value={filters.category || "all"}
            onValueChange={(value) =>
              handleInputChange("category", value === "all" ? "" : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoriesData?.result?.results?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Separator />

      {/* Event Type Filter */}
      <div className="space-y-2">
        <Label>Event Type</Label>
        {eventTypesLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select
            value={filters.event_type || "all"}
            onValueChange={(value) =>
              handleInputChange("event_type", value === "all" ? "" : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {eventTypesData?.result?.results?.map((eventType) => (
                <SelectItem key={eventType.id} value={eventType.id}>
                  {eventType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Separator />

      {/* Event Format Filter */}
      <div className="space-y-2">
        <Label>Event Format</Label>
        {eventFormatsLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select
            value={filters.format || "all"}
            onValueChange={(value) =>
              handleInputChange("format", value === "all" ? "" : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Formats</SelectItem>
              {eventFormatsData?.result?.results?.map((format) => (
                <SelectItem key={format.id} value={format.id}>
                  {format.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Separator />

      {/* Featured Events */}
      <div className="space-y-2">
        <Label>Special Filters</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={filters.featured}
              onCheckedChange={(checked) =>
                handleCheckboxChange("featured", checked as boolean)
              }
            />
            <Label htmlFor="featured">Featured Events</Label>
          </div>
          {filters.featured && (
            <DatePicker
              selected={
                filters.featured_until ? new Date(filters.featured_until) : null
              }
              onChange={(date) =>
                handleDateChange("featured_until", date?.toISOString())
              }
              placeholderText="Select featured until date"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          )}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_recurring"
              checked={filters.is_recurring}
              onCheckedChange={(checked) =>
                handleCheckboxChange("is_recurring", checked as boolean)
              }
            />
            <Label htmlFor="is_recurring">Recurring Events</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_series"
              checked={filters.is_series}
              onCheckedChange={(checked) =>
                handleCheckboxChange("is_series", checked as boolean)
              }
            />
            <Label htmlFor="is_series">Event Series</Label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Location Filters */}
      <div className="space-y-2">
        <Label>Location</Label>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>City</Label>
            <Input
              placeholder="Filter by city"
              value={filters.location__city || ""}
              onChange={(e) =>
                handleInputChange("location__city", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Input
              placeholder="Filter by country"
              value={filters.location__country || ""}
              onChange={(e) =>
                handleInputChange("location__country", e.target.value)
              }
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Venue Filter */}
      <div className="space-y-2">
        <Label>Venue</Label>
        <Input
          placeholder="Search by venue name"
          value={filters.venue || ""}
          onChange={(e) => handleInputChange("venue", e.target.value)}
        />
      </div>

      <Separator />

      {/* Capacity Range */}
      <div className="space-y-2">
        <Label>Capacity Range</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Min Capacity</Label>
            <Input
              type="number"
              placeholder="Min"
              value={filters.capacity_min || ""}
              onChange={(e) =>
                handleNumberInputChange("capacity_min", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Max Capacity</Label>
            <Input
              type="number"
              placeholder="Max"
              value={filters.capacity_max || ""}
              onChange={(e) =>
                handleNumberInputChange("capacity_max", e.target.value)
              }
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Date Range */}
      <div className="space-y-2">
        <Label>Date Range</Label>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <DatePicker
              selected={
                filters.start_date ? new Date(filters.start_date) : null
              }
              onChange={(date) =>
                handleDateChange("start_date", date?.toISOString())
              }
              placeholderText="Select start date"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <DatePicker
              selected={filters.end_date ? new Date(filters.end_date) : null}
              onChange={(date) =>
                handleDateChange("end_date", date?.toISOString())
              }
              placeholderText="Select end date"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Age Restrictions */}
      <div className="space-y-2">
        <Label>Age Restrictions</Label>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Age Restriction Type</Label>
            <Select
              value={filters.age_restriction || "none"}
              onValueChange={(value) =>
                handleInputChange(
                  "age_restriction",
                  value === "none" ? "" : value
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select age restriction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Restriction</SelectItem>
                <SelectItem value="all_ages">All Ages</SelectItem>
                <SelectItem value="adults_only">Adults Only</SelectItem>
                <SelectItem value="children_only">Children Only</SelectItem>
                <SelectItem value="seniors_only">Seniors Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min Age</Label>
              <Input
                type="number"
                placeholder="Min age"
                value={filters.minimum_age || ""}
                onChange={(e) =>
                  handleNumberInputChange("minimum_age", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Max Age</Label>
              <Input
                type="number"
                placeholder="Max age"
                value={filters.maximum_age || ""}
                onChange={(e) =>
                  handleNumberInputChange("maximum_age", e.target.value)
                }
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Ordering */}
      <div className="space-y-2">
        <Label>Sort By</Label>
        <Select value={filters.ordering} onValueChange={handleOrderingChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select sort order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="start_date">Start Date (Earliest)</SelectItem>
            <SelectItem value="-start_date">Start Date (Latest)</SelectItem>
            <SelectItem value="end_date">End Date (Earliest)</SelectItem>
            <SelectItem value="-end_date">End Date (Latest)</SelectItem>
            <SelectItem value="created_at">Created Date (Newest)</SelectItem>
            <SelectItem value="-created_at">Created Date (Oldest)</SelectItem>
            <SelectItem value="price">Price (Low to High)</SelectItem>
            <SelectItem value="-price">Price (High to Low)</SelectItem>
            <SelectItem value="capacity">Capacity (Low to High)</SelectItem>
            <SelectItem value="-capacity">Capacity (High to Low)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
