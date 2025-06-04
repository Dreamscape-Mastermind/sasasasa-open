import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex">
        <Sidebar />
        <div className="flex-1 w-full">
          <main className="p-6 min-h-screen overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
