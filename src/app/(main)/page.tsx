import Spinner from "@/components/ui/spiner";
import dynamic from "next/dynamic";

// Lazy load below-the-fold components
// const Hero = dynamic(() => import("@/components/Hero"), {
//   loading: () => <Spinner />,
// });

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
    <div>
      {/* Features Section */}
      <FeaturedEvents />

      {/* Promoted Events */}
      <AllEvents />

      {/* <Hero /> */}
    </div>
  );
}
