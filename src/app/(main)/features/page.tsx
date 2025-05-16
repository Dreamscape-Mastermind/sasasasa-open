import FeaturesContent from "@/components/features/FeaturesContent";
import Spinner from "@/components/ui/spiner";
import { Suspense } from "react";

export default function FeaturesPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <FeaturesContent />
    </Suspense>
  );
}
