"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLogger } from "@/hooks/useLogger";

export function CTASection() {
  const analytics = useAnalytics();
  const logger = useLogger({ context: "CTASection" });

  const handleClick = () => {
    try {
      analytics.trackUserAction("cta_click", "action", "start_creating");
      logger.info("User clicked CTA button");
    } catch (error) {
      logger.error("Failed to handle CTA click", error);
      analytics.trackError(error as Error);
    }
  };

  return (
    <div className="bg-primary/5 py-24">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready To Grow Your Brand?</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join our growing community of creatives who trust Sasasasa to create to grow their community and revenue.
        </p>
        <Link href="/dashboard" onClick={handleClick}>
          <Button size="lg" className="gap-2">
            Start Creating
            <Calendar className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
