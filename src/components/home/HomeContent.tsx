"use client";

import { useCallback, useMemo } from "react";

import { CTASection } from "./CTASection";
import { Features } from "./Features";
import { Hero } from "./Hero";
import HomepageEventCard from "@/components/HomepageEventCard";
import Link from "next/link";
import { NoDataCard } from "./NoDataCard";
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
  const { useHomepageEvents } = useEvent();
  const { hasAnyAccessLevel } = useAuth();
  const analytics = useAnalytics();
  const logger = useLogger({ context: "HomeContent" });

  const {
    data: homepageData,
    isLoading: isLoadingHomepage,
    error: homepageError,
    refetch: refetchHomepage,
  } = useHomepageEvents();

  // Memoize extracted data to prevent unnecessary re-renders
  const homepageDataMemo = useMemo(() => {
    if (!homepageData?.result) return null;

    return {
      carouselEvents: homepageData.result.carousel || [],
      featuredEvents: homepageData.result.featured_events || [],
      allEvents: homepageData.result.all_events?.results || [],
      flashSaleEvents: homepageData.result.flash_sale_events || [],
    };
  }, [homepageData]);

  // Memoize banner event and carousel state
  const bannerState = useMemo(() => {
    if (!homepageDataMemo)
      return { bannerEvent: null, hasMultipleFeaturedEvents: false };

    const bannerEvent = homepageDataMemo.carouselEvents[0];
    const hasMultipleFeaturedEvents =
      homepageDataMemo.carouselEvents.length > 1;

    return { bannerEvent, hasMultipleFeaturedEvents };
  }, [homepageDataMemo]);

  // Memoize retry function
  const handleRetry = useCallback(() => {
    refetchHomepage();
  }, [refetchHomepage]);

  return (
    <main className="mx-0 px-0">
      <div className="min-h-screen">
        <Hero />

        {/* Featured Banner/Carousel Section */}
        {isLoadingHomepage ? (
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
        ) : homepageError ? (
          <div className="my-8 relative px-1 md:px-2">
            <NoDataCard type="carousel" onRetry={handleRetry} isError={true} />
          </div>
        ) : bannerState.hasMultipleFeaturedEvents ? (
          <div className="my-8 relative px-1 md:px-2">
            <FeaturedCarousel events={homepageDataMemo?.carouselEvents || []} />
          </div>
        ) : bannerState.bannerEvent ? (
          <FeaturedEventBanner event={bannerState.bannerEvent} />
        ) : (
          <div className="my-8 relative px-1 md:px-2">
            <NoDataCard type="carousel" />
          </div>
        )}

        {/* Featured Events Section */}
        {isLoadingHomepage ? (
          <div className="container mx-auto px-4 py-16">
            <div className="space-y-8">
              <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
                <h2 className="text-3xl font-bold">Featured Experiences</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-video w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : homepageError ? (
          <div className="container mx-auto px-4 py-16">
            <div className="space-y-8">
              <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
                <h2 className="text-3xl font-bold">Featured Experiences</h2>
              </div>
              <NoDataCard
                type="featured"
                onRetry={handleRetry}
                isError={true}
              />
            </div>
          </div>
        ) : (homepageDataMemo?.featuredEvents.length ?? 0) > 0 ? (
          <div className="container mx-auto px-4 py-16">
            <div className="space-y-8">
              <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
                <h2 className="text-3xl font-bold">Featured Experiences</h2>
                <Link href="/e">
                  <button className="w-fit text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                    View All Experiences
                  </button>
                </Link>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {homepageDataMemo?.featuredEvents.map((event) => (
                  <HomepageEventCard key={event.id} item={event} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 py-16">
            <div className="space-y-8">
              <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
                <h2 className="text-3xl font-bold">Featured Experiences</h2>
              </div>
              <NoDataCard type="featured" />
            </div>
          </div>
        )}

        {/* All Events Section */}
        {isLoadingHomepage ? (
          <div className="container mx-auto px-4 py-16">
            <div className="space-y-8">
              <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
                <h2 className="text-3xl font-bold">All Experiences</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-video w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : homepageError ? (
          <div className="container mx-auto px-4 py-16">
            <div className="space-y-8">
              <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
                <h2 className="text-3xl font-bold">All Experiences</h2>
              </div>
              <NoDataCard type="recent" onRetry={handleRetry} isError={true} />
            </div>
          </div>
        ) : (homepageDataMemo?.allEvents.length ?? 0) > 0 ? (
          <div className="container mx-auto px-4 py-16">
            <div className="space-y-8">
              <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
                <h2 className="text-3xl font-bold">All Experiences</h2>
                <Link href="/e">
                  <button className="w-fit text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                    View All Experiences
                  </button>
                </Link>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {homepageDataMemo?.allEvents.map((event) => (
                  <HomepageEventCard key={event.id} item={event} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 py-16">
            <div className="space-y-8">
              <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
                <h2 className="text-3xl font-bold">All Experiences</h2>
              </div>
              <NoDataCard type="recent" />
            </div>
          </div>
        )}

        {/* Flash Sale Events Section */}
        {(homepageDataMemo?.flashSaleEvents.length ?? 0) > 0 && (
          <div className="container mx-auto px-4 py-16">
            <div className="space-y-8">
              <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
                <h2 className="text-3xl font-bold">🔥 Flash Sale Events</h2>
                <Link href="/e">
                  <button className="w-fit text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                    View All Flash Sales
                  </button>
                </Link>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {homepageDataMemo?.flashSaleEvents.slice(0, 3).map((event) => (
                  <HomepageEventCard key={event.id} item={event} />
                ))}
              </div>
            </div>
          </div>
        )}

        <Features />
        <CTASection />
      </div>
    </main>
  );
}
