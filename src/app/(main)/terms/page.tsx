import PolicyPage from "@/components/PolicyPage";
import Spinner from "@/components/ui/spinner";
import { Suspense } from "react";

export default function TermsOfServicePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <PolicyPage contentPath="/content/terms-of-service.md" />
    </Suspense>
  );
}
