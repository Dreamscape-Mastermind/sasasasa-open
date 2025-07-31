"use client";

import { AnimatePresence, m } from "framer-motion";
import { Monitor, Moon, Sun } from "lucide-react";
import Link from "@/components/Link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import React from "react";

interface NavItem {
  label: string;
  href: string;
}

interface MenuPanelProps {
  isMenuMode: boolean;
  selectedEventId: string | undefined;
  setSelectedEventId: (id: string) => void;
  handleMenuExit: () => void;
  isLoadingEvents: boolean;
  events: any[];
  navItems: NavItem[];
  handleNavItemClick: () => void;
  authButtons: React.ReactNode;
}

const containerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -15 },
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

const MenuPanel = ({
  isMenuMode,
  selectedEventId,
  setSelectedEventId,
  handleMenuExit,
  isLoadingEvents,
  events,
  navItems,
  handleNavItemClick,
  authButtons,
}: MenuPanelProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  return (
    <AnimatePresence>
      {isMenuMode && (
        <m.div
          className="absolute top-0 left-0 right-0 min-h-screen bg-white/95 dark:bg-gray-950/95 backdrop-blur-md pt-24"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{
            type: "spring",
            stiffness: 450,
            damping: 28,
            duration: 0.35,
          }}
        >
          <div
            className="p-6 h-full overflow-y-auto pb-24"
            style={{ maxHeight: "calc(100vh - 6rem)" }}
          >
            <m.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Event Select for Dashboard */}
              {pathname?.startsWith("/dashboard") && (
                <div className="mb-8">
                  <label className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">
                    Select Event
                  </label>
                  <select
                    className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-gray-900 text-sm"
                    value={selectedEventId}
                    onChange={(e) => {
                      setSelectedEventId(e.target.value);
                      router.push(
                        `/dashboard/events/${e.target.value}/details`
                      );
                      handleMenuExit();
                    }}
                    disabled={isLoadingEvents || events.length === 0}
                  >
                    {isLoadingEvents && <option>Loading...</option>}
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title.length > 30
                          ? event.title.slice(0, 30) + "..."
                          : event.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {/* Navigation Links */}
              <div className="mb-8">
                <m.h3
                  className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-6"
                  variants={itemVariants}
                >
                  Navigation
                </m.h3>
                <div className="space-y-2">
                  {/* Home Link */}
                  <m.div variants={itemVariants}>
                    <Link
                      href="/"
                      className="flex items-center gap-4 p-4 rounded-2xl text-gray-700 dark:text-gray-200 font-medium hover:bg-gradient-to-r hover:from-gray-50/70 hover:to-gray-100/40 dark:hover:from-gray-800/40 dark:hover:to-gray-800/60 transition-all duration-300 border border-transparent hover:border-gray-200/30 dark:hover:border-gray-700/30"
                      onClick={handleNavItemClick}
                    >
                      Home
                    </Link>
                  </m.div>

                  {navItems
                    .filter((link) => link.href !== "/")
                    .map((link, index) => (
                      <m.div key={link.href} variants={itemVariants}>
                        <Link
                          href={link.href}
                          className="flex items-center gap-4 p-4 rounded-2xl text-gray-700 dark:text-gray-200 font-medium hover:bg-gradient-to-r hover:from-gray-50/70 hover:to-gray-100/40 dark:hover:from-gray-800/40 dark:hover:to-gray-800/60 transition-all duration-300 border border-transparent hover:border-gray-200/30 dark:hover:border-gray-700/30"
                          onClick={handleNavItemClick}
                        >
                          {link.label}
                        </Link>
                      </m.div>
                    ))}
                </div>
              </div>

              {/* Theme Options */}
              <div className="mb-8">
                <m.h3
                  className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-6"
                  variants={itemVariants}
                >
                  Appearance
                </m.h3>
                <div className="space-y-2">
                  {/* Light Theme */}
                  <m.button
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl font-medium transition-all duration-300 border text-left ${
                      theme === "light"
                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-gray-50/70 hover:to-gray-100/40 dark:hover:from-gray-800/40 dark:hover:to-gray-800/60 border-transparent hover:border-gray-200/30 dark:hover:border-gray-700/30"
                    }`}
                    onClick={() => setTheme("light")}
                    variants={itemVariants}
                    whileHover={{ x: 6, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Sun className="h-5 w-5" />
                    <span>Light</span>
                  </m.button>

                  {/* Dark Theme */}
                  <m.button
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl font-medium transition-all duration-300 border text-left ${
                      theme === "dark"
                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-gray-50/70 hover:to-gray-100/40 dark:hover:from-gray-800/40 dark:hover:to-gray-800/60 border-transparent hover:border-gray-200/30 dark:hover:border-gray-700/30"
                    }`}
                    onClick={() => setTheme("dark")}
                    variants={itemVariants}
                    whileHover={{ x: 6, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Moon className="h-5 w-5" />
                    <span>Dark</span>
                  </m.button>

                  {/* System Theme */}
                  <m.button
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl font-medium transition-all duration-300 border text-left ${
                      theme === "system"
                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-gray-50/70 hover:to-gray-100/40 dark:hover:from-gray-800/40 dark:hover:to-gray-800/60 border-transparent hover:border-gray-200/30 dark:hover:border-gray-700/30"
                    }`}
                    onClick={() => setTheme("system")}
                    variants={itemVariants}
                    whileHover={{ x: 6, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Monitor className="h-5 w-5" />
                    <span>System</span>
                  </m.button>
                </div>
              </div>

              {/* Auth Section */}
              <div>
                <m.h3
                  className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-6"
                  variants={itemVariants}
                >
                  Account
                </m.h3>
                <m.div className="space-y-4" variants={itemVariants}>
                  {authButtons}
                </m.div>
              </div>
            </m.div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default MenuPanel;