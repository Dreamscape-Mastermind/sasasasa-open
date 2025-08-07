"use client";

import { Suspense, use } from "react";

import { PaymentsContent } from "@/components/dashboard/event/payments/PaymentsContent";
import Spinner from "@/components/ui/spinner";

type Props = {
  params: Promise<{ id: string }>;
};

export default function PaymentsPage({ params }: Props) {
  const { id } = use(params);
  return (
    <Suspense fallback={<Spinner />}>
      <PaymentsContent eventId={id} />
    </Suspense>
  );
}
