"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { NAV_ITEMS } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserRole } from "@/types/user";
import { cn } from "@/lib/utils";
import { m } from "framer-motion";
import { usePathname } from "next/navigation";

interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  hasRole: (roleName: string) => boolean;
}

const getRoleBasedNavigation = (hasRole: (roleName: string) => boolean) => {
  const navigationItems = [...NAV_ITEMS.DASHBOARD_ADMIN]; // Base items for all users

  // Add blog admin items only for admin users
  if (hasRole(UserRole.ADMIN) || hasRole(UserRole.SUPER_ADMIN)) {
    navigationItems.push(...NAV_ITEMS.DASHBOARD_BLOG_ADMIN);
  }

  return navigationItems;
};

const containerVariants = {
  hidden: { opacity: 0, x: 10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 15 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 350,
      damping: 25,
    },
  },
};

export function RightSidebar({ isOpen, onClose, hasRole }: RightSidebarProps) {
  const pathname = usePathname();
  const navigationItems = getRoleBasedNavigation(hasRole);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-72 bg-background/95 backdrop-blur-md p-0"
      >
        <SheetHeader className="border-b border-gray-200/30 dark:border-gray-700/30 p-6">
          <SheetTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Dashboard
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 h-full">
          <div className="p-6">
            <m.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Main Navigation Section */}
              <div className="mb-8">
                <m.h3
                  className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4"
                  variants={itemVariants}
                >
                  Main Navigation
                </m.h3>
                <div className="space-y-2">
                  {navigationItems.slice(0, 3).map((menu) => (
                    <m.div key={menu.href} variants={itemVariants}>
                      <Link
                        href={menu.href}
                        onClick={onClose}
                        className="block"
                      >
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start gap-3 p-4 h-auto rounded-xl text-gray-700 dark:text-gray-200 font-medium transition-all duration-300 border border-transparent hover:bg-gradient-to-r hover:from-gray-50/70 hover:to-gray-100/40 dark:hover:from-gray-800/40 dark:hover:to-gray-800/60 hover:border-gray-200/30 dark:hover:border-gray-700/30",
                            pathname === menu.href &&
                              "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800"
                          )}
                        >
                          {menu.icon && <menu.icon className="h-5 w-5" />}
                          <span>{menu.label}</span>
                        </Button>
                      </Link>
                    </m.div>
                  ))}
                </div>
              </div>

              {/* Admin Section - Only show if user has admin roles */}
              {(hasRole(UserRole.ADMIN) || hasRole(UserRole.SUPER_ADMIN)) && (
                <div className="mb-8">
                  <m.h3
                    className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4"
                    variants={itemVariants}
                  >
                    Blog Management
                  </m.h3>
                  <div className="space-y-2">
                    {navigationItems.slice(3).map((menu) => (
                      <m.div key={menu.href} variants={itemVariants}>
                        <Link
                          href={menu.href}
                          onClick={onClose}
                          className="block"
                        >
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start gap-3 p-4 h-auto rounded-xl text-gray-700 dark:text-gray-200 font-medium transition-all duration-300 border border-transparent hover:bg-gradient-to-r hover:from-gray-50/70 hover:to-gray-100/40 dark:hover:from-gray-800/40 dark:hover:to-gray-800/60 hover:border-gray-200/30 dark:hover:border-gray-700/30",
                              pathname === menu.href &&
                                "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800"
                            )}
                          >
                            {menu.icon && <menu.icon className="h-5 w-5" />}
                            <span>{menu.label}</span>
                          </Button>
                        </Link>
                      </m.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions Section */}
              <div>
                <m.h3
                  className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4"
                  variants={itemVariants}
                >
                  Quick Actions
                </m.h3>
                <div className="space-y-2">
                  <m.div variants={itemVariants}>
                    <Link
                      href="/dashboard/events/create"
                      onClick={onClose}
                      className="block"
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 p-4 h-auto rounded-xl text-gray-700 dark:text-gray-200 font-medium transition-all duration-300 border border-transparent hover:bg-gradient-to-r hover:from-gray-50/70 hover:to-gray-100/40 dark:hover:from-gray-800/40 dark:hover:to-gray-800/60 hover:border-gray-200/30 dark:hover:border-gray-700/30"
                      >
                        <span className="text-lg">+</span>
                        <span>Create Event</span>
                      </Button>
                    </Link>
                  </m.div>
                </div>
              </div>
            </m.div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
