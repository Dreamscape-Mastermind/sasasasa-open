"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LayoutDashboard, LogOut, Settings, Crown } from "lucide-react";
import { getAvatarUrl, getRoleName } from "@/lib/utils";
import { memo } from "react";

import { Button } from "@/components/ui/button";
import Link from "@/components/Link";
import { ROUTES } from "@/lib/constants";
import type { UserRole } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

// Memoized beta crown component with tooltip
const BetaCrown = memo(() => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Crown className="h-2.5 w-2.5 text-amber-300 shimmer-crown cursor-help" />
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        Beta Program
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
));
BetaCrown.displayName = "BetaCrown";

export function ProfileDropdown() {
  const { user, roles, logout } = useAuth();

  if (!user) return null;

  const getInitials = () => {
    if (user?.first_name || user?.last_name) {
      return `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`;
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  const getDisplayName = () => {
    if (user?.first_name || user?.last_name) {
      return `${user.first_name || ""} ${user.last_name || ""}`.trim();
    }
    return user?.email?.split("@")[0] || "User";
  };

  const menuItems = [
    {
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
      label: "Dashboard",
      href: ROUTES.DASHBOARD,
    },
    {
      icon: <Settings className="mr-2 h-4 w-4" />,
      label: "Settings",
      href: ROUTES.DASHBOARD_SETTINGS,
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent"
        >
          <Avatar className="h-8 w-8">
            {user?.avatar ? (
              <AvatarImage src={user.avatar} alt={getDisplayName()} />
            ) : (
              <AvatarImage
                src={getAvatarUrl(getDisplayName())}
                alt={getDisplayName()}
              />
            )}
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {getDisplayName()}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
            {roles && roles.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs leading-none text-muted-foreground">
                <span>{getRoleName(roles[0].name as unknown as UserRole)}</span>
                {user?.beta && <BetaCrown />}
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {menuItems.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link
              href={item.href}
              className="flex w-full cursor-pointer items-center"
            >
              {item.icon}
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem
          onClick={logout}
          className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
