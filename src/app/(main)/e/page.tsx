import EventsContent from "@/components/events/EventsContent";
import type { Metadata } from "next";
import Spinner from "@/components/ui/spiner";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Events | SASASASA",
  description: "Discover and explore upcoming events in your area.",
};

export default function EventsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <EventsContent />
    </Suspense>
  );
}
