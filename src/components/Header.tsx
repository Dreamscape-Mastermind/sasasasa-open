"use client";

import { NAV_ITEMS, ROUTES } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import { DashboardIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import Link from "./Link";
import { LogIn } from "lucide-react";
import MobileNav from "./MobileNav";
import { NotificationPopover } from "./notifications/NotificationPopover";
import { ProfileDropdown } from "./profile/ProfileDropdown";
import ThemeSwitch from "./ThemeSwitch";
import siteMetadata from "@/config/siteMetadata";
import { useAuth } from "@/context/auth-context";
import { useSearchParams } from "next/navigation";
import { useSidebar } from "@/components/providers/SidebarContext";

const Header = () => {
  let headerClass =
    "flex items-center w-full bg-white dark:bg-gray-950 justify-between py-10";
  if (siteMetadata.stickyNav) {
    headerClass += " sticky top-0 z-50";
  }

  const { openSidebar } = useSidebar();
  const { isAuthenticated, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") || ROUTES.DASHBOARD;

  return (
    <>
      <header className={headerClass}>
        <Link href={ROUTES.HOME} aria-label={siteMetadata.headerTitle}>
          <div className="flex items-center">
            <Image
              src="/images/sasasasaLogo.png"
              alt={siteMetadata.headerTitle}
              width={30}
              height={30}
              className="h-auto w-auto mr-3"
            />
            {typeof siteMetadata.headerTitle === "string" ? (
              <div className="hidden text-xl font-semibold sm:block text-foreground">
                {siteMetadata.headerTitle}
              </div>
            ) : (
              siteMetadata.headerTitle
            )}
          </div>
        </Link>
        <div className="flex items-center space-x-3 sm:space-x-4 leading-5">
          <nav className="hidden sm:flex items-center space-x-4 md:space-x-6">
            {NAV_ITEMS.MAIN.filter((link) => link.href !== "/").map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {!isLoading && (
            <>
              {isAuthenticated ? (
                <>
                  <Link href={ROUTES.DASHBOARD}>
                    <Button className="flex items-center space-x-2">
                      <DashboardIcon className="h-5 w-5" />
                      <span>Go to Dashboard</span>
                    </Button>
                  </Link>
                  <NotificationPopover />
                  <ProfileDropdown />
                </>
              ) : (
                <Link
                  href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border-2 border-[#CC322D] px-6 py-2 text-lg font-medium text-[#CC322D] hover:bg-[#CC322D]/10"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Link>
              )}
            </>
          )}

          <ThemeSwitch />
          <MobileNav />
        </div>
      </header>
    </>
  );
};

export default Header;
