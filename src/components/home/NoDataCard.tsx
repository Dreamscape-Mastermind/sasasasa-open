"use client";

import { AlertCircle, Calendar, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface NoDataCardProps {
  type: "featured" | "recent" | "carousel";
  onRetry?: () => void;
  isError?: boolean;
}

export function NoDataCard({
  type,
  onRetry,
  isError = false,
}: NoDataCardProps) {
  const getContent = () => {
    if (isError) {
      return {
        icon: AlertCircle,
        title: "Failed to Load Events",
        description: "We couldn't load the events right now. Please try again.",
        buttonText: "Try Again",
        buttonAction: onRetry,
      };
    }

    switch (type) {
      case "featured":
        return {
          icon: Calendar,
          title: "No Featured Events",
          description: "Check back later for featured experiences.",
          buttonText: "View All Events",
          buttonAction: () => (window.location.href = "/e"),
        };
      case "recent":
        return {
          icon: Calendar,
          title: "No Recent Events",
          description: "No recent events available at the moment.",
          buttonText: "View All Events",
          buttonAction: () => (window.location.href = "/e"),
        };
      case "carousel":
        return {
          icon: Calendar,
          title: "No Featured Events",
          description: "No featured events to display in the carousel.",
          buttonText: "View All Events",
          buttonAction: () => (window.location.href = "/e"),
        };
      default:
        return {
          icon: Calendar,
          title: "No Events",
          description: "No events available at the moment.",
          buttonText: "View All Events",
          buttonAction: () => (window.location.href = "/e"),
        };
    }
  };

  const content = getContent();
  const IconComponent = content.icon;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[300px]">
      <div className="mb-4">
        <IconComponent className="h-12 w-12 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {content.title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
        {content.description}
      </p>
      {content.buttonAction && (
        <Button
          onClick={content.buttonAction}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isError && <RefreshCw className="h-4 w-4" />}
          {content.buttonText}
        </Button>
      )}
    </div>
  );
}
