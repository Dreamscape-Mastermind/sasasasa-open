"use client";

import { Calendar, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import moment from "moment-timezone";
import { Event } from "@/types";
import { truncateText } from "@/lib/utils";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLogger } from "@/hooks/useLogger";

interface EventCardProps {
  item: Event;
  className?: string;
}

// Helper function to truncate description
const truncateDescription = (description: string, maxLength: number = 150): string => {
  return truncateText(description, maxLength);
};

export default function EventCard({ item, className = "" }: EventCardProps) {

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
  const defaultPoster = "/images/poster_1.jpeg";
  
  return (
    <Link href={`/e/${item.short_url || item.id}`} className={`block ${className}`} onClick={handleClick}>
        <div className="h-[220px] w-full overflow-hidden relative group">
          <Image
            src={item.cover_image || defaultPoster}
            height={560}
            width={560} 
            alt={`${item.title} poster`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
            <Calendar size={15} strokeWidth={1.5} className="mr-1.5 text-red-600" />
            <span className="text-sm">
              {moment(item.start_date).format('MMM D')}
              {item.end_date && ` - ${moment(item.end_date).format('MMM D')}`}
            </span>
          </div>
          
          {item.venue && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2 opacity-0 animate-fadeIn animation-delay-300">
              <MapPin size={15} strokeWidth={1.5} className="mr-1.5 text-red-600" />
              <span className="text-sm line-clamp-1">{item.venue}</span>
            </div>
          )}
          
          {item.start_date && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 opacity-0 animate-fadeIn animation-delay-200">
              <Clock size={15} strokeWidth={1.5} className="mr-1.5 text-red-600" />
              <span className="text-sm">
                {item.timezone 
                  ? moment(item.start_date).tz(item.timezone).format('h:mm A z')
                  : moment(item.start_date).format('h:mm A')}
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
