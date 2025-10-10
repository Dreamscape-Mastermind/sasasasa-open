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
    // Direct lookup is faster than filtered list query
    const response = await eventService.getEvent(shortUrl);

    // Since we're using direct lookup, we get the event directly
    const event = response.result;

    if (!event) {
      return {
        title: "Sasasasa Event",
      };
    }

    // Import site metadata for default image
    const siteMetadata = require("@/config/siteMetadata");
    const defaultImage = siteMetadata.socialBanner;

    // Build keywords from event metadata
    const keywords = [
      event.title,
      event.venue,
      event.category?.name,
      event.event_type?.name,
      event.format?.name,
      ...(event.tag_names || []),
    ].filter(Boolean);

    return {
      title:
        event.meta_title ||
        `Sasasasa | ${
          event.title.length > MAX_TITLE_LENGTH
            ? event.title.slice(0, MAX_TITLE_LENGTH) + "..."
            : event.title
        }`,
      description: event.meta_description || event.description,
      keywords: event.meta_keywords
        ? event.meta_keywords.split(",").map((k) => k.trim())
        : (keywords as string[]),
      openGraph: {
        title: event.meta_title || `${event.title} | Sasasasa`,
        description: event.meta_description || event.description,
        images: event.cover_image
          ? [{ url: event.cover_image }]
          : [{ url: defaultImage }],
        type: "website",
        siteName: "Sasasasa",
        url: event.canonical_url || event.share_url || undefined,
        // Add structured data for better SEO
        ...(event.start_date && {
          publishedTime: event.start_date,
        }),
        ...(event.venue && {
          locale: "en_US",
        }),
      },
      twitter: {
        card: "summary_large_image",
        title: event.meta_title || `${event.title} | Sasasasa`,
        description: event.meta_description || event.description,
        images: event.cover_image ? [event.cover_image] : [defaultImage],
        // Add event-specific metadata
        ...(event.category?.name && {
          label1: "Category",
          data1: event.category.name,
        }),
        ...(event.event_type?.name && {
          label2: "Type",
          data2: event.event_type.name,
        }),
        ...(event.format?.name && {
          label3: "Format",
          data3: event.format.name,
        }),
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
