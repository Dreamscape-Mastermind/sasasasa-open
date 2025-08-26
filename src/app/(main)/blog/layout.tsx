import { Metadata } from "next";
import SectionContainer from "@/components/SectionContainer";

export const metadata: Metadata = {
  title: "Blog | SASASASA",
  description:
    "Read our latest blog posts about events, entertainment, and more.",
  openGraph: {
    title: "Blog | SASASASA",
    description:
      "Read our latest blog posts about events, entertainment, and more.",
    type: "website",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SectionContainer>{children}</SectionContainer>;
}
