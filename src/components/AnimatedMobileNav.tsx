"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { ROUTES } from "@/lib/constants";
import { useEvent } from "@/hooks/useEvent";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearch } from "@/hooks/useSearch";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { SearchCategory, SearchResults } from "@/types/search";
import MobileTopBar from "./ui/MobileTopBar";
import SearchPanel from "./ui/SearchPanel";
import MenuPanel from "./ui/MenuPanel";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";

import { RightSidebar } from "./dashboard/RightSidebar";

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

const FILTER_OPTIONS = ["All", "Events", "Performers"];

const AnimatedMobileNav = ({
  navItems,
  authButtons,
  isAuthenticated,
  user,
  logo,
  isVisible = true,
}: AnimatedMobileNavProps) => {
  const { hasRole } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isMenuMode, setIsMenuMode] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchResults, setSearchResults] = useState<SearchResults>();

  // Search hooks
  const { useSearchResults } = useSearch();
  const {
    searches: recentSearches,
    addSearch: addRecentSearch,
    clearSearches,
  } = useRecentSearches();
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");

  const debouncedSetSearch = useDebounce((value: string) => {
    setDebouncedSearchValue(value);
  }, 500);

  const { data: results, isLoading: isSearchLoading } = useSearchResults({
    q: debouncedSearchValue,
    category:
      activeFilter.toLowerCase() === "all"
        ? "all"
        : (activeFilter.toLowerCase() as SearchCategory),
    limit: 10,
  });

  useEffect(() => {
    if (results) {
      setSearchResults({ ...results });
    }
  }, [results]);

  // Theme management
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Override visibility when in search or menu mode to prevent scroll hiding
  const shouldBeVisible = isVisible || isSearchMode || isMenuMode;

  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchScrollRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();
  const { useMyEvents } = useEvent();
  const { data: eventsData, isLoading: isLoadingEvents } = useMyEvents({
    page: 1,
    enabled: isAuthenticated && !!user,
  });
  const events = eventsData?.result?.results || [];
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  // Enhanced search functionality
  const handleSearchFocus = () => {
    setIsSearchMode(true);
    setIsMenuMode(false);
    // Prevent body scroll when search is open - only body, not search results
    document.body.style.overflow = "hidden";
  };

  const handleLogoClick = () => {
    setIsMenuMode(!isMenuMode);
    setIsSearchMode(false);
    if (!isMenuMode) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  };

  const handleSearchExit = () => {
    setIsSearchMode(false);
    setSearchValue("");
    setDebouncedSearchValue("");
    document.body.style.overflow = "unset";
  };

  const handleMenuExit = () => {
    setIsMenuMode(false);
    // Restore body scroll
    document.body.style.overflow = "unset";
  };

  const handleClearSearch = () => {
    setSearchValue("");
    setDebouncedSearchValue("");
    searchInputRef.current?.focus();
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
      handleSearchExit();
      handleMenuExit();
    }
  };

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      addRecentSearch(query.trim());
      handleSearchExit();
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
      document.body.style.overflow = "unset";
    };
  }, [isSearchMode, isMenuMode]);

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), []);

  const handleNavItemClick = () => {
    handleSearchExit();
    handleMenuExit();
  };

  const handleRecentSearchClick = (query: string) => {
    setSearchValue(query);
    debouncedSetSearch(query);
    addRecentSearch(query);
  };

  const handleRightIconClick = () => {
    if (isAuthenticated) {
      setIsRightSidebarOpen(true);
    } else {
      router.push(ROUTES.LOGIN);
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
          !shouldBeVisible ? "-translate-y-full" : "translate-y-0"
        }`}
        ref={containerRef}
      >
        <MobileTopBar
          isSearchMode={isSearchMode}
          isMenuMode={isMenuMode}
          handleLogoClick={handleLogoClick}
          handleSearchFocus={handleSearchFocus}
          handleRightIconClick={handleRightIconClick}
          isAuthenticated={isAuthenticated}
          logo={logo}
          handleSearchExit={handleSearchExit}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          debouncedSetSearch={debouncedSetSearch}
          handleClearSearch={handleClearSearch}
          handleSearchSubmit={handleSearchSubmit}
          searchInputRef={searchInputRef}
          handleMenuExit={handleMenuExit}
        />
        <SearchPanel
          isSearchMode={isSearchMode}
          searchScrollRef={searchScrollRef}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          FILTER_OPTIONS={FILTER_OPTIONS}
          debouncedSearchValue={debouncedSearchValue}
          recentSearches={recentSearches}
          setSearchValue={setSearchValue}
          debouncedSetSearch={debouncedSetSearch}
          handleSearchSubmit={handleSearchSubmit}
          isSearchLoading={isSearchLoading}
          searchResults={searchResults}
          handleNavItemClick={handleNavItemClick}
          handleRecentSearchClick={handleRecentSearchClick}
          clearSearches={clearSearches}
        />
        <MenuPanel
          isMenuMode={isMenuMode}
          selectedEventId={selectedEventId}
          setSelectedEventId={setSelectedEventId}
          handleMenuExit={handleMenuExit}
          isLoadingEvents={isLoadingEvents}
          events={events}
          navItems={navItems}
          handleNavItemClick={handleNavItemClick}
          authButtons={authButtons}
        />
        {isAuthenticated && (
          <RightSidebar
            isOpen={isRightSidebarOpen}
            onClose={() => setIsRightSidebarOpen(false)}
            hasRole={hasRole}
          />
        )}
      </div>
    </LazyMotion>
  );
};

export default AnimatedMobileNav;