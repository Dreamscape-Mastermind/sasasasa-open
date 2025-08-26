"use client";

import { AttendeesContent } from "@/components/dashboard/event/attendees/AttendeesContent";
import Spinner from "@/components/ui/spinner";
import { Suspense, use } from "react";

type Props = {
  params: Promise<{ id: string }>;
};

export default function AttendeesPage({ params }: Props) {
  const { id } = use(params);
  return (
    <Suspense fallback={<Spinner />}>
      <AttendeesContent eventId={id} />
    </Suspense>
  );
}
