"use client";

import { Suspense, use } from "react";

import { EditEventContent } from "@/components/dashboard/event/edit/EditEventContent";
import Spinner from "@/components/ui/spinner";

type Props = {
  params: Promise<{ id: string }>;
};

export default function EditEventPage({ params }: Props) {
  const { id } = use(params);
  return (
    <Suspense fallback={<Spinner />}>
      <EditEventContent eventId={id} />
    </Suspense>
  );
}
