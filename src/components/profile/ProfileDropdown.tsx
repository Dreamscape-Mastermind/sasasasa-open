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
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import Link from "@/components/Link";
import { LogIn } from "lucide-react";
import toast from "react-hot-toast";
import { trackEvent } from "@/lib/analytics";
import { useAuth } from "@/components/providers/auth-provider";
import { useLogger } from "@/lib/hooks/useLogger";
import { useLogout } from "@/lib/hooks/useAuth";

export function ProfileDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const logger = useLogger({ context: "ProfileDropdown" });
  const { mutate: logout } = useLogout();
  const { isAuthenticated, isLoading, user } = useAuth();
  const redirectTo = searchParams?.get("redirect") || "/dashboard";

  const handleSignOut = () => {
    logger.info("User signing out");
    trackEvent({
      event: "user_sign_out",
      user_email: user?.email,
    });
    logout();
    handleLogin();
    toast.success("Successfully logged out");
  };

  const handleLogin = () => {
    router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
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

  if (isLoading) {
    return (
      <Button
        variant="ghost"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full"
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback>...</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  if (!isAuthenticated && !isLoading && !user) {
    return (
      <Button
        variant="outline"
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border-[#CC322D] px-4 py-2 text-sm font-medium text-[#CC322D] hover:bg-[#CC322D]/10"
        onClick={handleLogin}
      >
        <LogIn className="h-4 w-4" />
        <span>Login</span>
      </Button>
    );
  }

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
            ) : null}
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
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/dashboard/settings" className="w-full">
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/dashboard/settings" className="w-full">
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>
          <Link href="/" className="w-full">
            Sign out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
