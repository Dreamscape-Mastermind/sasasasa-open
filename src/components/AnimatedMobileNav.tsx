"use client";

import { Button } from "@/components/ui/button";
import { LogIn, ArrowLeft, X, Search, User, LayoutDashboard, ChevronLeft, Filter, Sun, Moon, Monitor } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import Link from "@/components/Link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { ROUTES } from "@/lib/constants";

interface NavItem {
  label: string;
  href: string;
}

interface LogoConfig {
  src: string;
  alt: string;
  title: string;
}

interface AnimatedMobileNavProps {
  navItems: NavItem[];
  authButtons: React.ReactNode;
  isAuthenticated: boolean;
  user?: any;
  logo: LogoConfig;
  isVisible?: boolean;
}

const FILTER_OPTIONS = ["All", "Events", "Venues", "Artists", "Categories"];
const PREVIOUS_SEARCHES = ["Music Events", "Tech Conference", "Art Gallery"];

const AnimatedMobileNav = ({ navItems, authButtons, isAuthenticated, user, logo, isVisible = true }: AnimatedMobileNavProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isMenuMode, setIsMenuMode] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  
  // Theme management
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Override visibility when in search or menu mode to prevent scroll hiding
  const shouldBeVisible = isVisible || isSearchMode || isMenuMode;
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchScrollRef = useRef<HTMLDivElement>(null);

  // Enhanced search functionality
  const handleSearchFocus = () => {
    setIsSearchMode(true);
    setIsMenuMode(false);
    // Prevent body scroll when search is open - only body, not search results
    document.body.style.overflow = 'hidden';
  };

  const handleLogoClick = () => {
    setIsMenuMode(!isMenuMode);
    setIsSearchMode(false);
    if (!isMenuMode) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  const handleSearchExit = () => {
    setIsSearchMode(false);
    setSearchValue("");
    // Restore body scroll
    document.body.style.overflow = 'unset';
  };

  const handleMenuExit = () => {
    setIsMenuMode(false);
    // Restore body scroll
    document.body.style.overflow = 'unset';
  };

  const handleClearSearch = () => {
    setSearchValue("");
    searchInputRef.current?.focus();
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      handleSearchExit();
      handleMenuExit();
    }
  };

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      // Add to previous searches if not already there
      if (!PREVIOUS_SEARCHES.includes(query.trim())) {
        PREVIOUS_SEARCHES.unshift(query.trim());
        if (PREVIOUS_SEARCHES.length > 5) {
          PREVIOUS_SEARCHES.pop();
        }
      }
      setSearchValue(query);
      handleSearchExit();
      // Handle search logic here
      console.log("Searching for:", query, "with filter:", activeFilter);
    }
  };

  useEffect(() => {
    if (isSearchMode || isMenuMode) {
      document.addEventListener("mousedown", handleClickOutside);
      if (isSearchMode) {
        searchInputRef.current?.focus();
      }
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      // Cleanup: restore scroll on unmount
      document.body.style.overflow = 'unset';
    };
  }, [isSearchMode, isMenuMode]);

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), []);

  const handleNavItemClick = () => {
    handleSearchExit();
    handleMenuExit();
  };

  const handleRightIconClick = () => {
    if (isAuthenticated) {
      window.location.href = ROUTES.DASHBOARD;
    } else {
      window.location.href = ROUTES.LOGIN;
    }
  };

  // Container animation variants with warm, calm energy
  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring" as const, 
        stiffness: 400, 
        damping: 25,
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -15 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: "spring" as const, 
        stiffness: 350, 
        damping: 25 
      }
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <div 
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
          !shouldBeVisible ? '-translate-y-full' : 'translate-y-0'
        }`}
        ref={containerRef}
      >
        {/* Main Navigation Bar */}
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
                    transition: { duration: 0.3 }
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
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Number.POSITIVE_INFINITY, 
                      repeatDelay: 4,
                      ease: "easeInOut"
                    }}
                  >
                    <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </m.div>
                  <m.span
                    className="text-gray-500 dark:text-gray-400 text-sm font-medium"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
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
                transition={{ type: "spring", stiffness: 450, damping: 28, duration: 0.35 }}
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
                  transition={{ type: "spring", stiffness: 450, damping: 28, duration: 0.35 }}
                >
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchValue}
                    onChange={(e) => {
                      // Handle edge cases: limit length, trim whitespace on change
                      const value = e.target.value;
                      if (value.length <= 100) {
                        setSearchValue(value);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchSubmit(searchValue);
                      }
                      if (e.key === 'Escape') {
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
                transition={{ type: "spring", stiffness: 450, damping: 28, duration: 0.35 }}
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
                  transition={{ type: "spring", stiffness: 450, damping: 28, duration: 0.35 }}
                >
                  <span className="text-gray-700 dark:text-gray-200 text-sm font-semibold">Menu</span>
                </m.div>
              </m.div>
            )}
          </AnimatePresence>
        </m.div>

        {/* Simple Search Panel with Previous Searches and Filters */}
        <AnimatePresence>
          {isSearchMode && (
            <m.div
              className="absolute top-0 left-0 right-0 min-h-screen bg-white/95 dark:bg-gray-950/95 backdrop-blur-md pt-24 z-40"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 450, damping: 28, duration: 0.35 }}
            >
              <div 
                ref={searchScrollRef}
                className="h-full overflow-y-auto p-6 pb-24"
                style={{ maxHeight: 'calc(100vh - 6rem)' }}
              >
                {/* Filter Bar */}
                <m.div
                  className="mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    <Filter className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    {FILTER_OPTIONS.map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex-shrink-0 ${
                          activeFilter === filter
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                            : 'bg-gray-100/80 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-gray-700/60 border border-transparent'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </m.div>

                {/* Previous Searches */}
                {PREVIOUS_SEARCHES.length > 0 && !searchValue && (
                  <m.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                      Recent Searches
                    </h3>
                    <div className="space-y-3 mb-8">
                      {PREVIOUS_SEARCHES.map((search, index) => (
                        <m.button
                          key={search}
                          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 hover:bg-gray-100/80 dark:hover:bg-gray-700/60 cursor-pointer transition-all duration-300 border border-gray-200/30 dark:border-gray-700/30 hover:border-gray-300/50 dark:hover:border-gray-600/50 text-left"
                          onClick={() => {
                            setSearchValue(search);
                            handleSearchSubmit(search);
                          }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          whileHover={{ x: 6, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                          <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">{search}</span>
                        </m.button>
                      ))}
                    </div>
                  </m.div>
                )}

                {/* Search Results or Empty State */}
                {searchValue && (
                  <m.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                      Searching for "{searchValue}" in {activeFilter}
                    </h3>
                    <div className="text-center py-20">
                      <Search className="h-16 w-16 text-gray-200 dark:text-gray-700 mx-auto mb-6" />
                      <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Start typing to search</h3>
                      <p className="text-gray-400 dark:text-gray-500">We'll find what you're looking for</p>
                    </div>
                  </m.div>
                )}

                {/* Default state when no search value and no previous searches */}
                {!searchValue && PREVIOUS_SEARCHES.length === 0 && (
                  <m.div
                    className="text-center py-20"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Search className="h-16 w-16 text-gray-200 dark:text-gray-700 mx-auto mb-6" />
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">What are you looking for?</h3>
                    <p className="text-gray-400 dark:text-gray-500">Search for events, venues, artists, and more</p>
                  </m.div>
                )}
              </div>
            </m.div>
          )}
        </AnimatePresence>

        {/* Full Screen Menu Panel */}
        <AnimatePresence>
          {isMenuMode && (
            <m.div
              className="absolute top-0 left-0 right-0 min-h-screen bg-white/95 dark:bg-gray-950/95 backdrop-blur-md pt-24"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ type: "spring", stiffness: 450, damping: 28, duration: 0.35 }}
            >
              <div 
                className="p-6 h-full overflow-y-auto pb-24"
                style={{ maxHeight: 'calc(100vh - 6rem)' }}
              >
                <m.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
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
                      
                      {navItems.filter((link) => link.href !== "/").map((link, index) => (
                        <m.div
                          key={link.href}
                          variants={itemVariants}
                        >
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
                          theme === 'light'
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-gray-50/70 hover:to-gray-100/40 dark:hover:from-gray-800/40 dark:hover:to-gray-800/60 border-transparent hover:border-gray-200/30 dark:hover:border-gray-700/30'
                        }`}
                        onClick={() => setTheme('light')}
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
                          theme === 'dark'
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-gray-50/70 hover:to-gray-100/40 dark:hover:from-gray-800/40 dark:hover:to-gray-800/60 border-transparent hover:border-gray-200/30 dark:hover:border-gray-700/30'
                        }`}
                        onClick={() => setTheme('dark')}
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
                          theme === 'system'
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-gray-50/70 hover:to-gray-100/40 dark:hover:from-gray-800/40 dark:hover:to-gray-800/60 border-transparent hover:border-gray-200/30 dark:hover:border-gray-700/30'
                        }`}
                        onClick={() => setTheme('system')}
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
                    <m.div 
                      className="space-y-4"
                      variants={itemVariants}
                    >
                      {authButtons}
                    </m.div>
                  </div>
                </m.div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </LazyMotion>
  );
};

export default AnimatedMobileNav; 