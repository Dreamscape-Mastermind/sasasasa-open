import { CheckInContent } from "@/components/checkin/CheckInContent";
import { Metadata } from "next";
import Spinner from "@/components/ui/spinner";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Event Check-in | Dashboard",
  description: "Manage event check-ins and track attendance",
};

export default function CheckInPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <CheckInContent />
    </Suspense>
  );
}
