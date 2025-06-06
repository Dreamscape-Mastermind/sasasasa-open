import { EventsContent } from "@/components/events/EventsContent";
import { Metadata } from "next";
import Spinner from "@/components/ui/spinner";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Events | Dreamscape",
  description:
    "Discover and explore upcoming events. Browse through our curated collection of events, concerts, and performances.",
  keywords: [
    "events",
    "concerts",
    "performances",
    "live events",
    "tickets",
    "entertainment",
  ],
  openGraph: {
    title: "Events | Dreamscape",
    description:
      "Discover and explore upcoming events. Browse through our curated collection of events, concerts, and performances.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Events | Dreamscape",
    description:
      "Discover and explore upcoming events. Browse through our curated collection of events, concerts, and performances.",
  },
};

export default function EventsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <EventsContent />
    </Suspense>
  );
}
