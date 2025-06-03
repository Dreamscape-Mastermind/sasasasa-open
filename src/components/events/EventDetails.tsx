"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React, { useEffect, useState } from "react";

import Error from "@/components/ui/error";
import { Event, type EventQueryParams } from "@/types/event";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { TicketType } from "@/types/ticket";
import { TicketTypeWithFlashSale } from "@/types/flashsale";
import { Tickets } from "@/components/events/tickets/Tickets";
import { formatDateCustom } from "@/lib/dataFormatters";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useEvent } from "@/hooks/useEvent";
import { useLogger } from "@/hooks/useLogger";
import { ROUTES } from "@/lib/constants";

type EventDetailsProps = {
  slug: string;
};

interface TicketWithFlashSale extends Omit<TicketType, "flash_sale"> {
  flash_sale: TicketTypeWithFlashSale | null;
}

const EventDetails: React.FC<EventDetailsProps> = ({ slug }) => {
  const logger = useLogger({ context: "EventDetails" });
  const analytics = useAnalytics();
  const { useEvents } = useEvent();
  const [filters, setFilters] = useState<EventQueryParams>({
    short_url: slug,
  });
  const { data: eventResponse, isLoading, error } = useEvents(filters);

  const event = eventResponse?.result?.results[0] as Event | undefined;

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
  }, [event, analytics, logger]);

  if (error) {
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

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center min-h-[60vh] w-full px-4">
        <div className="bg-zinc-900 rounded-xl shadow-lg flex flex-col sm:flex-row w-full max-w-5xl overflow-hidden">
          {/* Image skeleton */}
          <div className="sm:w-1/2 w-full aspect-square bg-zinc-800 flex items-center justify-center">
            <div className="w-4/5 h-4/5 bg-zinc-700 rounded-lg animate-pulse" />
          </div>
          {/* Text skeleton */}
          <div className="sm:w-1/2 w-full flex flex-col gap-4 p-8 justify-center">
            <div className="h-6 w-2/3 bg-zinc-800 rounded animate-pulse mb-2" />
            <div className="h-4 w-1/3 bg-zinc-800 rounded animate-pulse mb-4" />
            <div className="h-10 w-full bg-zinc-800 rounded animate-pulse mb-4" />
            <div className="h-24 w-full bg-zinc-800 rounded animate-pulse mb-4" />
            <div className="h-8 w-1/2 bg-zinc-800 rounded animate-pulse mb-2" />
            <div className="h-6 w-1/3 bg-zinc-800 rounded animate-pulse" />
          </div>
        </div>
        {/* Tickets skeleton */}
        <div className="w-full max-w-3xl mt-10">
          <div className="mb-3 h-6 w-32 bg-zinc-800 rounded animate-pulse" />
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-zinc-900 rounded-lg p-4 mb-4 shadow"
            >
              {/* Ticket name */}
              <div className="h-6 w-24 bg-zinc-800 rounded animate-pulse" />
              {/* Price */}
              <div className="h-6 w-20 bg-amber-400/30 rounded animate-pulse" />
              {/* Quantity controls */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-zinc-800 rounded-full animate-pulse" />
                <div className="h-6 w-6 bg-zinc-800 rounded animate-pulse" />
                <div className="h-8 w-8 bg-zinc-800 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
          {/* Checkout button skeleton */}
          <div className="h-12 w-full bg-red-500/30 rounded-lg animate-pulse mt-2" />
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

    const eventUrl = window.location.href;
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
    <div className="mx-auto px-4 sm:px-14">
      <div className="full-w overflow-hidden max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-8 bg-zinc-900 text-white max-w-6xl sm:max-w-5xl items-left sm:items-start mx-auto sm:p-8 transition-all duration-300 ease-in-out hover:shadow-xl">
          <div className="basis-1/2 relative aspect-square transition-transform duration-500 ease-in-out hover:scale-[1.02]">
            {event.cover_image ? (
              <div className="relative w-full h-full">
                <Image
                  src={event.cover_image}
                  alt={`${event.title} event poster`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: "contain" }}
                  className="transition-opacity duration-300 ease-in-out"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/default-event-image.jpg";
                  }}
                />
              </div>
            ) : (
              <div className="relative w-full h-full">
                <Image
                  src="/default-event-image.jpg"
                  alt="Default event image"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: "contain" }}
                  className="transition-opacity duration-300 ease-in-out"
                  priority
                />
              </div>
            )}
          </div>

          <div className="basis-1/2 text-left px-5 pb-4 sm:px-0 sm:pb-0 sm:pt-4 transition-all duration-300 ease-in-out">
            <div className="flex flex-col gap-1 text-gray-300">
              {event.start_date && (
                <>
                  <span className="text-lg transform transition-all duration-300 ease-in-out hover:text-white">
                    {formatEventDate(event.start_date)}
                  </span>
                  <div className="flex items-center gap-2 text-base">
                    <span>{formatEventTime(event.start_date)}</span>
                    {event.end_date && (
                      <>
                        <span>-</span>
                        <span>{formatEventTime(event.end_date)}</span>
                      </>
                    )}
                    <span className="text-sm">
                      {event.timezone ? `(${event.timezone})` : "(EAT)"}
                    </span>
                  </div>
                </>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold my-4 sm:my-6 transition-all duration-300 ease-in-out hover:text-blue-400">
              {event.title || "Untitled Event"}
            </h1>

            <div className="my-4 sm:my-6 text-gray-200 text-lg leading-relaxed markdown-content transition-all duration-300 ease-in-out hover:text-white">
              {event.description ? (
                <ReactMarkdown>{event.description}</ReactMarkdown>
              ) : (
                <p className="italic text-gray-400">No description available</p>
              )}
            </div>

            {/* Performers section */}
            {event.performers && event.performers.length > 0 && (
              <div className="mt-6 transform transition-all duration-300 ease-in-out">
                <h4 className="text-xl font-semibold mb-4">
                  Featured Artists:
                </h4>
                <div className="flex flex-wrap gap-4">
                  {event.performers.map((performer) => (
                    <Link
                      key={performer.name}
                      href={performer.spotify_url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handlePerformerClick(performer)}
                      className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-full transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md"
                    >
                      <span>{performer.name}</span>
                      {performer.spotify_url && (
                        <svg
                          className="w-4 h-4"
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
          </div>
        </div>

        <div className="max-w-3xl mx-auto text-[14px] sm:text-base px-3 sm:px-0 sm:mt-12">
          {/* Venue section */}
          <div className="my-8 transform transition-all duration-300 ease-in-out hover:translate-x-1">
            <h2 className="text-xl font-bold mb-3">VENUE</h2>
            {!event.venue || event.venue === "Location TBA" ? (
              <p className="font-helvetica text-lg">Location to be announced</p>
            ) : (
              <div className="space-y-3">
                <Link
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    event.venue
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleVenueClick}
                  className="font-helvetica hover:underline text-blue-400 text-lg inline-flex items-center gap-2 transition-all duration-300 ease-in-out hover:text-blue-300"
                >
                  <svg
                    className="w-5 h-5 transition-transform duration-300 ease-in-out group-hover:scale-110"
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
                    <AccordionTrigger className="py-2 text-blue-400 hover:text-blue-300 transition-all duration-300 ease-in-out">
                      View on map
                    </AccordionTrigger>
                    <AccordionContent className="transition-all duration-500 ease-in-out">
                      <div className="w-full h-40 rounded-lg overflow-hidden shadow-lg bg-zinc-800 transition-all duration-300 ease-in-out hover:shadow-xl">
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
          <div className="my-8 sm:my-12 transform transition-all duration-300 ease-in-out hover:translate-x-1">
            <h2 className="text-xl font-bold mb-3">TICKETS</h2>
            {event.available_tickets && event.available_tickets.length > 0 ? (
              <Tickets
                tickets={event.available_tickets as TicketType[]}
                formatDate={formatDateCustom}
                slug={slug}
              />
            ) : (
              <div>
                <p className="text-gray-500 italic">Tickets TBA</p>
              </div>
            )}
          </div>

          {/* Social sharing section */}
          <div className="my-8 transform transition-all duration-300 ease-in-out hover:translate-x-1">
            <h2 className="text-xl font-bold mb-3">SHARE THIS EVENT</h2>
            <div className="flex gap-3">
              <button
                onClick={() => shareEvent("facebook")}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-md"
                aria-label="Share on Facebook"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </button>
              <button
                onClick={() => shareEvent("twitter")}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-md"
                aria-label="Share on Twitter"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </button>
              <button
                onClick={() => shareEvent("whatsapp")}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-md"
                aria-label="Share on WhatsApp"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </button>
              <button
                onClick={() => shareEvent("copy")}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-md"
                aria-label="Copy link"
              >
                <svg
                  className="w-6 h-6"
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
    </div>
  );
};

export default EventDetails;
