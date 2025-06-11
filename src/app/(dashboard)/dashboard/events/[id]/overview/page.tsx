"use client";

import { Suspense, use } from "react";

import { OverviewContent } from "@/components/dashboard/event/overview/OverviewContent";
import Spinner from "@/components/ui/spinner";

type Props = {
  params: Promise<{ id: string }>;
};

export default function OverviewPage({ params }: Props) {
  const { id } = use(params);
  return (
    <Suspense fallback={<Spinner />}>
      <OverviewContent eventId={id} />
    </Suspense>
  );
}
