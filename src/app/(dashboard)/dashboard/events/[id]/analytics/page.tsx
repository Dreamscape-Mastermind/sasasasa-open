"use client";

import { Suspense, use } from "react";

import { AnalyticsContent } from "@/components/dashboard/event/analytics/AnalyticsContent";
import Spinner from "@/components/ui/spinner";

type Props = {
  params: Promise<{ id: string }>;
};

export default function AnalyticsPage({ params }: Props) {
  const { id } = use(params);

  return (
    <Suspense fallback={<Spinner />}>
      <AnalyticsContent eventId={id} />
    </Suspense>
  );
}
