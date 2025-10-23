"use client";

import { Music } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AudioWaveform } from "@/components/ui/audio-waveform";
import { cn } from "@/lib/utils";

interface AudioIndicatorProps {
  audioUrl: string;
  variant?: "badge" | "waveform" | "both";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AudioIndicator({
  audioUrl,
  variant = "both",
  size = "md",
  className,
}: AudioIndicatorProps) {
  const sizeConfig = {
    sm: {
      waveform: { width: 80, height: 20, barCount: 15 },
      badge: "text-xs px-2 py-1",
      icon: "h-3 w-3",
    },
    md: {
      waveform: { width: 120, height: 32, barCount: 20 },
      badge: "text-sm px-3 py-1.5",
      icon: "h-4 w-4",
    },
    lg: {
      waveform: { width: 160, height: 40, barCount: 25 },
      badge: "text-base px-4 py-2",
      icon: "h-5 w-5",
    },
  };

  const config = sizeConfig[size];

  if (variant === "badge") {
    return (
      <Badge 
        variant="secondary" 
        className={cn("flex items-center gap-1.5", config.badge, className)}
      >
        <Music className={config.icon} />
        <span>Audio</span>
      </Badge>
    );
  }

  if (variant === "waveform") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <AudioWaveform
          audioUrl={audioUrl}
          width={config.waveform.width}
          height={config.waveform.height}
          barCount={config.waveform.barCount}
          color="hsl(var(--primary))"
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge 
        variant="secondary" 
        className={cn("flex items-center gap-1.5", config.badge)}
      >
        <Music className={config.icon} />
        <span>Audio</span>
      </Badge>
      <AudioWaveform
        audioUrl={audioUrl}
        width={config.waveform.width}
        height={config.waveform.height}
        barCount={config.waveform.barCount}
        color="hsl(var(--muted-foreground))"
      />
    </div>
  );
}
