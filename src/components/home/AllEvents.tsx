"use client";

import Error from "../ui/error";
import EventListSection from "@/components/events/EventListSection";
import Spinner from "../ui/spiner";
import { useEvents } from "@/lib/hooks/useEvents";
import { useLogger } from "@/lib/hooks/useLogger";

export default function AllEvents() {
  const logger = useLogger({ context: "AllEvents" });

  const { data: allEvents, isLoading, error } = useEvents();

  if (isLoading) {
    logger.info("Loading all events...");
    return <Spinner />;
  }

  if (error) {
    logger.error("Error fetching all events", error);
    return <Error />;
  }

  logger.info("Successfully fetched all events", allEvents);

  // Extract the results array from the paginated response
  const events = allEvents?.results || [];

  return <EventListSection events={events} />;
}
