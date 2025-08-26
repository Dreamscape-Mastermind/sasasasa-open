import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "SASASASA",
  description: "SASASASA",
};

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className=" mx-0 px-0">{children}</div>
    </div>
  );
}
