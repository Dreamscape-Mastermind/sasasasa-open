"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";

import Error from "@/components/ui/error";
import { Event } from "@/types/event";
import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import ReactMarkdown from "react-markdown";
import { SimilarEvent } from "@/types/event";
import SimilarEvents from "./SimilarEvents";
import { TicketType } from "@/types/ticket";
import { TicketTypeWithFlashSale } from "@/types/flashsale";
import { Tickets } from "@/components/events/tickets/Tickets";
import { formatDateCustom } from "@/lib/dataFormatters";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useEvent } from "@/hooks/useEvent";
import { useLogger } from "@/hooks/useLogger";

type EventDetailsProps = {
  slug: string;
};

interface TicketWithFlashSale extends Omit<TicketType, "flash_sale"> {
  flash_sale: TicketTypeWithFlashSale | null;
}

const EventDetails: React.FC<EventDetailsProps> = ({ slug }) => {
  const logger = useLogger({ context: "EventDetails" });
  const analytics = useAnalytics();
  const { useEvent: useSingleEvent } = useEvent();

  const { data: eventResponse, isLoading, error } = useSingleEvent(slug);
  const [hasError, setHasError] = useState(false);
  const event = eventResponse?.result as Event | undefined;

  useEffect(() => {
    if (event) {
      analytics.trackEvent({
        event: "view_event",
        event_id: event.id,
        event_name: event.title,
        event_date: event.start_date,
        event_venue: event.venue,
      });
      logger.info("Event viewed", {
        event_id: event.id,
        event_name: event.title,
      });
    }
  }, [event]);

  if (error && !event) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error("Error loading event data", {
      error: errorMessage,
      slug,
    });
    analytics.trackError(error as Error, {
      context: "EventDetails",
      slug,
    });
    return <Error />;
  }

  // Handle loading state (only if no provided event and still loading)
  if (isLoading && !event) {
    return (
      <div className="flex flex-col items-center min-h-[60vh] w-full px-3 sm:px-4">
        <div className="bg-zinc-900 rounded-lg sm:rounded-xl shadow-lg w-full max-w-6xl overflow-hidden">
          {/* Image skeleton */}
          <div
            className="w-full bg-zinc-800 flex items-center justify-center"
            style={{ minHeight: "300px", maxHeight: "60vh" }}
          >
            <div className="w-4/5 h-4/5 bg-zinc-700 rounded-lg animate-pulse" />
          </div>
          {/* Text skeleton */}
          <div className="w-full flex flex-col gap-4 p-4 sm:p-6 lg:p-8">
            <div className="h-4 sm:h-6 w-2/3 bg-zinc-800 rounded animate-pulse mb-2" />
            <div className="h-3 sm:h-4 w-1/3 bg-zinc-800 rounded animate-pulse mb-4" />
            <div className="h-8 sm:h-10 w-full bg-zinc-800 rounded animate-pulse mb-4" />
            <div className="h-16 sm:h-24 w-full bg-zinc-800 rounded animate-pulse mb-4" />
            <div className="h-6 sm:h-8 w-1/2 bg-zinc-800 rounded animate-pulse mb-2" />
            <div className="h-4 sm:h-6 w-1/3 bg-zinc-800 rounded animate-pulse" />
          </div>
        </div>
        {/* Tickets skeleton */}
        <div className="w-full max-w-3xl mt-6 sm:mt-10">
          <div className="mb-3 h-5 sm:h-6 w-24 sm:w-32 bg-zinc-800 rounded animate-pulse" />
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-zinc-900 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 shadow"
            >
              {/* Ticket name */}
              <div className="h-5 sm:h-6 w-20 sm:w-24 bg-zinc-800 rounded animate-pulse" />
              {/* Price */}
              <div className="h-5 sm:h-6 w-16 sm:w-20 bg-amber-400/30 rounded animate-pulse" />
              {/* Quantity controls */}
              <div className="flex items-center gap-2">
                <div className="h-6 sm:h-8 w-6 sm:w-8 bg-zinc-800 rounded-full animate-pulse" />
                <div className="h-5 sm:h-6 w-5 sm:w-6 bg-zinc-800 rounded animate-pulse" />
                <div className="h-6 sm:h-8 w-6 sm:w-8 bg-zinc-800 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
          {/* Checkout button skeleton */}
          <div className="h-10 sm:h-12 w-full bg-red-500/30 rounded-lg animate-pulse mt-2" />
        </div>
      </div>
    );
  }

  // If no event data is provided, show a message
  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-9 box-border">
        <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
        <p className="text-lg text-gray-600 mb-6">
          The event information is not available.
        </p>
        <Link
          href={ROUTES.EVENTS}
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md transition-colors"
        >
          Browse Other Events
        </Link>
      </div>
    );
  }

  // Format dates for display
  const formatEventDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "Africa/Nairobi",
      });
    } catch (e) {
      return "Date TBA";
    }
  };

  const formatEventTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        timeZone: "Africa/Nairobi",
      });
    } catch (e) {
      return "";
    }
  };

  // Handle share functionality
  const shareEvent = (platform: string) => {
    if (!event) return;

    const eventUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareText = `Check out ${event.title} on Sasasasa.`;
    const imageUrl = event.cover_image
      ? encodeURIComponent(event.cover_image)
      : "";

    analytics.trackEvent({
      event: "share_event",
      platform,
      event_id: event.id,
      event_name: event.title,
    });
    logger.info("Event shared", {
      platform,
      event_id: event.id,
      event_name: event.title,
    });

    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            eventUrl
          )}`,
          "_blank"
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            shareText
          )}&url=${encodeURIComponent(eventUrl)}`,
          "_blank"
        );
        break;
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(
            shareText + " " + eventUrl
          )}`,
          "_blank"
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            eventUrl
          )}`,
          "_blank"
        );
        break;
      case "pinterest":
        if (imageUrl) {
          window.open(
            `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
              eventUrl
            )}&media=${imageUrl}&description=${encodeURIComponent(shareText)}`,
            "_blank"
          );
        } else {
          window.open(
            `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
              eventUrl
            )}&description=${encodeURIComponent(shareText)}`,
            "_blank"
          );
        }
        break;
      default:
        navigator.clipboard.writeText(eventUrl);
        alert("Link copied to clipboard!");
    }
  };

  // Add tracking for performer clicks
  const handlePerformerClick = (performer: any) => {
    if (!event) return;

    analytics.trackEvent({
      event: "performer_click",
      performer_name: performer.name,
      event_id: event.id,
      event_name: event.title,
    });
    logger.info("Performer clicked", {
      performer_name: performer.name,
      event_id: event.id,
      event_name: event.title,
    });
  };

  // Add tracking for venue clicks
  const handleVenueClick = () => {
    if (!event) return;

    analytics.trackEvent({
      event: "venue_click",
      event_id: event.id,
      event_name: event.title,
      venue: event.venue,
    });
    logger.info("Venue clicked", {
      event_id: event.id,
      event_name: event.title,
      venue: event.venue,
    });
  };

  return (
    <div className="mx-auto px-3 sm:px-6 lg:px-14">
      <div className="w-full overflow-hidden max-w-6xl mx-auto">
        {/* Event Poster - Full Width at Top with Modal */}
        <Dialog>
          <DialogTrigger asChild>
            <div className="relative w-full mb-6 sm:mb-8 rounded-lg sm:rounded-xl overflow-hidden transition-transform duration-500 ease-in-out hover:scale-[1.02] cursor-pointer group flex justify-center">
              {event.cover_image ? (
                <Image
                  src={
                    hasError ? "/images/placeholdere.jpeg" : event.cover_image
                  }
                  alt={`${event.title} event poster`}
                  width={1200}
                  height={800}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "auto",
                    maxHeight: "70vh",
                    backgroundColor: "#18181b",
                  }}
                  className="transition-opacity duration-300 ease-in-out group-hover:opacity-90 rounded-lg sm:rounded-xl"
                  priority
                  onError={(e) => {
                    setHasError(true);
                  }}
                />
              ) : (
                <Image
                  src="/images/placeholdere.jpeg"
                  alt="Default event image"
                  width={1200}
                  height={800}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "auto",
                    maxHeight: "70vh",
                    backgroundColor: "#18181b",
                  }}
                  className="transition-opacity duration-300 ease-in-out group-hover:opacity-90 rounded-lg sm:rounded-xl"
                  priority
                />
              )}
              {/* Overlay with zoom icon */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 ease-in-out flex items-center justify-center pointer-events-none">
                <div className="opacity-60 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                  <div className="bg-black/50 rounded-full p-2 sm:p-3 backdrop-blur-sm">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 bg-black border-none">
            <div className="relative w-full h-full">
              <Image
                src={
                  hasError
                    ? "/images/placeholdere.jpeg"
                    : event.cover_image || "/images/placeholdere.jpeg"
                }
                alt={`${event.title} event poster - Full View`}
                fill
                sizes="95vw"
                style={{ objectFit: "contain" }}
                className="transition-opacity duration-300 ease-in-out"
                priority
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Event Content - Single Column Below */}
        <div className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white p-4 sm:p-6 lg:p-8 rounded-lg sm:rounded-xl transition-all duration-300 ease-in-out hover:shadow-xl border border-gray-200 dark:border-zinc-700">
          <div className="flex flex-col gap-1 text-gray-600 dark:text-gray-300">
            {event.start_date && (
              <>
                <span className="text-base sm:text-lg transform transition-all duration-300 ease-in-out hover:text-gray-900 dark:hover:text-white">
                  {formatEventDate(event.start_date)}
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm sm:text-base">
                  <span>{formatEventTime(event.start_date)}</span>
                  {event.end_date && (
                    <>
                      <span className="hidden sm:inline">-</span>
                      <span className="sm:hidden">to</span>
                      <span>{formatEventTime(event.end_date)}</span>
                    </>
                  )}
                  <span className="text-xs sm:text-sm">
                    {event.timezone ? `(${event.timezone})` : "(EAT)"}
                  </span>
                </div>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold my-3 sm:my-4 lg:my-6 transition-all duration-300 ease-in-out hover:text-blue-600 dark:hover:text-blue-400 leading-tight">
            {event.title || "Untitled Event"}
          </h1>

          {/* Event metadata */}
          <div className="flex flex-wrap gap-2 mb-4">
            {event.category && (
              <span className="px-2 sm:px-3 py-1 bg-blue-100 dark:bg-blue-600/20 text-blue-800 dark:text-blue-300 rounded-full text-xs sm:text-sm border border-blue-200 dark:border-blue-600/30">
                {event.category.name}
              </span>
            )}
            {event.event_type && (
              <span className="px-2 sm:px-3 py-1 bg-green-100 dark:bg-green-600/20 text-green-800 dark:text-green-300 rounded-full text-xs sm:text-sm border border-green-200 dark:border-green-600/30">
                {event.event_type.name}
              </span>
            )}
            {event.format && (
              <span className="px-2 sm:px-3 py-1 bg-purple-100 dark:bg-purple-600/20 text-purple-800 dark:text-purple-300 rounded-full text-xs sm:text-sm border border-purple-200 dark:border-purple-600/30">
                {event.format.name}
              </span>
            )}
            {event.is_recurring && (
              <span className="px-2 sm:px-3 py-1 bg-orange-100 dark:bg-orange-600/20 text-orange-800 dark:text-orange-300 rounded-full text-xs sm:text-sm border border-orange-200 dark:border-orange-600/30">
                Recurring
              </span>
            )}
            {event.is_series && (
              <span className="px-2 sm:px-3 py-1 bg-pink-100 dark:bg-pink-600/20 text-pink-800 dark:text-pink-300 rounded-full text-xs sm:text-sm border border-pink-200 dark:border-pink-600/30">
                Series
              </span>
            )}
            {event.featured && (
              <span className="px-2 sm:px-3 py-1 bg-yellow-100 dark:bg-yellow-600/20 text-yellow-800 dark:text-yellow-300 rounded-full text-xs sm:text-sm border border-yellow-200 dark:border-yellow-600/30">
                Featured
              </span>
            )}
          </div>

          {/* Age restrictions */}
          {event.is_age_restricted && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-600/10 border border-red-200 dark:border-red-600/20 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span className="text-sm font-medium">
                  {event.age_restriction ||
                    (event.minimum_age && event.maximum_age
                      ? `Ages ${event.minimum_age}-${event.maximum_age}`
                      : event.minimum_age
                      ? `Ages ${event.minimum_age}+`
                      : event.maximum_age
                      ? `Ages up to ${event.maximum_age}`
                      : "Age Restricted")}
                </span>
              </div>
            </div>
          )}

          <div className="my-4 sm:my-6 text-gray-700 dark:text-gray-200 text-sm sm:text-base lg:text-lg leading-relaxed markdown-content transition-all duration-300 ease-in-out hover:text-gray-900 dark:hover:text-white">
            {event.description ? (
              <ReactMarkdown>{event.description}</ReactMarkdown>
            ) : (
              <p className="italic text-gray-500 dark:text-gray-400">
                No description available
              </p>
            )}
          </div>

          {/* Tags section */}
          {event.tags_data && event.tags_data.length > 0 && (
            <div className="mt-4 transform transition-all duration-300 ease-in-out">
              <h4 className="text-base sm:text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
                Tags:
              </h4>
              <div className="flex flex-wrap gap-2">
                {event.tags_data.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-md text-xs sm:text-sm border border-gray-200 dark:border-gray-600/30"
                    style={tag.color ? { borderColor: tag.color } : {}}
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Virtual event information */}
          {event.virtual_meeting_url && (
            <div className="mt-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-600/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z" />
                </svg>
                <span className="text-blue-700 dark:text-blue-400 font-medium text-sm sm:text-base">
                  Virtual Event
                </span>
              </div>
              {event.virtual_platform && (
                <p className="text-blue-600 dark:text-blue-300 text-xs sm:text-sm mb-2">
                  Platform: {event.virtual_platform}
                </p>
              )}
              {event.virtual_instructions && (
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-2">
                  {event.virtual_instructions}
                </p>
              )}
              <Link
                href={event.virtual_meeting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm sm:text-base"
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                Join Virtual Event
              </Link>
            </div>
          )}

          {/* Series information */}
          {event.is_series && event.series_name && (
            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-600/10 border border-purple-200 dark:border-purple-600/20 rounded-lg">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-purple-600 dark:text-purple-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-purple-700 dark:text-purple-400 font-medium">
                  {event.series_name}
                  {event.series_number && ` - Episode ${event.series_number}`}
                </span>
              </div>
            </div>
          )}

          {/* Performers section */}
          {event.performers && event.performers.length > 0 && (
            <div className="mt-4 sm:mt-6 transform transition-all duration-300 ease-in-out">
              <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
                Featured Artists:
              </h4>
              <div className="flex flex-wrap gap-2 sm:gap-4">
                {event.performers.map((performer) => (
                  <Link
                    key={performer.name}
                    href={performer.spotify_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handlePerformerClick(performer)}
                    className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 px-2 sm:px-3 py-1 sm:py-2 rounded-full transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md text-sm sm:text-base text-gray-700 dark:text-gray-300"
                  >
                    <span className="truncate max-w-[120px] sm:max-w-none">
                      {performer.name}
                    </span>
                    {performer.spotify_url && (
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                      </svg>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-4 sm:mt-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Agenda section */}
              {event.agenda && event.agenda.length > 0 && (
                <div className="transform transition-all duration-300 ease-in-out">
                  <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
                    Event Agenda:
                  </h4>
                  <div className="space-y-3">
                    {event.agenda.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 dark:bg-zinc-800/50 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-zinc-700/50"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                              {item.title}
                            </h5>
                            {item.speaker && (
                              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                                Speaker: {item.speaker}
                              </p>
                            )}
                            {item.description && (
                              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col sm:items-end gap-1">
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
                              <svg
                                className="w-3 h-3 sm:w-4 sm:h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                              </svg>
                              <span>
                                {item.start_time} - {item.end_time}
                              </span>
                            </div>
                            {item.location && (
                              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                                <span>{item.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQ section */}
              {event.faq && event.faq.length > 0 && (
                <div className="transform transition-all duration-300 ease-in-out">
                  <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
                    Frequently Asked Questions:
                  </h4>
                  <Accordion type="single" collapsible className="w-full">
                    {event.faq.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`faq-${index}`}
                        className="border border-gray-200 dark:border-zinc-700/50 rounded-lg mb-2 bg-white dark:bg-zinc-800/50"
                      >
                        <AccordionTrigger className="px-3 sm:px-4 py-3 text-left hover:no-underline">
                          <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                            {faq.question}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 sm:px-4 pb-3">
                          <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                            {faq.answer}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Speakers section */}
              {event.speakers && event.speakers.length > 0 && (
                <div className="transform transition-all duration-300 ease-in-out">
                  <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
                    Speakers:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {event.speakers.map((speaker, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 dark:bg-zinc-800/50 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-zinc-700/50"
                      >
                        <div className="flex items-start gap-3">
                          {speaker.image_url && (
                            <img
                              src={speaker.image_url}
                              alt={speaker.name}
                              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                              {speaker.name}
                            </h5>
                            {speaker.title && (
                              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm truncate">
                                {speaker.title}
                              </p>
                            )}
                            {speaker.bio && (
                              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 line-clamp-2">
                                {speaker.bio}
                              </p>
                            )}
                            <div className="flex gap-2 mt-2">
                              {speaker.linkedin_url && (
                                <a
                                  href={speaker.linkedin_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                  </svg>
                                </a>
                              )}
                              {speaker.twitter_url && (
                                <a
                                  href={speaker.twitter_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                  </svg>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sponsors section */}
              {event.sponsors && event.sponsors.length > 0 && (
                <div className="transform transition-all duration-300 ease-in-out">
                  <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
                    Sponsors:
                  </h4>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {event.sponsors.map((sponsor, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 dark:bg-zinc-800/50 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-zinc-700/50"
                      >
                        <div className="flex items-center gap-3">
                          {sponsor.logo_url && (
                            <img
                              src={sponsor.logo_url}
                              alt={sponsor.name}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                              {sponsor.name}
                            </h5>
                            {sponsor.sponsorship_level && (
                              <span className="inline-block px-2 py-1 bg-yellow-100 dark:bg-yellow-600/20 text-yellow-800 dark:text-yellow-300 rounded-full text-xs border border-yellow-200 dark:border-yellow-600/30">
                                {sponsor.sponsorship_level}
                              </span>
                            )}
                            {sponsor.description && (
                              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 line-clamp-2">
                                {sponsor.description}
                              </p>
                            )}
                            {sponsor.website_url && (
                              <a
                                href={sponsor.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors text-xs mt-1 inline-flex items-center gap-1"
                              >
                                Visit Website
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                                </svg>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Event Highlights section */}
              {event.highlights && event.highlights.length > 0 && (
                <div className="transform transition-all duration-300 ease-in-out">
                  <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
                    Event Highlights:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {event.highlights.map((highlight, index) => {
                      // Get appropriate icon based on highlight content
                      const getHighlightIcon = (text: string) => {
                        const lowerText = text.toLowerCase();
                        if (
                          lowerText.includes("wifi") ||
                          lowerText.includes("internet")
                        ) {
                          return (
                            <svg
                              className="w-5 h-5 text-blue-600 dark:text-blue-400"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                            </svg>
                          );
                        } else if (
                          lowerText.includes("parking") ||
                          lowerText.includes("car")
                        ) {
                          return (
                            <svg
                              className="w-5 h-5 text-purple-600 dark:text-purple-400"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                            </svg>
                          );
                        } else if (
                          lowerText.includes("food") ||
                          lowerText.includes("drink") ||
                          lowerText.includes("refreshment")
                        ) {
                          return (
                            <svg
                              className="w-5 h-5 text-orange-600 dark:text-orange-400"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z" />
                            </svg>
                          );
                        } else if (
                          lowerText.includes("music") ||
                          lowerText.includes("dj") ||
                          lowerText.includes("live")
                        ) {
                          return (
                            <svg
                              className="w-5 h-5 text-pink-600 dark:text-pink-400"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                            </svg>
                          );
                        } else if (
                          lowerText.includes("gift") ||
                          lowerText.includes("prize") ||
                          lowerText.includes("swag")
                        ) {
                          return (
                            <svg
                              className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.07 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
                            </svg>
                          );
                        } else if (
                          lowerText.includes("photo") ||
                          lowerText.includes("camera") ||
                          lowerText.includes("picture")
                        ) {
                          return (
                            <svg
                              className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 8c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                          );
                        } else {
                          return (
                            <svg
                              className="w-5 h-5 text-green-600 dark:text-green-400"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                          );
                        }
                      };

                      return (
                        <div
                          key={index}
                          className="group flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-zinc-800/50 dark:to-zinc-700/50 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-zinc-700/50 hover:shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] hover:border-blue-300 dark:hover:border-blue-600/30"
                        >
                          <div className="flex-shrink-0 p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-300">
                            {getHighlightIcon(highlight)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-gray-800 dark:text-gray-200 text-sm sm:text-base font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                              {highlight}
                            </span>
                          </div>
                          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <svg
                              className="w-4 h-4 text-blue-600 dark:text-blue-400"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                            </svg>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Social Media Links section */}
          {(event.facebook_url ||
            event.twitter_url ||
            event.instagram_url ||
            event.linkedin_url ||
            event.youtube_url ||
            event.tiktok_url ||
            event.snapchat_url ||
            event.discord_url ||
            event.telegram_url) && (
            <div className="mt-4 sm:mt-6 transform transition-all duration-300 ease-in-out">
              <h4 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900 dark:text-white">
                Follow This Event:
              </h4>

              {/* Social Media Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                {event.facebook_url && (
                  <a
                    href={event.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center justify-center p-2 sm:p-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md"
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 mb-1 group-hover:scale-110 transition-transform duration-200"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                    </svg>
                    <span className="text-xs font-medium">Facebook</span>
                  </a>
                )}

                {event.twitter_url && (
                  <a
                    href={event.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center justify-center p-2 sm:p-3 bg-sky-500 hover:bg-sky-600 dark:bg-sky-400 dark:hover:bg-sky-500 text-white rounded-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md"
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 mb-1 group-hover:scale-110 transition-transform duration-200"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                    <span className="text-xs font-medium">Twitter</span>
                  </a>
                )}

                {event.instagram_url && (
                  <a
                    href={event.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center justify-center p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md"
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 mb-1 group-hover:scale-110 transition-transform duration-200"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    <span className="text-xs font-medium">Instagram</span>
                  </a>
                )}

                {event.linkedin_url && (
                  <a
                    href={event.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center justify-center p-4 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
                  >
                    <svg
                      className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform duration-200"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    <span className="text-sm font-medium">LinkedIn</span>
                  </a>
                )}

                {event.youtube_url && (
                  <a
                    href={event.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center justify-center p-4 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-xl transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
                  >
                    <svg
                      className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform duration-200"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    <span className="text-sm font-medium">YouTube</span>
                  </a>
                )}

                {event.tiktok_url && (
                  <a
                    href={event.tiktok_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center justify-center p-4 bg-black hover:bg-gray-800 dark:bg-gray-900 dark:hover:bg-black text-white rounded-xl transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
                  >
                    <svg
                      className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform duration-200"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                    <span className="text-sm font-medium">TikTok</span>
                  </a>
                )}

                {event.discord_url && (
                  <a
                    href={event.discord_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center justify-center p-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-xl transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
                  >
                    <svg
                      className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform duration-200"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                    <span className="text-sm font-medium">Discord</span>
                  </a>
                )}

                {event.telegram_url && (
                  <a
                    href={event.telegram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center justify-center p-4 bg-blue-500 hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500 text-white rounded-xl transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
                  >
                    <svg
                      className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform duration-200"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.896-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                    <span className="text-sm font-medium">Telegram</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Social sharing section */}
          <div className="my-6 sm:my-8 transform transition-all duration-300 ease-in-out hover:translate-x-1">
            <h2 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 dark:text-white">
              SHARE THIS EVENT
            </h2>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => shareEvent("facebook")}
                className="p-2 sm:p-2 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-700 dark:text-white rounded-full transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-md"
                aria-label="Share on Facebook"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </button>
              <button
                onClick={() => shareEvent("twitter")}
                className="p-2 sm:p-2 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-700 dark:text-white rounded-full transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-md"
                aria-label="Share on Twitter"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </button>
              <button
                onClick={() => shareEvent("whatsapp")}
                className="p-2 sm:p-2 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-700 dark:text-white rounded-full transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-md"
                aria-label="Share on WhatsApp"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </button>
              <button
                onClick={() => shareEvent("copy")}
                className="p-2 sm:p-2 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-700 dark:text-white rounded-full transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-md"
                aria-label="Copy link"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7.127 22.562l-7.127 1.438 1.438-7.128 5.689 5.69zm1.414-1.414l11.228-11.225-5.69-5.692-11.227 11.227 5.689 5.69zm9.768-21.148l-2.816 2.817 5.691 5.691 2.816-2.819-5.691-5.689z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Content Sections */}
      <div className="max-w-3xl mx-auto text-sm sm:text-base px-3 sm:px-0 mt-6 sm:mt-8">
        {/* Venue section */}
        <div className="my-6 sm:my-8 transform transition-all duration-300 ease-in-out hover:translate-x-1">
          <h2 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 dark:text-white">
            VENUE
          </h2>
          {!event.venue || event.venue === "Location TBA" ? (
            <p className="font-helvetica text-base sm:text-lg text-gray-600 dark:text-gray-300">
              Location to be announced
            </p>
          ) : (
            <div className="space-y-3">
              <Link
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  event.venue
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleVenueClick}
                className="font-helvetica hover:underline text-blue-600 dark:text-blue-400 text-base sm:text-lg inline-flex items-center gap-2 transition-all duration-300 ease-in-out hover:text-blue-700 dark:hover:text-blue-300"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ease-in-out group-hover:scale-110"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" />
                </svg>
                {event.venue}
              </Link>

              <Accordion
                type="single"
                collapsible
                className="w-full border-none"
              >
                <AccordionItem value="map" className="border-none">
                  <AccordionTrigger className="py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300 ease-in-out">
                    View on map
                  </AccordionTrigger>
                  <AccordionContent className="transition-all duration-500 ease-in-out">
                    <div className="w-full h-40 rounded-lg overflow-hidden shadow-lg bg-gray-100 dark:bg-zinc-800 transition-all duration-300 ease-in-out hover:shadow-xl">
                      <iframe
                        title="Event Location"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(
                          event.venue
                        )}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                        allowFullScreen
                      ></iframe>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </div>

        {/* Tickets section */}
        <div className="my-6 sm:my-8 lg:my-12 transform transition-all duration-300 ease-in-out hover:translate-x-1">
          <h2 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 dark:text-white">
            TICKETS
          </h2>
          {event.available_tickets && event.available_tickets.length > 0 ? (
            <Tickets
              tickets={event.available_tickets as TicketType[]}
              formatDate={async (dateString: string) =>
                formatDateCustom(dateString)
              }
              slug={slug}
            />
          ) : (
            <div>
              <p className="text-gray-500 dark:text-gray-400 italic text-sm sm:text-base">
                Tickets TBA
              </p>
            </div>
          )}
        </div>

        {/* Similar Events section */}
        <SimilarEvents similarEvents={event.similar_events as SimilarEvent[]} />
      </div>
    </div>
  );
};

export default EventDetails;
