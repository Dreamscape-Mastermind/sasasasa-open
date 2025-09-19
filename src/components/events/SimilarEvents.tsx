"use client";

import React, { useMemo } from "react";

import { Event } from "@/types/event";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateCustom } from "@/lib/dataFormatters";
import { useEvent } from "@/hooks/useEvent";

interface SimilarEventsProps {
  currentEvent: Event;
}

const SimilarEvents: React.FC<SimilarEventsProps> = React.memo(
  ({ currentEvent }) => {
    const { useEventsByCategory, useEventsByTag } = useEvent();

    // Memoize query parameters to prevent infinite re-renders
    const categoryParams = useMemo(
      () => ({
        category_id: currentEvent.category?.id,
        page_size: 4,
      }),
      [currentEvent.category?.id]
    );

    const tagParams = useMemo(
      () => ({
        tag: currentEvent.tags?.[0]?.name,
        page_size: 4,
      }),
      [currentEvent.tags?.[0]?.name]
    );

    // Fetch similar events by category (only if category exists)
    const { data: categoryEvents, isLoading: categoryLoading } =
      useEventsByCategory(categoryParams, {
        enabled: !!currentEvent.category?.id,
      });

    // Fetch similar events by tags (only if tags exist)
    const { data: tagEvents, isLoading: tagLoading } = useEventsByTag(
      tagParams,
      {
        enabled: !!currentEvent.tags?.[0]?.name,
      }
    );

    // Combine and filter out current event
    const similarEvents = useMemo(() => {
      return [
        ...(categoryEvents?.result?.results || []),
        ...(tagEvents?.result?.results || []),
      ]
        .filter((event) => event.id !== currentEvent.id)
        .slice(0, 4);
    }, [
      categoryEvents?.result?.results,
      tagEvents?.result?.results,
      currentEvent.id,
    ]);

    const isLoading = categoryLoading || tagLoading;

    if (isLoading) {
      return (
        <div className="my-8">
          <h2 className="text-xl font-bold mb-4">SIMILAR EVENTS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-zinc-800 rounded-lg overflow-hidden"
              >
                <Skeleton className="h-48 w-full" />
                <div className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (similarEvents.length === 0) {
      return null;
    }

    return (
      <div className="my-8">
        <h2 className="text-xl font-bold mb-4">SIMILAR EVENTS</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {similarEvents.map((event) => (
            <Link
              key={event.id}
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
                  {event.title}
                </h3>
                <p className="text-gray-400 text-xs mb-2">
                  {formatDateCustom(event.start_date)}
                </p>
                <p className="text-gray-500 text-xs line-clamp-1">
                  {event.venue}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }
);

SimilarEvents.displayName = "SimilarEvents";

export default SimilarEvents;
