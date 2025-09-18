"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useCallback, useEffect, useState } from "react";

import Autoplay from "embla-carousel-autoplay";
import FeaturedEventBanner from "./FeaturedEventBanner";
import { HomepageEvent } from "@/types/event";
import { cn } from "@/lib/utils";
import { useAnalytics } from "@/hooks/useAnalytics";
import useEmblaCarousel from "embla-carousel-react";
import { useLogger } from "@/hooks/useLogger";

export default function FeaturedCarousel({
  events,
}: {
  events: HomepageEvent[];
}) {
  const [plugin, setPlugin] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [disableMotion, setDisableMotion] = useState(false);
  const analytics = useAnalytics();
  const logger = useLogger({ context: "FeaturedCarousel" });
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [plugin].filter(Boolean)
  );

  useEffect(() => {
    const prefReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 640px)");
    const update = () => setDisableMotion(prefReduce.matches || mobile.matches);
    update();
    prefReduce.addEventListener("change", update);
    mobile.addEventListener("change", update);
    return () => {
      prefReduce.removeEventListener("change", update);
      mobile.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (disableMotion) {
      setPlugin(null);
    } else {
      setPlugin(Autoplay({ delay: 5000, stopOnInteraction: false }));
    }
  }, [disableMotion]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      const newIndex = emblaApi.selectedScrollSnap();
      setCurrentIndex(newIndex);
      try {
        const currentEvent = events[newIndex];
        analytics.trackUserAction(
          "carousel_slide_change",
          "event",
          currentEvent.title
        );
        logger.info("Carousel slide changed", {
          eventId: currentEvent.id,
          eventTitle: currentEvent.title,
          slideIndex: newIndex,
        });
      } catch (error) {
        logger.error("Failed to track carousel slide change", error);
        analytics.trackError(error as Error);
      }
    };

    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, events, analytics, logger]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) {
        try {
          emblaApi.scrollTo(index);
          const targetEvent = events[index];
          analytics.trackUserAction(
            "carousel_navigation",
            "event",
            targetEvent.title
          );
          logger.info("User navigated carousel", {
            eventId: targetEvent.id,
            eventTitle: targetEvent.title,
            targetIndex: index,
          });
        } catch (error) {
          logger.error("Failed to handle carousel navigation", error);
          analytics.trackError(error as Error);
        }
      }
    },
    [emblaApi, events, analytics, logger]
  );

  const handlePreviousClick = useCallback(() => {
    try {
      analytics.trackUserAction(
        "carousel_previous",
        "navigation",
        "featured_events"
      );
      logger.info("User clicked previous button");
    } catch (error) {
      logger.error("Failed to track previous button click", error);
      analytics.trackError(error as Error);
    }
  }, [analytics, logger]);

  const handleNextClick = useCallback(() => {
    try {
      analytics.trackUserAction(
        "carousel_next",
        "navigation",
        "featured_events"
      );
      logger.info("User clicked next button");
    } catch (error) {
      logger.error("Failed to track next button click", error);
      analytics.trackError(error as Error);
    }
  }, [analytics, logger]);

  return (
    <div className="relative">
      <Carousel
        className="w-full"
        plugins={plugin ? [plugin] : undefined}
        ref={emblaRef}
      >
        <CarouselContent>
          {events.map((event, index) => (
            <CarouselItem key={event.id || index}>
              <FeaturedEventBanner event={event} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          className="hidden md:flex left-6 lg:left-8 px-11 bg-[#CC322D] hover:bg-[#CC322D]/90 text-white border-none"
          onClick={handlePreviousClick}
        />
        <CarouselNext
          className="hidden md:flex right-6 lg:right-8 px-11 bg-[#CC322D] hover:bg-[#CC322D]/90 text-white border-none"
          onClick={handleNextClick}
        />
      </Carousel>

      {/* Dot indicators for mobile */}
      <div className="flex justify-center gap-2 mt-4 md:hidden">
        {events.map((_, index) => (
          <button
            key={index}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              currentIndex === index ? "bg-primary w-4" : "bg-gray-300"
            )}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
}
