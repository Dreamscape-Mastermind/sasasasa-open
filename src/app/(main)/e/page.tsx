import { EventsContent } from "@/components/events/EventsContent";
import { Metadata } from "next";
import Spinner from "@/components/ui/spinner";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Experiences | Sasasasa",
  description:
    "Discover and explore upcoming experiences. Browse through our curated collection of experiences, events, concerts, and performances.",
  keywords: [
    "experiences",
    "concerts",
    "performances",
    "live experiences",
    "tickets",
    "entertainment",
  ],
  openGraph: {
    title: "Experiences | Sasasasa",
    description:
      "Discover and explore upcoming experiences. Browse through our curated collection of experiences, events, concerts, and performances.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Experiences | Sasasasa",
    description:
      "Discover and explore upcoming experiences. Browse through our curated collection of experiences, events, concerts, and performances.",
  },
};

export default function EventsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <EventsContent />
    </Suspense>
  );
}
