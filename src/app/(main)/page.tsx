import HomeContent from "@/components/home/HomeContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sasasasa - Commerce for your community on demand",
  description:
    "Discover, create, and manage experiences and custom products with $0 investment. From intimate circles to global audiences.",
  openGraph: {
    title: "Sasasasa - Commerce for your community on demand",
    description:
      "Discover, create, and manage experiences and custom products with $0 investment. From intimate circles to global audiences.",
    type: "website",
    locale: "en_US",
    siteName: "Sasasasa",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sasasasa - Commerce for your community on demand",
    description:
      "Discover, create, and manage experiences and custom products with $0 investment. From intimate circles to global audiences.",
  },
};

export default function Home() {
  return <HomeContent />;
}
