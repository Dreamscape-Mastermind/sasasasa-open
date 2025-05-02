"use client";

import Error from "../ui/error";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import FeaturedEventBanner from "@/components/FeaturedEventBanner";
import Spinner from "../ui/spiner";
import { useEvents } from "@/lib/hooks/useEvents";

export default function FeaturedEvents() {
  const {
    data: featuredEvents,
    isLoading,
    error,
  } = useEvents(1, {
    featured: true,
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error />;

  console.log(featuredEvents);

  const featuredEvent = featuredEvents?.results?.[0];

  return (
    <>
      {featuredEvents?.results?.length ? (
        <div className="my-8 relative px-1 md:px-12">
          <FeaturedCarousel events={featuredEvents.results} />
        </div>
      ) : (
        <FeaturedEventBanner event={featuredEvent} />
      )}
    </>
  );
}
