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
import { getAvatarUrl, getRoleName } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import Link from "@/components/Link";
import { ROUTES } from "@/lib/constants";
import type { UserRole } from "@/types";
import { useAuth } from "@/context/auth-context";

export function ProfileDropdown() {
  const { user, roles, logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
  };

  // Get initials from first and last name, fallback to email first letter
  const getInitials = () => {
    if (user?.first_name || user?.last_name) {
      return `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`;
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  // Get display name
  const getDisplayName = () => {
    if (user?.first_name || user?.last_name) {
      return `${user.first_name || ""} ${user.last_name || ""}`.trim();
    }
    return user?.email?.split("@")[0] || "User";
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full"
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
            {roles.length > 0 && (
              <p className="text-xs leading-none text-muted-foreground">
                {getRoleName(roles[0] as unknown as UserRole)}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href={ROUTES.DASHBOARD} className="w-full">
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href={ROUTES.DASHBOARD_SETTINGS} className="w-full">
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>
          <Link href={ROUTES.HOME} className="w-full">
            Sign out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
