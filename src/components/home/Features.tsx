"use client";

import { Calendar, HandCoins, Ticket } from "lucide-react";

import { useAnalytics } from "@/hooks/useAnalytics";
import { useLogger } from "@/hooks/useLogger";

const features = [
  {
    icon: Calendar,
    title: "Get Started Quick and Easy",
    description:
      "Create and customize your experiences in minutes. All you need is an email.",
  },
  {
    icon: Ticket,
    title: "Smart Experience Management",
    description:
      "Flexible ticketing options with QR codes, multiple tiers, and analytics.",
  },
  {
    icon: HandCoins,
    title: "Secure Payments, Low Fees",
    description:
      "Process payments securely with mobile money and card payments. More options coming soon. Low fees always.",
  },
];

export function Features() {
  const analytics = useAnalytics();
  const logger = useLogger({ context: "Features" });

  const handleFeatureClick = (title: string) => {
    try {
      analytics.trackUserAction("view_feature", "feature", title);
      logger.info("User viewed feature details", { featureTitle: title });
    } catch (error) {
      logger.error("Failed to handle feature click", error);
      analytics.trackError(error as Error, { featureTitle: title });
    }
  };

  return (
    <div className="container mx-auto px-4 py-24 bg-muted/50">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl font-bold mb-4">Why Choose Sasasasa?</h2>
        <p className="text-muted-foreground">
          Our goal is simple, give you the tools to get your brand to you global
          audience. Everything you need to create and manage and grow your
          experiences and brand via universal commerce.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="space-y-4 text-center cursor-pointer"
            onClick={() => handleFeatureClick(feature.title)}
          >
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
              <feature.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
