"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navigation, ChevronUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpeedialProps {
  direction: string;
  actionButtons: Array<{
    icon: React.ReactNode;
    label: string;
    key: string;
    action: () => void;
  }>;
  mainIcon?: React.ReactNode;
  mainLabel?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  forceClose?: boolean;
}



const ActionPill: React.FC<{ text: string; children: React.ReactNode; onClick: () => void; position: string }> = ({ text, children, onClick, position }) => {
  // For bottom-right position, label should be on LEFT of icon (where there's screen real estate)
  const isRightSide = position === 'bottom-right' || position === 'top-right';
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-[4rem] bg-card hover:bg-accent text-card-foreground shadow-sm border",
        "px-4 py-3 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]",
        "hover:shadow-md active:shadow-sm font-medium text-sm"
      )}
    >
      {/* For right-side positioning: [Label] [Icon] */}
      {isRightSide ? (
        <>
          <span className="text-sm font-medium whitespace-nowrap">
            {text}
          </span>
          <div className="flex-shrink-0 w-5 h-5">
            {children}
          </div>
        </>
      ) : (
        /* For left-side positioning: [Icon] [Label] */
        <>
          <div className="flex-shrink-0 w-5 h-5">
            {children}
          </div>
          <span className="text-sm font-medium whitespace-nowrap">
            {text}
          </span>
        </>
      )}
    </button>
  );
};

export default function ShortcutButton({ 
  direction, 
  actionButtons, 
  mainIcon = <Zap size={24} />,
  mainLabel = "Quick Navigation",
  position = "bottom-right",
  forceClose = false
}: SpeedialProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showMainTooltip, setShowMainTooltip] = useState(false);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Memoize static style object to prevent re-renders
  const pointerEventsStyle = { pointerEvents: 'auto' as const };

  // Close menu when scrolling DOWN - don't interfere with hover state
  useEffect(() => {
    if (forceClose) {
              // Force close menu visually while preserving hover state
      setShowMainTooltip(false);
      // Don't touch isHovered - let mouse events work naturally
    }
  }, [forceClose]);

  // Cleanup timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, []);

  const getAnimation = () => {
    switch (direction) {
      case "up":
        // For bottom-right: animations should originate from bottom-right where Quick Nav is
        // For bottom-left: animations should originate from bottom-left where Quick Nav is
        if (position === 'bottom-right' || position === 'top-right') {
          return "origin-bottom-right flex-col-reverse";
        } else {
          return "origin-bottom-left flex-col-reverse";
        }
      case "down":
        if (position === 'top-right' || position === 'bottom-right') {
          return "origin-top-right flex-col";
        } else {
          return "origin-top-left flex-col";
        }
      case "left":
        if (position === 'top-left' || position === 'bottom-left') {
          return "origin-left flex-row-reverse";
        } else {
          return "origin-right flex-row-reverse";
        }
      case "right":
        if (position === 'top-right' || position === 'bottom-right') {
          return "origin-right flex-row";
        } else {
          return "origin-left flex-row";
        }
      default:
        return "";
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const getButtonClasses = () => {
    return cn(
      "bg-card hover:bg-accent text-card-foreground border shadow-sm rounded-[4rem]",
      "inline-flex items-center justify-center gap-2 whitespace-nowrap text-base font-semibold",
      "ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      "hover:shadow-md active:shadow-sm transform hover:scale-[1.05] active:scale-[0.95]",
      "[&_svg]:pointer-events-none [&_svg]:size-6 [&_svg]:shrink-0"
    );
  };

  //customize your action buttons here

  return (
    <div
      onMouseLeave={handleMouseLeave}
      className={`relative flex w-fit items-end gap-4 ${
        direction === "up" || direction === "down" ? "flex-col-reverse" : "flex-row"
      }`}
    >
      {/* Main Navigation Button with Smart Tooltip */}
              <div className="relative">
        <button
          onMouseEnter={() => {
            handleMouseEnter();
            setShowMainTooltip(true);
          }}
          onMouseLeave={() => {
            setShowMainTooltip(false);
          }}
          onTouchStart={() => {
            setShowMainTooltip(true);
          }}
          onTouchEnd={() => {
            // Clear any existing timeout to prevent memory leaks
            if (touchTimeoutRef.current) {
              clearTimeout(touchTimeoutRef.current);
            }
            touchTimeoutRef.current = setTimeout(() => setShowMainTooltip(false), 1500);
          }}
          className={cn(getButtonClasses(), "p-4")}
          aria-label={mainLabel}
          style={pointerEventsStyle}
        >
          {mainIcon}
        </button>
        
        {/* Smart tooltip positioned based on screen real estate */}
        {showMainTooltip && (
          <div 
            className={cn(
              "absolute z-20 rounded-[4rem] bg-popover border px-3 py-2 text-sm font-medium text-popover-foreground whitespace-nowrap shadow-md",
              // For bottom-right position, tooltip appears to the left (where there's room)
              position === 'bottom-right' || position === 'top-right'
                ? "right-full top-1/2 mr-3 -translate-y-1/2"
                : "left-full top-1/2 ml-3 -translate-y-1/2"
            )}
          >
            {mainLabel}
            {/* Arrow pointer */}
            <div 
              className={cn(
                "absolute w-2 h-2 bg-popover border-l border-t rotate-45",
                position === 'bottom-right' || position === 'top-right'
                  ? "-right-1 top-1/2 -translate-y-1/2 border-r-0 border-b-0"
                  : "-left-1 top-1/2 -translate-y-1/2 border-r-0 border-b-0"
              )}
            />
          </div>
        )}
      </div>

      {/* Speed Dial Actions */}
      <div
        className={`${
          isHovered && !forceClose ? "scale-100 opacity-100" : "scale-0 opacity-0"
        } flex items-end gap-4 transition-all duration-500 ease-in-out relative z-40 ${getAnimation()}`}
      >
        {actionButtons.map((action, index) => (
          <ActionPill
            key={index}
            text={action.label}
            onClick={action.action}
            position={position}
          >
            {action.icon}
          </ActionPill>
        ))}
      </div>
    </div>
  );
}
