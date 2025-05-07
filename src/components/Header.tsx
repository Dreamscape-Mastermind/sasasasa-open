"use client";

import { Button } from "@/components/ui/button";
import { DashboardIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import Link from "./Link";
import MobileNav from "./MobileNav";
import { NotificationPopover } from "./notifications/NotificationPopover";
import { ProfileDropdown } from "./profile/ProfileDropdown";
import ThemeSwitch from "./ThemeSwitch";
import headerNavLinks from "@/lib/headerNavLinks";
import siteMetadata from "@/config/siteMetadata";
import { useAuth } from "@/components/providers/auth-provider";
import { useLogger } from "@/lib/hooks/useLogger";
import { useSidebar } from "@/components/providers/SidebarContext";

const Header = () => {
  let headerClass =
    "flex items-center w-full bg-white dark:bg-gray-950 justify-between py-10";
  if (siteMetadata.stickyNav) {
    headerClass += " sticky top-0 z-50";
  }

  const { openSidebar } = useSidebar();
  const { user, isAuthenticated, isLoading } = useAuth();
  const logger = useLogger({ context: "Header" });

  const handleDashboardClick = () => {
    logger.info("Dashboard link clicked", { userId: user?.id });
  };

  return (
    <>
      <header className={headerClass}>
        <Link href="/" aria-label={siteMetadata.headerTitle}>
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
            {headerNavLinks
              .filter((link) => link.href !== "/")
              .map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="font-medium text-foreground hover:text-primary transition-colors"
                >
                  {link.title}
                </Link>
              ))}
          </nav>

          {!isLoading && isAuthenticated && (
            <>
              <Link href="/dashboard" onClick={handleDashboardClick}>
                <Button className="flex items-center space-x-2">
                  <DashboardIcon className="h-5 w-5" />
                  <span>Go to Dashboard</span>
                </Button>
              </Link>
              <NotificationPopover />
            </>
          )}

          <ProfileDropdown />
          <ThemeSwitch />
          <MobileNav />
        </div>
      </header>
    </>
  );
};

export default Header;
