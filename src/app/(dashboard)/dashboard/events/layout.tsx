import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants";
import { PlusCircle, Search } from "lucide-react";
import Link from "next/link";

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
        <div className="flex-1 w-full">
        <div className="space-y-8 animate-in">
        {/* Event Selector */}
          <div className="flex justify-between items-center">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search events, attendees, or tickets..."
                className="pl-10"
              />
            </div>
            <Link href={ROUTES.DASHBOARD_EVENT_CREATE()}>
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Create Event
              </Button>
            </Link>
          </div>
          <main className="p-6 min-h-screen overflow-y-auto">{children}</main>
        </div>
        </div>
    </div>
  );
}
