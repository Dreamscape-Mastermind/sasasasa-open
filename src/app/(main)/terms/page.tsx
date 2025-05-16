import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";
import Spinner from "@/components/ui/spiner";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Terms of Service | SASASASA",
  description: "Terms of Service for SASASASA",
};

export default function TermsOfServicePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <PolicyPage contentPath="/content/terms-of-service.md" />
    </Suspense>
  );
}
