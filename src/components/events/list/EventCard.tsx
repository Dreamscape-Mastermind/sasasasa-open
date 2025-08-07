import { Calendar, Clock, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Event } from "@/types/event";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface EventCardProps {
  event: Event;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="relative aspect-video">
        <img
          src={event.cover_image || "/placeholder-event.jpg"}
          alt={event.title}
          className="object-cover w-full h-full"
        />
        {event.featured && (
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 bg-yellow-500 text-white"
          >
            Featured
          </Badge>
        )}
      </div>

      <CardHeader>
        <div className="space-y-1">
          <h3 className="text-xl font-semibold line-clamp-2">{event.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {event.description}
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-2" />
            <span>
              {format(startDate, "MMM d, yyyy")}
              {endDate > startDate && ` - ${format(endDate, "MMM d, yyyy")}`}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-2" />
            <span>
              {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="line-clamp-1">{event.location.name}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/e/${event.short_url}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
