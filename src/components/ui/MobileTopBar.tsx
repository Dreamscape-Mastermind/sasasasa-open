"use client";

import { AnimatePresence, m } from "framer-motion";
import { ArrowLeft, LayoutDashboard, LogIn, Search, X } from "lucide-react";
import Image from "next/image";
import React from "react";

interface LogoConfig {
  src: string;
  alt: string;
  title: string;
}

interface MobileTopBarProps {
  isSearchMode: boolean;
  isMenuMode: boolean;
  handleLogoClick: () => void;
  handleSearchFocus: () => void;
  handleRightIconClick: () => void;
  isAuthenticated: boolean;
  logo: LogoConfig;
  handleSearchExit: () => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  debouncedSetSearch: (value: string) => void;
  handleClearSearch: () => void;
  handleSearchSubmit: (query: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  handleMenuExit: () => void;
}

const MobileTopBar = ({
  isSearchMode,
  isMenuMode,
  handleLogoClick,
  handleSearchFocus,
  handleRightIconClick,
  isAuthenticated,
  logo,
  handleSearchExit,
  searchValue,
  setSearchValue,
  debouncedSetSearch,
  handleClearSearch,
  handleSearchSubmit,
  searchInputRef,
  handleMenuExit,
}: MobileTopBarProps) => {
  return (
    <m.div
      className="mx-3 mt-3 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md rounded-full shadow-lg shadow-black/5 dark:shadow-black/20 border border-gray-100/50 dark:border-gray-800/50 overflow-hidden relative z-50"
      animate={{
        scale: isSearchMode || isMenuMode ? 1.01 : 1,
        y: isSearchMode || isMenuMode ? 2 : 0,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      layout
    >
      <AnimatePresence mode="wait">
        {!isSearchMode && !isMenuMode ? (
          // Default unified bar: [Logo] [Search] [Smart Icon]
          <m.div
            key="default"
            className="flex items-center gap-2 px-2 py-2.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Logo as Menu Trigger */}
            <m.button
              className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              onClick={handleLogoClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{
                scale: 0.95,
                rotate: [0, -3, 3, 0],
                transition: { duration: 0.3 },
              }}
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={24}
                height={24}
                className="rounded-full p-1 ring-1 ring-gray-200/50 dark:ring-gray-700/50"
                priority
              />
            </m.button>

            {/* Seamless Search Area - Consistent height */}
            <m.div
              className="flex-1 min-w-0 px-3 py-1.5 bg-white dark:bg-gray-950 rounded-full cursor-text transition-all duration-200 flex items-center gap-3"
              onClick={handleSearchFocus}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.998 }}
            >
              <m.div
                animate={{
                  rotate: [0, 8, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 4,
                  ease: "easeInOut",
                }}
              >
                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </m.div>
              <m.span
                className="text-gray-500 dark:text-gray-400 text-sm font-medium"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                Search experiences...
              </m.span>
            </m.div>

            {/* Smart Right Icon */}
            <m.button
              className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
              onClick={handleRightIconClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isAuthenticated ? (
                <LayoutDashboard className="h-4 w-4 text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors" />
              ) : (
                <LogIn className="h-4 w-4 text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 transition-colors" />
              )}
            </m.button>
          </m.div>
        ) : isSearchMode ? (
          // Simple Search mode - Consistent height with default mode
          <m.div
            key="search"
            className="flex items-center gap-1 px-2 py-2.5 relative z-50"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{
              type: "spring",
              stiffness: 450,
              damping: 28,
              duration: 0.35,
            }}
          >
            {/* Back Button - Compact */}
            <m.button
              className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              onClick={handleSearchExit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </m.button>

            {/* Search Input Container - Exact same height as default search area */}
            <m.div
              className="flex-1 min-w-0 px-3 py-1.5 bg-white dark:bg-gray-950 rounded-full flex items-center"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 450,
                damping: 28,
                duration: 0.35,
              }}
            >
              <input
                ref={searchInputRef}
                type="text"
                value={searchValue}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 100) {
                    setSearchValue(value);
                    debouncedSetSearch(value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchSubmit(searchValue);
                  }
                  if (e.key === "Escape") {
                    handleSearchExit();
                  }
                }}
                placeholder="What are you looking for?"
                className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm font-medium leading-none"
                maxLength={100}
                autoComplete="off"
                spellCheck="false"
                aria-label="Search input"
              />
            </m.div>

            {/* Clear Button - Only when needed */}
            <AnimatePresence>
              {searchValue && (
                <m.button
                  className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  onClick={handleClearSearch}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </m.button>
              )}
            </AnimatePresence>
          </m.div>
        ) : (
          // Menu mode - Consistent height and smooth transitions
          <m.div
            key="menu"
            className="flex items-center gap-1 px-2 py-2.5 relative z-50"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{
              type: "spring",
              stiffness: 450,
              damping: 28,
              duration: 0.35,
            }}
          >
            <m.button
              className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              onClick={handleMenuExit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Close menu"
            >
              <ArrowLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </m.button>

            <m.div
              className="flex-1 min-w-0 px-3 py-1.5"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 450,
                damping: 28,
                duration: 0.35,
              }}
            >
              <span className="text-gray-700 dark:text-gray-200 text-sm font-semibold">
                Menu
              </span>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
};

export default MobileTopBar;