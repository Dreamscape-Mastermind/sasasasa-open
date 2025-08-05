"use client";

import { EditEventContent } from "@/components/dashboard/event/edit/EditEventContent";
import Spinner from "@/components/ui/spinner";
import { Suspense } from "react";

type Props = {
  params: Promise<{ id: string }>;
};

export default function EditEventPage({ params }: Props) {
  return (
    <Suspense fallback={<Spinner />}>
      <EditEventContent params={params} />
    </Suspense>
  );
}
