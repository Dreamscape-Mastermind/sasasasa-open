"use client";

import { Calendar, Clock, MapPin, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import moment from "moment-timezone";
import { Event } from "@/types";
import { truncateText } from "@/lib/utils";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLogger } from "@/hooks/useLogger";
import { useState } from "react";

interface EventCardProps {
  item: Event;
  className?: string;
  variant?: "default" | "compact";
}

// Helper function to truncate description
const truncateDescription = (
  description: string,
  maxLength: number = 150
): string => {
  return truncateText(description, maxLength);
};

export default function EventCard({
  item,
  className = "",
  variant = "default",
}: EventCardProps) {
  const [hasError, setHasError] = useState(false);
  const analytics = useAnalytics();
  const logger = useLogger({ context: "EventCard" });

  const handleClick = () => {
    try {
      analytics.trackUserAction("view_past_event", "event", item.title);
      logger.info("User viewed event details", {
        eventId: item.id,
        eventTitle: item.title,
        eventDate: item.start_date,
        eventLocation: item.location?.name || "Online",
        eventPrice: item.price,
        hasPerformers: item.performers?.length > 0,
        performerCount: item.performers?.length || 0,
      });
    } catch (error) {
      logger.error("Failed to handle event selection", error);
      analytics.trackError(error as Error, {
        eventId: item.id,
        eventTitle: item.title,
      });
    }
  };

  // Default poster image if no cover image is provided
  const defaultPoster = "/images/placeholdere.jpeg";

  // Compact variant for dashboard
  if (variant === "compact") {
    return (
      <div
        className={`flex items-center gap-4 p-4 rounded-xl border border-muted/50 hover:bg-muted/30 transition-all cursor-pointer ${className}`}
      >
        <div className="relative w-14 h-14 flex-shrink-0">
          <Image
            src={hasError ? defaultPoster : item.cover_image || defaultPoster}
            alt={`${item.title} poster`}
            width={56}
            height={56}
            className="w-full h-full object-cover rounded-lg border border-muted/30"
            onError={() => setHasError(true)}
          />
          {/* Status indicator */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 leading-tight line-clamp-2">
            {item.title}
          </h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">
              {moment(item.start_date).format("MMM D, YYYY")}
            </span>
          </div>
          {item.venue && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{item.venue}</span>
            </div>
          )}
          {item.start_date && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">
                {item.timezone
                  ? moment(item.start_date).tz(item.timezone).format("h:mm A")
                  : moment(item.start_date).format("h:mm A")}
              </span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/e/${item.short_url || item.id}`}
      className={`block ${className}`}
      onClick={handleClick}
    >
      <div className="h-[220px] w-full overflow-hidden relative group">
        <Image
          src={hasError ? defaultPoster : item.cover_image || defaultPoster}
          height={560}
          width={560}
          alt={`${item.title} poster`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            setHasError(true);
          }}
        />
        <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full animate-fadeIn animation-delay-300">
          {"Event"}
        </div>

        {/* Description overlay */}
        {item.description && (
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 overflow-y-auto">
            <p className="text-white text-sm leading-relaxed max-h-full overflow-y-auto">
              {truncateDescription(item.description)}
            </p>
          </div>
        )}
      </div>

      <div className="p-4 text-left relative">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-lg mb-2 line-clamp-2 hover:text-red-600 transition-colors duration-150">
          {item.title}
        </h3>

        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2 opacity-0 animate-fadeIn animation-delay-400">
          <Calendar
            size={15}
            strokeWidth={1.5}
            className="mr-1.5 text-red-600"
          />
          <span className="text-sm">
            {moment(item.start_date).format("MMM D")}
            {item.end_date && ` - ${moment(item.end_date).format("MMM D")}`}
          </span>
        </div>

        {item.venue && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2 opacity-0 animate-fadeIn animation-delay-300">
            <MapPin
              size={15}
              strokeWidth={1.5}
              className="mr-1.5 text-red-600"
            />
            <span className="text-sm line-clamp-1">{item.venue}</span>
          </div>
        )}

        {item.start_date && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 opacity-0 animate-fadeIn animation-delay-200">
            <Clock
              size={15}
              strokeWidth={1.5}
              className="mr-1.5 text-red-600"
            />
            <span className="text-sm">
              {item.timezone
                ? moment(item.start_date).tz(item.timezone).format("h:mm A z")
                : moment(item.start_date).format("h:mm A")}
            </span>
          </div>
        )}

        <div className="mt-4 opacity-0 animate-fadeIn animation-delay-100">
          <span className="inline-block text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-5 py-1.5 rounded-full transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
}

// Named export for convenience
export { EventCard };
