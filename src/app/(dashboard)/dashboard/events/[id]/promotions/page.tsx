"use client";

import { Suspense, use } from "react";

import { PromotionsContent } from "@/components/dashboard/event/promotions/PromotionsContent";
import Spinner from "@/components/ui/spinner";

type Props = {
  params: Promise<{ id: string }>;
};

export default function PromotionsPage({ params }: Props) {
  const { id } = use(params);
  return (
    <Suspense fallback={<Spinner />}>
      <PromotionsContent eventId={id} />
    </Suspense>
  );
}
