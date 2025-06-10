"use client";

import { NAV_ITEMS, ROUTES } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import { DashboardIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import Link from "./Link";
import { LogIn } from "lucide-react";
import MobileNav from "@/components/MobileNav";
import { NotificationPopover } from "./notifications/NotificationPopover";
import { ProfileDropdown } from "./profile/ProfileDropdown";
import ThemeSwitch from "@/components/ThemeSwitch";
import siteMetadata from "@/config/siteMetadata";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParamsContext } from "@/providers/SearchParamsProvider";

const Header = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { searchParams } = useSearchParamsContext();
  const redirectTo = searchParams?.get("redirect") || ROUTES.DASHBOARD;

  let headerClass =
    "flex items-center w-full dark:bg-gray-950 justify-between py-10";
  if (siteMetadata.stickyNav) {
    headerClass += " sticky top-0 z-50";
  }

  const renderHeaderLogo = () => (
    <Link href={ROUTES.HOME} aria-label={siteMetadata.headerTitle}>
      <div className="flex items-center align-middle justify-between">
        <Image
          src={siteMetadata.siteLogo}
          alt={siteMetadata.headerTitle}
          width={30}
          height={30}
          className="mr-4 align-middle justify-center"
          priority
        />
        {typeof siteMetadata.headerTitle === "string" ? (
          <div className="hidden text-2xl font-semibold sm:block">
            {siteMetadata.headerTitle}
          </div>
        ) : (
          siteMetadata.headerTitle
        )}
      </div>
    </Link>
  );

  const renderNavigation = () => (
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
  );

  const renderAuthButtons = () => {
    if (isLoading) return null;

    if (isAuthenticated && user) {
      return (
        <>
          <Link href={ROUTES.DASHBOARD}>
            <Button className="flex items-center space-x-2">
              <DashboardIcon className="h-5 w-5" />
              <span>Go to Dashboard</span>
            </Button>
          </Link>
          {/* <NotificationPopover /> */}
          <ProfileDropdown />
        </>
      );
    }

    return (
      <Link
        href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full border-2 border-[#CC322D] px-6 py-2 text-lg font-medium text-[#CC322D] hover:bg-[#CC322D]/10"
      >
        <LogIn className="h-4 w-4" />
        <span>Login</span>
      </Link>
    );
  };

  return (
    <header className={headerClass}>
      {renderHeaderLogo()}
      <div className="flex items-center space-x-4 leading-5 sm:space-x-6">
        {/* <div className="no-scrollbar hidden max-w-40 items-center space-x-4 overflow-x-auto sm:flex sm:space-x-6 md:max-w-72 lg:max-w-96">
          {getNavLinks().map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block font-medium text-gray-900 hover:text-primary-500 dark:text-gray-100 dark:hover:text-primary-400"
            >
              {link.label}
            </Link>
          ))}
        </div> */}
        {renderNavigation()}
        {renderAuthButtons()}
        <ThemeSwitch />
        <MobileNav />
      </div>
    </header>
  );
};

export default Header;
