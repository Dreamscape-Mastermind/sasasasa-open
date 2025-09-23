"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import React, { useEffect, useState } from "react";

import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { SimilarEvent } from "@/types/event";
import { cn } from "@/lib/utils";
import { formatDateCustomClient } from "@/lib/dataFormatters";

interface SimilarEventsProps {
  similarEvents: SimilarEvent[];
}

const SimilarEvents: React.FC<SimilarEventsProps> = ({ similarEvents }) => {
  const [plugin, setPlugin] = useState<any>(null);
  const [disableMotion, setDisableMotion] = useState(false);

  useEffect(() => {
    const prefReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setDisableMotion(prefReduce.matches);
    update();
    prefReduce.addEventListener("change", update);
    return () => {
      prefReduce.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (disableMotion) {
      setPlugin(null);
    } else {
      setPlugin(Autoplay({ delay: 6000, stopOnInteraction: true }));
    }
  }, [disableMotion]);

  const EventCard = ({ event }: { event: SimilarEvent }) => (
    <Link
      href={`/e/${event.short_url}`}
      className="bg-zinc-800 rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg group"
    >
      <div className="relative h-48 w-full">
        <Image
          src={event.cover_image || "/images/placeholdere.jpeg"}
          alt={`${event.title} event poster`}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          style={{ objectFit: "cover" }}
          className="transition-opacity duration-300 ease-in-out group-hover:opacity-90"
        />
        {event.featured && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
            Featured
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
          {event.title || "Untitled Event"}
        </h3>
        <p className="text-gray-400 text-xs mb-2">
          {formatDateCustomClient(event.start_date)}
        </p>
        <p className="text-gray-500 text-xs line-clamp-1">
          {event.venue || "Venue TBA"}
        </p>
      </div>
    </Link>
  );

  if (similarEvents.length === 0) {
    return (
      <div className="my-8">
        <h2 className="text-xl font-bold mb-4">SIMILAR EVENTS</h2>
        <div className="flex flex-col items-center justify-center py-8 bg-zinc-800 rounded-lg">
          <p className="text-gray-400 text-base mb-3">
            No similar events found.
          </p>
          <Link
            href="/e"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors font-medium"
          >
            Browse more events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="my-8">
      <h2 className="text-xl font-bold mb-4">SIMILAR EVENTS</h2>
      <div className="relative">
        <Carousel
          className="w-full"
          plugins={plugin ? [plugin] : undefined}
          opts={{
            align: "start",
            loop: false,
            slidesToScroll: 4,
            breakpoints: {
              "(max-width: 640px)": { slidesToScroll: 1 },
              "(min-width: 641px) and (max-width: 1024px)": {
                slidesToScroll: 2,
              },
              "(min-width: 1025px)": { slidesToScroll: 4 },
            },
          }}
        >
          <CarouselContent className="-ml-2">
            {similarEvents.map((event) => (
              <CarouselItem
                key={event.id}
                className={cn(
                  "pl-2 basis-1/2 sm:basis-1/3 lg:basis-1/4",
                  "min-w-0"
                )}
              >
                <EventCard event={event} />
              </CarouselItem>
            ))}
          </CarouselContent>
          {similarEvents.length > 4 && (
            <>
              <CarouselPrevious className="left-2 bg-zinc-700/80 hover:bg-zinc-700 text-white border-none" />
              <CarouselNext className="right-2 bg-zinc-700/80 hover:bg-zinc-700 text-white border-none" />
            </>
          )}
        </Carousel>
      </div>
    </div>
  );
};

export default SimilarEvents;
