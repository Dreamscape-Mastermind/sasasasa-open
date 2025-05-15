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
import { Event } from "@/types";
import FeaturedEventBanner from "./FeaturedEventBanner";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";

export default function FeaturedCarousel({ events }: { events: Event[] }) {
  const [plugin, setPlugin] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [plugin].filter(Boolean)
  );

  useEffect(() => {
    setPlugin(Autoplay({ delay: 5000, stopOnInteraction: false }));
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCurrentIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

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
        <CarouselPrevious className="hidden md:flex left-6 lg:left-8 px-11 bg-[#CC322D] hover:bg-[#CC322D]/90 text-white border-none" />
        <CarouselNext className="hidden md:flex right-6 lg:right-8 px-11 bg-[#CC322D] hover:bg-[#CC322D]/90 text-white border-none" />
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
            onClick={() => {
              scrollTo(index);
            }}
          />
        ))}
      </div>
    </div>
  );
}
