import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="">
      <div className="flex h-full">
        <div className="hidden md:flex w-72 flex-col">
          <Sidebar />
        </div>
        <div className="flex-1">
          {/* <main className="h-[calc(100vh-4rem)] overflow-y-auto p-6"> */}
          <main className="h-full overflow-y-auto p-6">{children}</main>
          {/* </main> */}
        </div>
      </div>
    </div>
  );
}
