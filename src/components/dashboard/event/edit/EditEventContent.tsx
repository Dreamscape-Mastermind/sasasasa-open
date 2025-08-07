"use client";

import CreateEvent from "@/app/(dashboard)/dashboard/events/create/page";

type Props = {
  params: Promise<{ id: string }>;
};

export function EditEventContent({ params }: Props) {
  return <CreateEvent params={params} />;
}
