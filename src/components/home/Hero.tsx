"use client";

import { Calendar, Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLogger } from "@/hooks/useLogger";
import CycleText from "../animata/text/cycle-text";

export function Hero() {
  const analytics = useAnalytics();
  const logger = useLogger({ context: "Hero" });

  const handleAction = (action: string) => {
    try {
      analytics.trackUserAction("hero_action", "action", action);
      logger.info("User clicked hero action", { action });
    } catch (error) {
      logger.error("Failed to handle hero action", error);
      analytics.trackError(error as Error, { action });
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 z-0" />
      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="text-center space-y-8 max-w-5xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight">
            The best platform for <CycleText />
          </h1>
          <p className="text-xl text-muted-foreground">
           Your brand, is a universal export. Lets build it together. From homegrown experiences to global e-commerce we're evolving the premier pipeline to scale the reach of creativity. You ready?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" onClick={() => handleAction("get_started")}>
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                Sign Up (creators beta)
                <Calendar className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/e" onClick={() => handleAction("browse")}>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 w-full sm:w-auto"
              >
                Discover Experiences
                <Ticket className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
