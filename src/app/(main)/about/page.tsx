import AboutContent from "@/components/about/AboutContent";
import { Metadata } from "next";
import Spinner from "@/components/ui/spinner";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "About Us | Sasasasa",
  description:
    "Learn about Sasasasa - innovating digital commerce across the Global South, starting with Sub-Saharan Africa. We're building the future of entertainment commerce.",
  openGraph: {
    title: "About Us | Sasasasa",
    description:
      "Learn about Sasasasa - innovating digital commerce across the Global South, starting with Sub-Saharan Africa. We're building the future of entertainment commerce.",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <AboutContent />
    </Suspense>
  );
}
