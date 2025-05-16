import PolicyPage from "@/components/PolicyPage";
import Spinner from "@/components/ui/spiner";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Privacy Policy | SASASASA",
  description: "Privacy Policy for SASASASA",
};

export default function PrivacyPolicyPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <PolicyPage contentPath="/content/privacy-policy.md" />
    </Suspense>
  );
}
