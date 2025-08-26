import { Alert, AlertDescription } from "@/components/ui/alert";

import { AlertCircle } from "lucide-react";
import { Event } from "@/types/event";
import { Skeleton } from "@/components/ui/skeleton";
import EventCard from "@/components/EventCard";

interface EventListProps {
  events?: Event[];
  isLoading: boolean;
  error: Error | null;
}

export function EventList({ events, isLoading, error }: EventListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-[400px] rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load events. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!events?.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          No events found
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} item={event} />
      ))}
    </div>
  );
}
