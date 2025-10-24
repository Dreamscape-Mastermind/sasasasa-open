"use client";

import { Calendar, Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";
import CycleText from "../animata/text/cycle-text";
import Link from "next/link";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLogger } from "@/hooks/useLogger";

export function Hero() {
  const analytics = useAnalytics();
  const logger = useLogger({ context: "Hero" });
  const words = [
    "Artists",
    "Musicians",
    "Writers",
    "Worldbuilders",
    "Curators",
    "Culture.",
  ];

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
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-24 relative z-10">
        <div className="text-center space-y-8 max-w-5xl mx-auto">
          <h1 className="text-center sm:max-w-none md:text-6xl text-4xl font-bold tracking-tight leading-tight">
            <span className="inline-flex items-baseline justify-center gap-2 flex-wrap w-full">
              <span className="hidden md:inline">The Best Platform For</span>
              <div className="md:hidden font-extrabold text-6xl w-full">For</div>
              <span className=" align-baseline text-center whitespace-nowrap md:min-w-[16ch]">
                <CycleText words={words} />
              </span>
            </span>
          </h1>
          <p className="text-center justify-evenly mx-auto max-w-[90%] sm:max-w-3xl text-base sm:text-xl text-muted-foreground">
            Your brand, is universal. Lets build it together. From homegrown
            experiences to global e-commerce we're evolving the premier pipeline
            to scale the reach of creativity. Karibu.
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
