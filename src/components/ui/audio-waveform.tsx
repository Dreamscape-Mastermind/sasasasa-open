"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AudioWaveformProps {
  audioUrl: string;
  width?: number;
  height?: number;
  barCount?: number;
  className?: string;
  color?: string;
}

export function AudioWaveform({
  audioUrl,
  width = 120,
  height = 32,
  barCount = 20,
  className,
  color = "currentColor",
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateWaveform = async () => {
      try {
        setIsLoading(true);
        
        // For demo purposes, generate a mock waveform
        // In production, you'd analyze the actual audio file
        const mockData = Array.from({ length: barCount }, () => 
          Math.random() * 0.8 + 0.2
        );
        
        setWaveformData(mockData);
      } catch (error) {
        console.error("Error generating waveform:", error);
        // Fallback to a simple pattern
        const fallbackData = Array.from({ length: barCount }, (_, i) => 
          Math.sin(i * 0.5) * 0.3 + 0.5
        );
        setWaveformData(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };

    if (audioUrl) {
      generateWaveform();
    }
  }, [audioUrl, barCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate bar dimensions
    const barWidth = width / barCount;
    const maxBarHeight = height * 0.8;

    // Draw waveform bars
    waveformData.forEach((amplitude, index) => {
      const barHeight = amplitude * maxBarHeight;
      const x = index * barWidth;
      const y = (height - barHeight) / 2;

      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth * 0.8, barHeight);
    });
  }, [waveformData, width, height, barCount, color]);

  if (isLoading) {
    return (
      <div 
        className={cn("animate-pulse bg-muted rounded", className)}
        style={{ width, height }}
        aria-label="Loading audio waveform"
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={cn("rounded", className)}
      style={{ width, height }}
      aria-label="Audio waveform visualization"
      role="img"
    />
  );
}
