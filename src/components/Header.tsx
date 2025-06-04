"use client";

import { NAV_ITEMS, ROUTES } from "@/lib/constants";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import Link from "./Link";
import MobileNav from "@/components/MobileNav";
import { ScrollArea } from "@/components/ui/scroll-area";
import ThemeSwitch from "@/components/ThemeSwitch";
import siteMetadata from "@/config/siteMetadata";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { AvatarFallback } from "./ui/avatar";

const notifications = [
  {
    title: "New Ticket Sale",
    description: "Sarah Maina purchased a VIP ticket",
    time: "2 minutes ago",
    read: false,
  },
  {
    title: "Event Reminder",
    description: "Tech Conference starts in 2 hours",
    time: "1 hour ago",
    read: false,
  },
  {
    title: "Payment Processed",
    description: "Monthly subscription payment received",
    time: "3 hours ago",
    read: true,
  },
  {
    title: "New Review",
    description: "Your event received a 5-star rating",
    time: "5 hours ago",
    read: true,
  },
];

const Header = () => {
  const [unreadCount, setUnreadCount] = useState(
    notifications.filter((n) => !n.read).length
  );
  const { isAuthenticated, hasRole, user } = useAuth();
  const router = useRouter();

  const getNavLinks = () => {
    if (!isAuthenticated) return NAV_ITEMS.MAIN;
    if (hasRole(UserRole.ADMIN)) return NAV_ITEMS.MAIN;
    if (hasRole(UserRole.EVENT_ORGANIZER)) return NAV_ITEMS.MAIN;
    if (hasRole(UserRole.EVENT_TEAM)) return NAV_ITEMS.MAIN;
    if (hasRole(UserRole.CUSTOMER)) return NAV_ITEMS.MAIN;
    return NAV_ITEMS.MAIN;
  };

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  const handleLogout = async () => {
    router.push(ROUTES.HOME);
  };

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

  return (
    <header className={headerClass}>
      {renderHeaderLogo()}
      <div className="flex items-center space-x-4 leading-5 sm:space-x-6">
        <div className="no-scrollbar hidden max-w-40 items-center space-x-4 overflow-x-auto sm:flex sm:space-x-6 md:max-w-72 lg:max-w-96">
          {getNavLinks().map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block font-medium text-gray-900 hover:text-primary-500 dark:text-gray-100 dark:hover:text-primary-400"
            >
              {link.label}
            </Link>
          ))}
        </div>
        {isAuthenticated ? (
          <>
            <Link href={ROUTES.DASHBOARD}>
              <Button size="icon" variant="ghost" className="sm:hidden">
                <DashboardIcon className="h-5 w-5" />
              </Button>
              <Button className="hidden sm:flex items-center space-x-2">
                <DashboardIcon className="h-5 w-5" />
                <span>Go to Dashboard</span>
              </Button>
            </Link>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="font-semibold">Notifications</h4>
                  <Button
                    variant="ghost"
                    className="text-xs"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </Button>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4 py-4">
                    {notifications.map((notification, index) => (
                      <div
                        key={index}
                        className={`flex gap-4 px-2 py-2 rounded-lg ${
                          !notification.read ? "bg-muted" : ""
                        }`}
                      >
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {notification.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
            <ThemeSwitch />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        user?.avatar ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces"
                      }
                    />
                    <AvatarFallback>
                      {user?.first_name?.[0]}
                      {user?.last_name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.first_name} {user?.last_name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || user?.walletAddress}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`${ROUTES.DASHBOARD_SETTINGS}?tab=general`}>
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`${ROUTES.DASHBOARD_SETTINGS}?tab=account`}>
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <ThemeSwitch />
            <Link href={ROUTES.LOGIN}>
              <Button variant="default">Sign In</Button>
            </Link>
          </>
        )}
        <MobileNav />
      </div>
    </header>
  );
};

export default Header;
