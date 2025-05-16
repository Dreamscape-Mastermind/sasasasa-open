import AboutContent from "@/components/about/AboutContent";
import type { Metadata } from "next";
import Spinner from "@/components/ui/spiner";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "About | SASASASA",
  description: "Learn more about SASASASA",
};

export default function AboutPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <AboutContent />
    </Suspense>
  );
}
