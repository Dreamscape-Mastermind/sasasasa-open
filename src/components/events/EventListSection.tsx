"use client";

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Ticket,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Event } from "@/types";
import { Events } from "@/components/events/Events";
import { motion } from "framer-motion";

export default function EventListSection({ events }: { events: Event[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [filteredLiveEvents, setFilteredLiveEvents] = useState<Event[]>([]);
  const [filteredPreviousEvents, setFilteredPreviousEvents] = useState<Event[]>(
    []
  );

  // Pagination state for live events
  const [liveCurrentPage, setLiveCurrentPage] = useState(1);
  // Pagination state for previous events
  const [previousCurrentPage, setPreviousCurrentPage] = useState(1);
  const eventsPerPage = 6;

  // Split events into live and previous
  const currentDate = new Date();

  const liveEvents = events.filter((event) => {
    const endDate = event.end_date
      ? new Date(event.end_date)
      : new Date(event.start_date);
    return endDate >= currentDate;
  });

  const previousEvents = events.filter((event) => {
    const endDate = event.end_date
      ? new Date(event.end_date)
      : new Date(event.start_date);
    return endDate < currentDate;
  });

  // Calculate total pages based on filtered events
  const liveTotalPages = Math.ceil(filteredLiveEvents.length / eventsPerPage);
  const previousTotalPages = Math.ceil(
    filteredPreviousEvents.length / eventsPerPage
  );

  // Get current events for the page
  const liveIndexOfLastEvent = liveCurrentPage * eventsPerPage;
  const liveIndexOfFirstEvent = liveIndexOfLastEvent - eventsPerPage;
  const currentLiveEvents = filteredLiveEvents.slice(
    liveIndexOfFirstEvent,
    liveIndexOfLastEvent
  );

  const previousIndexOfLastEvent = previousCurrentPage * eventsPerPage;
  const previousIndexOfFirstEvent = previousIndexOfLastEvent - eventsPerPage;
  const currentPreviousEvents = filteredPreviousEvents.slice(
    previousIndexOfFirstEvent,
    previousIndexOfLastEvent
  );

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  // Add animation variants
  const filterVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const handleSearch = () => {
    // Filter live events
    let filteredLive = [...liveEvents];
    // Filter previous events
    let filteredPrevious = [...previousEvents];

    // Apply search filter to both sets
    if (searchQuery.trim() !== "") {
      const searchLower = searchQuery.toLowerCase();

      filteredLive = filteredLive.filter(
        (event) =>
          event.title?.toLowerCase().includes(searchLower) ||
          event.description?.toLowerCase().includes(searchLower) ||
          event.venue?.toLowerCase().includes(searchLower)
      );

      filteredPrevious = filteredPrevious.filter(
        (event) =>
          event.title?.toLowerCase().includes(searchLower) ||
          event.description?.toLowerCase().includes(searchLower) ||
          event.venue?.toLowerCase().includes(searchLower)
      );
    }

    // Apply date filter (simplified implementation)
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (dateFilter === "today") {
        filteredLive = filteredLive.filter((event) => {
          const eventDate = new Date(event.start_date);
          return eventDate.toDateString() === today.toDateString();
        });

        filteredPrevious = filteredPrevious.filter((event) => {
          const eventDate = new Date(event.start_date);
          return eventDate.toDateString() === today.toDateString();
        });
      } else if (dateFilter === "week") {
        const weekLater = new Date(today);
        weekLater.setDate(weekLater.getDate() + 7);

        filteredLive = filteredLive.filter((event) => {
          const eventDate = new Date(event.start_date);
          return eventDate >= today && eventDate <= weekLater;
        });

        filteredPrevious = filteredPrevious.filter((event) => {
          const eventDate = new Date(event.start_date);
          return eventDate >= today && eventDate <= weekLater;
        });
      } else if (dateFilter === "month") {
        const monthLater = new Date(today);
        monthLater.setMonth(monthLater.getMonth() + 1);

        filteredLive = filteredLive.filter((event) => {
          const eventDate = new Date(event.start_date);
          return eventDate >= today && eventDate <= monthLater;
        });

        filteredPrevious = filteredPrevious.filter((event) => {
          const eventDate = new Date(event.start_date);
          return eventDate >= today && eventDate <= monthLater;
        });
      }
    }

    setFilteredLiveEvents(filteredLive);
    setFilteredPreviousEvents(filteredPrevious);
    setLiveCurrentPage(1); // Reset to first page when applying new filters
    setPreviousCurrentPage(1);
  };

  // Initialize filtered events on component mount
  useEffect(() => {
    setFilteredLiveEvents(liveEvents);
    setFilteredPreviousEvents(previousEvents);
  }, [events]);

  // Handle page navigation for live events
  const goToLivePage = (pageNumber: number) => {
    setLiveCurrentPage(pageNumber);
  };

  const goToPreviousLivePage = () => {
    setLiveCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextLivePage = () => {
    setLiveCurrentPage((prev) => Math.min(prev + 1, liveTotalPages));
  };

  // Handle page navigation for previous events
  const goToPreviousPage = (pageNumber: number) => {
    setPreviousCurrentPage(pageNumber);
  };

  const goToPreviousPreviousPage = () => {
    setPreviousCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPreviousPage = () => {
    setPreviousCurrentPage((prev) => Math.min(prev + 1, previousTotalPages));
  };

  // Generate page numbers for pagination
  const getPageNumbers = (currentPage: number, totalPages: number) => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages are less than max pages to show
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page, last page, and pages around current page
      if (currentPage <= 3) {
        // Near the beginning
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Middle
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <>
      {/* Event Search and Filter Section */}

      {/* Live Events Section */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#CC322D] to-[#BB5F6A] bg-clip-text text-transparent">
            Live Events
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0">
            <span className="text-sm text-gray-500 mr-0 sm:mr-2">
              Showing{" "}
              {filteredLiveEvents.length > 0 ? liveIndexOfFirstEvent + 1 : 0}-
              {Math.min(liveIndexOfLastEvent, filteredLiveEvents.length)} of{" "}
              {filteredLiveEvents.length}
            </span>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-[#CC322D] text-[#CC322D] hover:bg-[#CC322D]/10"
                onMouseEnter={() => setHoveredButton("liveViewAll")}
                onMouseLeave={() => setHoveredButton(null)}
              >
                View All
                <span
                  className={`transition-transform duration-300 ${
                    hoveredButton === "liveViewAll" ? "translate-x-1" : ""
                  }`}
                >
                  →
                </span>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Show message if no live events are available */}
        {filteredLiveEvents.length === 0 ? (
          <motion.div
            className="text-center py-12 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-zinc-800 dark:to-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-lg text-gray-600 dark:text-gray-300">
              No live events available at the moment.
            </p>
          </motion.div>
        ) : (
          <>
            <Events events={currentLiveEvents} />

            {/* Pagination for live events */}
            {liveTotalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={goToPreviousLivePage}
                    disabled={liveCurrentPage === 1}
                    className={`p-2 rounded-md ${
                      liveCurrentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-[#CC322D]/10 hover:text-[#CC322D] dark:text-gray-300 dark:hover:bg-zinc-800 transition-colors duration-200"
                    }`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </motion.button>

                  <div className="flex mx-2">
                    {getPageNumbers(liveCurrentPage, liveTotalPages).map(
                      (page, index) =>
                        page === "..." ? (
                          <span
                            key={`live-ellipsis-${index}`}
                            className="px-3 py-1 text-gray-500"
                          >
                            ...
                          </span>
                        ) : (
                          <motion.button
                            key={`live-page-${page}`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              typeof page === "number" && goToLivePage(page)
                            }
                            className={`px-3 py-1 mx-1 rounded-md ${
                              liveCurrentPage === page
                                ? "bg-gradient-to-r from-[#CC322D] to-[#BB5F6A] text-white shadow-md"
                                : "text-gray-700 hover:bg-[#CC322D]/10 hover:text-[#CC322D] dark:text-gray-300 dark:hover:bg-zinc-800 transition-colors duration-200"
                            }`}
                          >
                            {page}
                          </motion.button>
                        )
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={goToNextLivePage}
                    disabled={liveCurrentPage === liveTotalPages}
                    className={`p-2 rounded-md ${
                      liveCurrentPage === liveTotalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-[#CC322D]/10 hover:text-[#CC322D] dark:text-gray-300 dark:hover:bg-zinc-800 transition-colors duration-200"
                    }`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </motion.button>
                </nav>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Features Section */}
      <div className="container mb-12 mx-auto px-4 py-24 bg-muted/50 rounded-lg">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Choose Sasasasa?</h2>
          <p className="text-muted-foreground">
            Everything you need to create and manage successful events, all in
            one place.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-4 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Easy Event Creation</h3>
            <p className="text-muted-foreground">
              Create and customize your events in minutes with our intuitive
              tools and templates.
            </p>
          </div>
          <div className="space-y-4 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
              <Ticket className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Smart Ticketing</h3>
            <p className="text-muted-foreground">
              Flexible ticketing options with QR codes, multiple tiers, and
              real-time analytics.
            </p>
          </div>
          <div className="space-y-4 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Secure Payments</h3>
            <p className="text-muted-foreground">
              Process payments securely with instant transfers and detailed
              financial reporting.
            </p>
          </div>
        </div>
      </div>

      {/* Previous Events Section */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#CC322D] to-[#BB5F6A] bg-clip-text text-transparent">
            Previous Events
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0">
            <span className="text-sm text-gray-500 mr-0 sm:mr-2">
              Showing{" "}
              {filteredPreviousEvents.length > 0
                ? previousIndexOfFirstEvent + 1
                : 0}
              -
              {Math.min(
                previousIndexOfLastEvent,
                filteredPreviousEvents.length
              )}{" "}
              of {filteredPreviousEvents.length}
            </span>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-[#CC322D] text-[#CC322D] hover:bg-[#CC322D]/10"
                onMouseEnter={() => setHoveredButton("prevViewAll")}
                onMouseLeave={() => setHoveredButton(null)}
              >
                View All
                <span
                  className={`transition-transform duration-300 ${
                    hoveredButton === "prevViewAll" ? "translate-x-1" : ""
                  }`}
                >
                  →
                </span>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Show message if no previous events are available */}
        {filteredPreviousEvents.length === 0 ? (
          <motion.div
            className="text-center py-12 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-zinc-800 dark:to-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-lg text-gray-600 dark:text-gray-300">
              No previous events to display.
            </p>
          </motion.div>
        ) : (
          <>
            <Events events={currentPreviousEvents} />

            {/* Pagination for previous events */}
            {previousTotalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={goToPreviousPreviousPage}
                    disabled={previousCurrentPage === 1}
                    className={`p-2 rounded-md ${
                      previousCurrentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-[#CC322D]/10 hover:text-[#CC322D] dark:text-gray-300 dark:hover:bg-zinc-800 transition-colors duration-200"
                    }`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </motion.button>

                  <div className="flex mx-2">
                    {getPageNumbers(
                      previousCurrentPage,
                      previousTotalPages
                    ).map((page, index) =>
                      page === "..." ? (
                        <span
                          key={`prev-ellipsis-${index}`}
                          className="px-3 py-1 text-gray-500"
                        >
                          ...
                        </span>
                      ) : (
                        <motion.button
                          key={`prev-page-${page}`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            typeof page === "number" && goToPreviousPage(page)
                          }
                          className={`px-3 py-1 mx-1 rounded-md ${
                            previousCurrentPage === page
                              ? "bg-gradient-to-r from-[#CC322D] to-[#BB5F6A] text-white shadow-md"
                              : "text-gray-700 hover:bg-[#CC322D]/10 hover:text-[#CC322D] dark:text-gray-300 dark:hover:bg-zinc-800 transition-colors duration-200"
                          }`}
                        >
                          {page}
                        </motion.button>
                      )
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={goToNextPreviousPage}
                    disabled={previousCurrentPage === previousTotalPages}
                    className={`p-2 rounded-md ${
                      previousCurrentPage === previousTotalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-[#CC322D]/10 hover:text-[#CC322D] dark:text-gray-300 dark:hover:bg-zinc-800 transition-colors duration-200"
                    }`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </motion.button>
                </nav>
              </div>
            )}
          </>
        )}
      </motion.div>
    </>
  );
}
