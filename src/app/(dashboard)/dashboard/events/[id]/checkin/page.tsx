"use client";

import { CheckInContent } from "@/components/checkin/CheckInContent";
import Spinner from "@/components/ui/spinner";
import { Suspense, use } from "react";

type Props = {
  params: Promise<{ id: string }>;
};

export default function CheckInPage({ params }: Props) {
  const { id } = use(params);
  return (
    <Suspense fallback={<Spinner />}>
      <CheckInContent eventId={id} />
    </Suspense>
  );
}
