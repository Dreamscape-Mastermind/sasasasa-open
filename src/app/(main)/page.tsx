import type { Metadata } from "next";
import Spinner from "@/components/ui/spiner";
import { Suspense } from "react";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "SASASASA",
  description: "SASASASA",
};

const FeaturedEvents = dynamic(
  () => import("@/components/home/FeaturedEvents"),
  {
    loading: () => <Spinner />,
  }
);

const AllEvents = dynamic(() => import("@/components/home/AllEvents"), {
  loading: () => <Spinner />,
});

export default async function Home() {
  return (
    <>
      {/* Features Section */}
      <Suspense fallback={<Spinner />}>
        <FeaturedEvents />
      </Suspense>

      {/* Promoted Events */}
      <Suspense fallback={<Spinner />}>
        <AllEvents />
      </Suspense>
    </>
  );
}
