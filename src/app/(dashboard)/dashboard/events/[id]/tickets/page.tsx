"use client";

import { Suspense, use } from "react";

import Spinner from "@/components/ui/spinner";
import { TicketsContent } from "@/components/dashboard/event/tickets/TicketsContent";

type Props = {
  params: Promise<{ id: string }>;
};

export default function TicketsPage({ params }: Props) {
  const { id } = use(params);
  return (
    <Suspense fallback={<Spinner />}>
      <TicketsContent eventId={id} />
    </Suspense>
  );
}
