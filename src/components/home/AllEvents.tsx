"use client";

import Error from "../ui/error";
import EventListSection from "@/components/EventListSection";
import Spinner from "../ui/spiner";
import { useEvents } from "@/lib/hooks/useEvents";

export default function AllEvents() {
  const { data: allEvents, isLoading, error } = useEvents();

  if (isLoading) return <Spinner />;
  if (error) return <Error />;

  // Extract the results array from the paginated response
  const events = allEvents?.results || [];

  return <EventListSection events={events} />;
}
