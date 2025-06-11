"use client";

import { Suspense, use } from "react";

import { EventDetailsContent } from "@/components/dashboard/event/details/EventDetailsContent";
import Spinner from "@/components/ui/spinner";

type Props = {
  params: Promise<{ id: string }>;
};

export default function EventDetailsPage({ params }: Props) {
  const { id } = use(params);
  return (
    <Suspense fallback={<Spinner />}>
      <EventDetailsContent eventId={id} />
    </Suspense>
  );
}
