import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { EventProvider } from "@/contexts/event-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EventProvider>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex">
          <Sidebar />
          <div className="flex-1 w-full">
            <main className="p-6 min-h-screen overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </div>
    </EventProvider>
  );
}
