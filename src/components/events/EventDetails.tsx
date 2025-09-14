"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Clock,
  ExternalLink,
  Heart,
  MapPin,
  Maximize2,
  Share2,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import Error from "@/components/ui/error";
import { Event } from "@/types/event";
import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import ReactMarkdown from "react-markdown";
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
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
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
  }, [event, analytics, logger]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showImageModal) {
        setShowImageModal(false);
      }
    };

    if (showImageModal) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [showImageModal]);

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

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  };

  const handleImageClick = () => {
    setShowImageModal(true);
    analytics.trackEvent({
      event: "poster_clicked",
      event_id: event?.id,
      event_name: event?.title,
    });
  };

  return (
    <div className="mx-auto px-4 sm:px-14">
      <div className="full-w overflow-hidden max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-8 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white max-w-6xl sm:max-w-5xl items-left sm:items-start mx-auto sm:p-8 rounded-2xl shadow-2xl border border-zinc-700/50 backdrop-blur-sm"
          style={{
            background: `
              linear-gradient(135deg, rgba(24, 24, 27, 0.95) 0%, rgba(39, 39, 42, 0.9) 50%, rgba(24, 24, 27, 0.95) 100%),
              radial-gradient(circle at 20% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)
            `,
          }}
        >
          {/* Event Image Section - Ready for Carousel */}
          <motion.div
            className="basis-1/2 relative group"
            whileHover={{ scale: 1.02, rotateY: 2 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ perspective: "1000px" }}
          >
            {/* Image Container - Future carousel will replace this */}
            <div
              className="relative w-full rounded-xl overflow-hidden shadow-2xl cursor-pointer"
              onClick={handleImageClick}
            >
              {/* Current single image - will be replaced with carousel component */}
              <div
                className="relative w-full"
                style={{
                  aspectRatio: imageDimensions
                    ? `${imageDimensions.width}/${imageDimensions.height}`
                    : "3/4",
                }}
              >
                {event.cover_image ? (
                  <Image
                    src={
                      hasError ? "/images/placeholdere.jpeg" : event.cover_image
                    }
                    alt={`${event.title} event poster`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: "contain" }}
                    className="transition-all duration-500 ease-out group-hover:scale-105"
                    priority
                    onLoad={handleImageLoad}
                    onError={(e) => {
                      setHasError(true);
                    }}
                  />
                ) : (
                  <Image
                    src="/images/placeholdere.jpeg"
                    alt="Default event image"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: "contain" }}
                    className="transition-all duration-500 ease-out group-hover:scale-105"
                    priority
                    onLoad={handleImageLoad}
                  />
                )}
              </div>

              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Click to expand indicator */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-2">
                  <Maximize2 className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">
                    Click to expand
                  </span>
                </div>
              </div>

              {/* Floating action buttons */}
              <motion.div
                className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
                initial={{ opacity: 0, y: -10 }}
                whileHover={{ opacity: 1, y: 0 }}
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add favorite functionality here
                  }}
                >
                  <Heart className="w-4 h-4 text-white" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    shareEvent("copy");
                  }}
                >
                  <Share2 className="w-4 h-4 text-white" />
                </motion.button>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="basis-1/2 text-left px-5 pb-4 sm:px-0 sm:pb-0 sm:pt-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Date and Time Section */}
            <motion.div
              className="flex flex-col gap-3 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {event.start_date && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-amber-300">
                    <Calendar className="w-5 h-5" />
                    <span className="text-lg font-medium">
                      {formatEventDate(event.start_date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span className="text-base">
                      {formatEventTime(event.start_date)}
                    </span>
                    {event.end_date && (
                      <>
                        <span className="text-gray-500">-</span>
                        <span>{formatEventTime(event.end_date)}</span>
                      </>
                    )}
                    <span className="text-sm text-gray-400 ml-1">
                      {event.timezone ? `(${event.timezone})` : "(EAT)"}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Event Title */}
            <motion.h1
              className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{
                backgroundImage:
                  "linear-gradient(to right, #ec4899, #8b5cf6, #06b6d4)",
                transition: { duration: 0.3 },
              }}
            >
              {event.title || "Untitled Event"}
            </motion.h1>

            {/* Event Description */}
            <motion.div
              className="mb-4 text-gray-200 text-base leading-relaxed markdown-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {event.description ? (
                <div className="prose prose-invert prose-lg max-w-none">
                  <ReactMarkdown>{event.description}</ReactMarkdown>
                </div>
              ) : (
                <p className="italic text-gray-400">No description available</p>
              )}
            </motion.div>

            {/* Performers section */}
            {event.performers && event.performers.length > 0 && (
              <motion.div
                className="mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-pink-400" />
                  <h4 className="text-xl font-semibold text-white">
                    Featured Artists
                  </h4>
                </div>
                <div className="flex flex-wrap gap-3">
                  {event.performers.map((performer, index) => (
                    <motion.div
                      key={performer.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                    >
                      <Link
                        href={performer.spotify_url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handlePerformerClick(performer)}
                        className="group flex items-center gap-2 bg-gradient-to-r from-zinc-800 to-zinc-700 hover:from-pink-600 hover:to-purple-600 px-4 py-3 rounded-full transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg border border-zinc-600 hover:border-pink-400"
                      >
                        <Star className="w-4 h-4 text-yellow-400 group-hover:text-yellow-300" />
                        <span className="font-medium text-white group-hover:text-white">
                          {performer.name}
                        </span>
                        {performer.spotify_url && (
                          <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors" />
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          className="text-[14px] sm:text-base px-3 sm:px-0 sm:mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {/* Venue section */}
          <motion.div
            className="my-8"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-6 h-6 text-pink-400" />
              <h2 className="text-2xl font-bold text-white">VENUE</h2>
            </div>
            {!event.venue || event.venue === "Location TBA" ? (
              <motion.div
                className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700/50"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-lg text-gray-300 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  Location to be announced
                </p>
              </motion.div>
            ) : (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      event.venue
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleVenueClick}
                    className="group flex items-center gap-3 bg-gradient-to-r from-zinc-800/80 to-zinc-700/80 hover:from-blue-600/80 hover:to-purple-600/80 backdrop-blur-sm px-6 py-4 rounded-xl transition-all duration-300 ease-out hover:shadow-lg border border-zinc-600/50 hover:border-blue-400/50"
                  >
                    <div className="p-2 bg-blue-500/20 group-hover:bg-blue-400/30 rounded-lg transition-colors">
                      <MapPin className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                    </div>
                    <span className="text-lg font-medium text-white group-hover:text-white">
                      {event.venue}
                    </span>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors ml-auto" />
                  </Link>
                </motion.div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="map" className="border-none">
                    <AccordionTrigger className="py-3 text-blue-400 hover:text-blue-300 transition-all duration-300 ease-in-out hover:bg-zinc-800/50 rounded-lg px-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        View on map
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="transition-all duration-500 ease-in-out">
                      <motion.div
                        className="w-full h-48 rounded-xl overflow-hidden shadow-2xl bg-zinc-800 border border-zinc-700/50"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ scale: 1.01 }}
                      >
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
                          className="rounded-xl"
                        />
                      </motion.div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </motion.div>
            )}
          </motion.div>

          {/* Tickets section */}
          <motion.div
            className="my-8 sm:my-12"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-pink-400" />
              <h2 className="text-2xl font-bold text-white">TICKETS</h2>
            </div>
            {event.available_tickets && event.available_tickets.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Tickets
                  tickets={
                    (event.available_tickets as TicketType[])
                      .filter((ticket) => ticket.is_public !== false) // Only show public tickets
                      .sort(
                        (a, b) =>
                          new Date(b.created_at || 0).getTime() -
                          new Date(a.created_at || 0).getTime()
                      ) // Latest first
                  }
                  formatDate={formatDateCustom}
                  slug={slug}
                />
              </motion.div>
            ) : (
              <motion.div
                className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-8 border border-zinc-700/50 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Clock className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <p className="text-lg text-gray-300">Tickets coming soon</p>
                <p className="text-sm text-gray-400 mt-2">
                  Stay tuned for updates
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Social sharing section */}
          <motion.div
            className="my-8"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Share2 className="w-6 h-6 text-pink-400" />
              <h2 className="text-2xl font-bold text-white">
                SHARE THIS EVENT
              </h2>
            </div>
            <motion.div
              className="flex gap-4 flex-wrap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {[
                {
                  platform: "facebook",
                  label: "Share on Facebook",
                  color: "hover:bg-blue-600",
                },
                {
                  platform: "twitter",
                  label: "Share on Twitter",
                  color: "hover:bg-sky-500",
                },
                {
                  platform: "whatsapp",
                  label: "Share on WhatsApp",
                  color: "hover:bg-green-500",
                },
                {
                  platform: "copy",
                  label: "Copy link",
                  color: "hover:bg-purple-600",
                },
              ].map(({ platform, label, color }, index) => (
                <motion.button
                  key={platform}
                  onClick={() => shareEvent(platform)}
                  className={`group p-4 bg-gradient-to-br from-zinc-800 to-zinc-700 ${color} text-white rounded-2xl transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg border border-zinc-600/50 hover:border-pink-400/50`}
                  aria-label={label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center gap-3">
                    {platform === "facebook" && (
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                      </svg>
                    )}
                    {platform === "twitter" && (
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                      </svg>
                    )}
                    {platform === "whatsapp" && (
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    )}
                    {platform === "copy" && (
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M7.127 22.562l-7.127 1.438 1.438-7.128 5.689 5.69zm1.414-1.414l11.228-11.225-5.69-5.692-11.227 11.227 5.689 5.69zm9.768-21.148l-2.816 2.817 5.691 5.691 2.816-2.819-5.691-5.689z" />
                      </svg>
                    )}
                    <span className="text-sm font-medium group-hover:text-white transition-colors">
                      {platform === "copy"
                        ? "Copy Link"
                        : platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Full-screen Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full h-full flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-6 right-6 z-20 p-3 bg-black/70 backdrop-blur-sm rounded-full hover:bg-black/90 transition-colors shadow-lg"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Full-size image container */}
              <div className="relative w-full h-full flex items-center justify-center">
                {event?.cover_image ? (
                  <Image
                    src={
                      hasError ? "/images/placeholdere.jpeg" : event.cover_image
                    }
                    alt={`${event.title} event poster - full size`}
                    width={imageDimensions?.width || 800}
                    height={imageDimensions?.height || 1000}
                    className="max-w-full max-h-full object-contain"
                    style={{
                      aspectRatio: imageDimensions
                        ? `${imageDimensions.width}/${imageDimensions.height}`
                        : "3/4",
                    }}
                    priority
                  />
                ) : (
                  <Image
                    src="/images/placeholdere.jpeg"
                    alt="Default event image - full size"
                    width={800}
                    height={1000}
                    className="max-w-full max-h-full object-contain"
                    style={{ aspectRatio: "3/4" }}
                    priority
                  />
                )}
              </div>

              {/* Image info overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6">
                <div className="max-w-4xl mx-auto text-center">
                  <h3 className="text-white text-2xl font-bold mb-2">
                    {event?.title || "Event Poster"}
                  </h3>
                  <p className="text-white/90 text-base mb-1">
                    Click outside to close
                  </p>
                  <p className="text-white/70 text-sm">
                    Press ESC key to close
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventDetails;
