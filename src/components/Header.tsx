"use client";

import { NAV_ITEMS, ROUTES } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import { DashboardIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import Link from "./Link";
import { LogIn } from "lucide-react";
import AnimatedMobileNav from "@/components/AnimatedMobileNav";
import { ProfileDropdown } from "./profile/ProfileDropdown";
import ThemeSwitch from "@/components/ThemeSwitch";
import siteMetadata from "@/config/siteMetadata";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

const Header = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") || ROUTES.DASHBOARD;
  
  // Scroll state management
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      // Always show when at the very top
      if (currentScrollY < 10) {
        setIsVisible(true);
      }
      // Hide when scrolling down (after 50px to avoid accidental triggers)
      else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } 
      // Show when scrolling up from anywhere
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          controlNavbar();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  let headerClass =
    "flex items-center w-full dark:bg-gray-950 justify-between py-10 transition-transform duration-300 ease-in-out";
  if (siteMetadata.stickyNav) {
    headerClass += " sticky top-0 z-50";
  }
  if (!isVisible) {
    headerClass += " -translate-y-full";
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
    <nav className="hidden sm:flex items-center space-x-4 md:space-x-3 lg:space-x-6">
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
    <>
      {/* Desktop Header */}
      <header className={`${headerClass} hidden sm:flex`}>
        {renderHeaderLogo()}
        <div className="flex items-center space-x-4 leading-5 sm:space-x-6">
          {renderNavigation()}
          <div className="flex items-center space-x-4">
            {renderAuthButtons()}
          </div>
          <ThemeSwitch />
        </div>
      </header>

      {/* Mobile - Single Unified Navigation Bar */}
      <div className="sm:hidden">
        <AnimatedMobileNav 
          navItems={NAV_ITEMS.MAIN}
          authButtons={renderAuthButtons()}
          isAuthenticated={isAuthenticated}
          user={user}
          logo={{
            src: siteMetadata.siteLogo,
            alt: siteMetadata.headerTitle,
            title: siteMetadata.headerTitle
          }}
          isVisible={isVisible}
        />
      </div>
    </>
  );
};

export default Header;
