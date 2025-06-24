"use client";

import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { useScrollVisibility } from "@/hooks/useScrollVisibility";
import { useEffect, useCallback } from "react";
import ShortcutButton from "@/components/ui/shortcut-button";
import { 
  Calendar, 
  Settings, 
  ShoppingBag, 
  Ticket, 
  PenTool,
  Home,
  User,
  Zap
} from "lucide-react";

export default function GlobalShortcutWrapper() {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const { isVisible, isScrollingDown } = useScrollVisibility({ threshold: 50 });
  
  // Memoize static style object to prevent re-renders
  const pointerEventsStyle = { pointerEvents: 'auto' as const };

  // Smart navigation shortcuts - contextual based on current page - memoize to prevent re-renders
  const getShortcutActions = useCallback(() => {
    const isDashboard = pathname?.startsWith('/dashboard');
    
    if (isDashboard) {
      return [
        {
          icon: <Home size={18} />,
          label: "Dashboard Home",
          key: "dashboard-home",
          action: () => window.location.href = "/dashboard"
        },
        {
          icon: <Calendar size={18} />,
          label: "My Experiences",
          key: "events", 
          action: () => window.location.href = "/dashboard/events"
        },
        {
          icon: <Ticket size={18} />,
          label: "My Tickets",
          key: "tickets", 
          action: () => window.location.href = "/dashboard/tickets"
        },
        {
          icon: <Settings size={18} />,
          label: "Settings",
          key: "settings",
          action: () => window.location.href = "/dashboard/settings"
        }
      ];
    }

    // Main site shortcuts
    return [
      {
        icon: <Home size={18} />,
        label: "Home",
        key: "home",
        action: () => window.location.href = "/"
      },
      {
        icon: <Calendar size={18} />,
        label: "Experiences",
        key: "events", 
        action: () => window.location.href = "/events"
      },
      {
        icon: <User size={18} />,
        label: "Dashboard",
        key: "dashboard",
        action: () => window.location.href = "/dashboard"
      },
      {
        icon: <Settings size={18} />,
        label: "Settings",
        key: "settings",
        action: () => window.location.href = "/dashboard/settings"
      }
    ];
  }, [pathname]);

  // Only render if authenticated and not loading
  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-4 right-4 z-30 sm:hidden transition-transform duration-300 ease-in-out ${
        !isVisible ? 'translate-y-full' : 'translate-y-0'
      }`}
      style={pointerEventsStyle}
    >
      <ShortcutButton 
        direction="up" 
        actionButtons={getShortcutActions()}
        mainIcon={<Zap size={24} />}
        mainLabel="Quick Nav"
        position="bottom-right"
        forceClose={isScrollingDown}
      />
    </div>
  );
} 