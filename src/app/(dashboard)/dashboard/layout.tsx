import type { Metadata } from "next";
import { Sidebar } from "@/components/dashboard/sidebar";

export const metadata: Metadata = {
  title: "Dashboard | Sasasasa",
  description: "Dashboard for Sasasasa",
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Dashboard | Sasasasa",
    description: "Dashboard for Sasasasa",
    type: "website",
  },
  keywords: ["dashboard", "sasasasa", "events", "tickets"],
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen">
      <div className="flex h-full">
        <div className="hidden md:flex w-72 flex-col">
          <Sidebar />
        </div>
        <div className="flex-1">
          <main className="h-full overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
