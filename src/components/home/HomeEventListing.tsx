"use client";

import { Calendar, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Event } from "@/types/event";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLogger } from "@/hooks/useLogger";
import EventCard from "../EventCard";

interface HomeEventListingProps {
  eventListing?: Event[];
  isLoading?: boolean;
}

export function HomeEventListing({
  eventListing,
  isLoading,
}: HomeEventListingProps) {
  const analytics = useAnalytics();
  const logger = useLogger({ context: "HomeEventListing" });

  const handleViewAllClick = () => {
    try {
      analytics.trackUserAction(
        "view_all_past_events",
        "navigation",
        "past_events"
      );
      logger.info("User clicked view all past events", {
        source: "past_events_section",
        eventCount: eventListing?.length || 0,
      });
    } catch (error) {
      logger.error("Failed to track view all click", error);
      analytics.trackError(error as Error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">All Experiences</h2>
          <Link href="/e" onClick={handleViewAllClick}>
            <Button variant="ghost">View All Experiences</Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-video w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            : eventListing
                ?.slice(0, 6)
                .map((event) => <EventCard key={event.id} item={event} />)}
        </div>
      </div>
    </div>
  );
}

interface EventCardProps {
  event: Event;
}

// function EventCard({ event }: EventCardProps) {
//   const analytics = useAnalytics();
//   const logger = useLogger({ context: "EventCard" });

//   const handleClick = () => {
//     try {
//       analytics.trackUserAction("view_past_event", "event", event.title);
//       logger.info("User viewed past event details", {
//         eventId: event.id,
//         eventTitle: event.title,
//         eventDate: event.start_date,
//         eventLocation: event.location?.name || "Online",
//         eventPrice: event.price,
//         hasPerformers: event.performers?.length > 0,
//         performerCount: event.performers?.length || 0,
//       });
//     } catch (error) {
//       logger.error("Failed to handle event selection", error);
//       analytics.trackError(error as Error, {
//         eventId: event.id,
//         eventTitle: event.title,
//       });
//     }
//   };

//   const handlePlayClick = (e: React.MouseEvent) => {
//     e.preventDefault();
//     try {
//       analytics.trackUserAction(
//         "play_past_event_preview",
//         "event",
//         event.title
//       );
//       logger.info("User clicked play preview", {
//         eventId: event.id,
//         eventTitle: event.title,
//       });
//     } catch (error) {
//       logger.error("Failed to handle play preview click", error);
//       analytics.trackError(error as Error);
//     }
//   };

//   return (
//     <Link
//       href={`/e/${event.short_url}`}
//       className="group"
//       onClick={handleClick}
//     >
//       <div className="relative overflow-hidden rounded-lg">
//         <div className="aspect-video relative">
//           <img
//             src={event.cover_image || "/placeholder-event.jpg"}
//             alt={event.title}
//             className="object-cover w-full h-full transition-transform group-hover:scale-105"
//           />
//           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
//             <Button
//               size="icon"
//               variant="ghost"
//               className="text-white"
//               onClick={handlePlayClick}
//             >
//               <Play className="h-8 w-8" />
//             </Button>
//           </div>
//         </div>
//         <div className="p-4 bg-card">
//           <h3 className="font-semibold text-lg">{event.title}</h3>
//           <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
//             <Calendar className="h-4 w-4" />
//             {new Date(event.start_date).toLocaleDateString()}
//           </div>
//           <div className="flex items-center justify-between mt-4">
//             <div className="text-sm text-muted-foreground">
//               {event.location?.name || "Online"}
//             </div>
//             <div className="font-semibold">${event.price}</div>
//           </div>
//         </div>
//       </div>
//     </Link>
//   );
// }
