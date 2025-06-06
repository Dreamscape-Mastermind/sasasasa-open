import { Metadata, ResolvingMetadata } from "next";

import EventDetails from "@/components/events/EventDetails";
import Spinner from "@/components/ui/spinner";
import { Suspense } from "react";
import { eventService } from "@/services/event.service";

// Update the type definitions
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Fix generateMetadata type
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const MAX_TITLE_LENGTH = 50;
  try {
    const shortUrl = (await params).slug;
    const response = await eventService.getEvent(shortUrl);

    // Since we're filtering by short_url, we should get only the matching event
    const event = response.result;

    if (!event) {
      return {
        title: "Sasasasa Event",
      };
    }

    // Import site metadata for default image
    const siteMetadata = require("@/config/siteMetadata");
    const defaultImage = siteMetadata.socialBanner;

    return {
      title: `Sasasasa | ${
        event.title.length > MAX_TITLE_LENGTH
          ? event.title.slice(0, MAX_TITLE_LENGTH) + "..."
          : event.title
      }`,
      description: event.description,
      openGraph: {
        title: `${event.title} | Sasasasa`,
        description: event.description,
        images: event.cover_image
          ? [{ url: event.cover_image }]
          : [{ url: defaultImage }],
        type: "website",
        siteName: "Sasasasa",
      },
      twitter: {
        card: "summary_large_image",
        title: `${event.title} | Sasasasa`,
        description: event.description,
        images: event.cover_image ? [event.cover_image] : [defaultImage],
      },
    };
  } catch (error) {
    return {
      title: "Event | Sasasasa",
    };
  }
}

export default async function EventPage({ params }: Props) {
  const slug = (await params).slug;

  return (
    <Suspense fallback={<Spinner />}>
      <EventDetails slug={slug} />
    </Suspense>
  );
}
