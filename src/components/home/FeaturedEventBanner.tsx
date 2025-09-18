"use client";

import { Variants, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { HomepageEvent } from "@/types/event";
import Image from "next/image";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLogger } from "@/hooks/useLogger";
import { useRouter } from "next/navigation";

interface FeaturedEventBannerProps {
  event: HomepageEvent;
}

const FeaturedEventBanner = ({ event }: FeaturedEventBannerProps) => {
  const router = useRouter();
  const analytics = useAnalytics();
  const logger = useLogger({ context: "FeaturedEventBanner" });
  const [isFlashSaleActive, setIsFlashSaleActive] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const enableMotion = !(prefersReducedMotion || isMobile);

  // HomepageEvent doesn't have available_tickets, so no flash sale functionality
  const activeFlashSale = null;

  const checkTimeWindow = useCallback(() => {
    const now = Date.now();

    if (activeFlashSale) {
      const startTime = new Date(activeFlashSale.start_date).getTime();
      const endTime = new Date(activeFlashSale.end_date).getTime();
      const hasStarted = now >= startTime;
      const hasEnded = now > endTime;
      const isActive =
        hasStarted && !hasEnded && activeFlashSale.status === "ACTIVE";

      if (isActive !== isFlashSaleActive) {
        setIsFlashSaleActive(isActive);
      }
    } else {
      setIsFlashSaleActive(false);
    }
  }, [activeFlashSale, event, isFlashSaleActive]);

  useEffect(() => {
    checkTimeWindow();
    const timer = setInterval(checkTimeWindow, 1000);
    return () => clearInterval(timer);
  }, [checkTimeWindow]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  const flashSaleVariants: Variants = {
    hidden: { x: 0 },
    visible: {
      x: [0, -3, 3, -2, 2, 0],
      transition: {
        type: "tween",
        duration: 0.4,
        repeat: Infinity,
        repeatDelay: 19.6,
        ease: "easeInOut",
        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
      },
    },
  };

  const handleMainClick = () => {
    if (event?.short_url) {
      try {
        analytics.trackUserAction("view_featured_event", "event", event.title);
        logger.info("User clicked featured event banner", {
          eventId: event.id,
          eventTitle: event.title,
          hasFlashSale: !!activeFlashSale,
          isFlashSaleActive,
        });
        router.push(`/e/${event.short_url}`);
      } catch (error) {
        logger.error("Failed to handle featured event click", error);
        analytics.trackError(error as Error);
      }
    }
  };

  const handlePerformerClick = (performerName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      analytics.trackUserAction("view_performer", "performer", performerName);
      logger.info("User clicked performer link", {
        performerName: performerName,
        eventId: event?.id,
        eventTitle: event?.title,
      });
    } catch (error) {
      logger.error("Failed to handle performer click", error);
      analytics.trackError(error as Error);
    }
  };

  return (
    <div
      onClick={handleMainClick}
      className="block group relative cursor-pointer"
    >
      <motion.div
        initial={enableMotion ? "hidden" : "visible"}
        animate={"visible"}
        variants={containerVariants}
        className="relative w-full h-[450px] sm:h-[450px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-xl mb-8"
      >
        <Image
          src={event.cover_image || "/placeholder-event.jpg"}
          alt={event.title}
          fill
          className="object-cover object-center transition-transform duration-300 group-hover:scale-102 z-0"
          priority
          style={{
            transform: enableMotion ? "scale(1.1)" : undefined,
            animation: enableMotion
              ? "zoomOut 1.5s ease-out forwards"
              : undefined,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 sm:from-black/80 via-black/60 sm:via-black/40 to-transparent z-20">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 sm:from-black/30 via-transparent to-transparent" />
          <motion.div
            className="absolute bottom-0 left-0 p-2 sm:p-6 md:p-8 w-full backdrop-blur-0 sm:backdrop-blur-[1px] z-30"
            variants={containerVariants}
          >
            <motion.div
              className="flex items-center my-4 gap-1.5 sm:gap-3 mb-2 sm:mb-3"
              variants={itemVariants}
            >
              <motion.span
                className="inline-block px-2 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-semibold bg-primary rounded-full text-white"
                whileHover={enableMotion ? { scale: 1.05 } : undefined}
                whileTap={enableMotion ? { scale: 0.95 } : undefined}
              >
                Featured Event
              </motion.span>
              <motion.span
                className="inline-block px-2 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-semibold bg-white/20 backdrop-blur-sm rounded-full text-white"
                whileHover={enableMotion ? { scale: 1.05 } : undefined}
                whileTap={enableMotion ? { scale: 0.95 } : undefined}
              >
                {new Date(event.start_date).toLocaleDateString()}
              </motion.span>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-white drop-shadow-lg"
            >
              {event.title}
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base text-gray-100 max-w-3xl leading-relaxed overflow-hidden max-h-28 md:max-h-32 line-clamp-4 md:line-clamp-6
                drop-shadow-lg text-shadow-sm mb-4 font-medium
                [text-shadow:_0_1px_2px_rgba(0,0,0,0.8)]"
            >
              {event.description}
            </motion.p>

            {event.performers && event.performers.length > 0 && (
              <motion.div
                className="flex flex-wrap justify-between gap-2 sm:gap-3 mt-2 w-full"
                variants={containerVariants}
              >
                {event.performers.map((performerName, index) => (
                  <motion.span
                    key={index}
                    onClick={(e) => handlePerformerClick(performerName, e)}
                    className="text-lg sm:text-xl md:text-2xl font-semibold text-white
                      hover:text-primary transition-colors duration-200
                      flex items-center gap-2 drop-shadow-lg cursor-pointer
                      [text-shadow:_0_1px_2px_rgba(0,0,0,0.8)]"
                    variants={itemVariants}
                    whileHover={enableMotion ? { scale: 1.05 } : undefined}
                    whileTap={enableMotion ? { scale: 0.95 } : undefined}
                  >
                    {performerName}
                  </motion.span>
                ))}
              </motion.div>
            )}

            <motion.div
              variants={itemVariants}
              className="mt-4 sm:mt-6 flex items-center gap-2 sm:gap-4 md:justify-start"
            >
              {isFlashSaleActive && activeFlashSale && (
                <motion.div
                  variants={enableMotion ? flashSaleVariants : undefined}
                  className="flex-shrink-0"
                >
                  <div className="bg-red-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-lg transform rotate-3">
                    <p className="font-bold text-sm sm:text-base md:text-lg">
                      FLASH SALE!
                    </p>
                    <p className="text-xs sm:text-sm md:text-base">
                      {activeFlashSale.discount_type === "PERCENTAGE"
                        ? `${activeFlashSale.discount_amount}% OFF`
                        : `KES ${activeFlashSale.discount_amount}/- OFF`}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="mt-4 sm:mt-6 flex items-center gap-2 sm:gap-4 md:justify-start"
            >
              <Button className="bg-red-600 w-full rounded-[4rem] hover:bg-primary/90 text-white md:w-auto md:px-8">
                Get Tickets
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 z-10 pointer-events-none" />
      </motion.div>
    </div>
  );
};

export default FeaturedEventBanner;
