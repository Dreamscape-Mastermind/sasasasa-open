"use client";

import { EventQueryParams, EventStatus } from "@/types/event";

import { CTASection } from "./CTASection";
import { FeaturedEvents } from "./FeaturedEvents";
import { Features } from "./Features";
import { Hero } from "./Hero";
import { HomeEventListing } from "./HomeEventListing";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/contexts/AuthContext";
import { useEvent } from "@/hooks/useEvent";
import { useLogger } from "@/hooks/useLogger";

// Lazy load below-the-fold components
const FeaturedEventBanner = dynamic(
  () => import("@/components/home/FeaturedEventBanner"),
  {
    loading: () => (
      <div className="relative w-full h-[450px] sm:h-[450px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-xl mb-8">
        <Skeleton className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 sm:from-black/80 via-black/60 sm:via-black/40 to-transparent">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 sm:from-black/30 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 p-2 sm:p-6 md:p-8 w-full backdrop-blur-[2px] sm:backdrop-blur-[1px]">
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="flex gap-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  }
);

const FeaturedCarousel = dynamic(
  () => import("@/components/home/FeaturedEventBannerCarousel"),
  {
    loading: () => (
      <div className="relative w-full h-[450px] sm:h-[450px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-xl mb-8">
        <Skeleton className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 sm:from-black/80 via-black/60 sm:via-black/40 to-transparent">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 sm:from-black/30 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 p-2 sm:p-6 md:p-8 w-full backdrop-blur-[2px] sm:backdrop-blur-[1px]">
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="flex gap-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  }
);

export default function HomeContent() {
  const { useEvents } = useEvent();
  const { hasAnyAccessLevel } = useAuth();
  const analytics = useAnalytics();
  const logger = useLogger({ context: "HomeContent" });

  // Query parameters for featured events
  const featuredParams: EventQueryParams = {
    featured: true,
    status: EventStatus.PUBLISHED,
    ordering: "-start_date",
  };

  // Query parameters for past events
  const eventsParams: EventQueryParams = {
    status: EventStatus.PUBLISHED,
    ordering: "-start_date",
    page: 1,
  };

  const {
    data: featuredEvents,
    isLoading: isLoadingFeatured,
    error: featuredError,
  } = useEvents(featuredParams);

  const {
    data: eventListing,
    isLoading: isLoadingEventListing,
    error: eventListingError,
  } = useEvents(eventsParams);

  // Handle errors
  if (featuredError || eventListingError) {
    const error = featuredError || eventListingError;
    logger.error("Failed to fetch events", error);
    analytics.trackError(error as Error);
    return null;
  }

  // Get the most recent featured event for the banner
  const bannerEvent = featuredEvents?.result?.results?.[0];
  const hasMultipleFeaturedEvents =
    (featuredEvents?.result?.results?.length || 0) > 1;

  return (
    <main className="container mx-auto px-2">
      <div className="min-h-screen">
        <Hero />
        {isLoadingFeatured ? (
          <div className="relative w-full h-[450px] sm:h-[450px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-xl mb-8">
            <Skeleton className="w-full h-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 sm:from-black/80 via-black/60 sm:via-black/40 to-transparent">
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 sm:from-black/30 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-2 sm:p-6 md:p-8 w-full backdrop-blur-[2px] sm:backdrop-blur-[1px]">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-12 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                  <div className="flex gap-4">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : hasMultipleFeaturedEvents ? (
          <div className="my-8 relative px-1 md:px-2">
            <FeaturedCarousel
              events={featuredEvents?.result?.results?.slice(0, 3) || []}
            />
          </div>
        ) : bannerEvent ? (
          <FeaturedEventBanner event={bannerEvent} />
        ) : null}
        {featuredEvents?.result?.results?.length ? (
          <FeaturedEvents
            featuredEvents={featuredEvents.result.results?.slice(0, 3)}
            isLoading={isLoadingFeatured}
          />
        ) : null}
        <HomeEventListing
          eventListing={eventListing?.result?.results}
          isLoading={isLoadingEventListing}
        />
        <Features />
        <CTASection />
      </div>
    </main>
  );
}
