import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { EventQueryParams } from "@/types/event";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";

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
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Featured Events */}
        <div className="space-y-2">
          <Label>Event Type</Label>
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
                label="Featured Until"
                value={filters.featured_until}
                onChange={(date) => handleDateChange("featured_until", date)}
              />
            )}
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
            <DatePicker
              label="Start Date"
              value={filters.start_date}
              onChange={(date) => handleDateChange("start_date", date)}
            />
            <DatePicker
              label="End Date"
              value={filters.end_date}
              onChange={(date) => handleDateChange("end_date", date)}
            />
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
