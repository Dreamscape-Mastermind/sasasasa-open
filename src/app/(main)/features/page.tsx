import FeaturesContent from "@/components/features/FeaturesContent";
import { Metadata } from "next";
import Spinner from "@/components/ui/spinner";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Features | Sasasasa",
  description: "Features of Sasasasa",
  openGraph: {
    title: "Features | Sasasasa",
    description: "Features of Sasasasa",
    type: "website",
  },
};

export default function FeaturesPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <FeaturesContent />
    </Suspense>
  );
}
