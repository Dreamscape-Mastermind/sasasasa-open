"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Event } from "@/types/event";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLogger } from "@/hooks/useLogger";
import { useRouter } from "next/navigation";

interface FeaturedEventBannerProps {
  event?: Event;
}

const FeaturedEventBanner = ({ event }: FeaturedEventBannerProps) => {
  const router = useRouter();
  const analytics = useAnalytics();
  const logger = useLogger({ context: "FeaturedEventBanner" });
  const [isFlashSaleActive, setIsFlashSaleActive] = useState(false);

  const activeFlashSale = event?.available_tickets?.[0]?.flash_sale;

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
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

  const flashSaleVariants = {
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

  const handlePerformerClick = (
    performer: Event["performers"][0],
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      analytics.trackUserAction("view_performer", "performer", performer.name);
      logger.info("User clicked performer link", {
        performerId: performer.id,
        performerName: performer.name,
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
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative w-full h-[450px] sm:h-[450px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-xl mb-8"
      >
        <Image
          src={event.cover_image || "/placeholder-event.jpg"}
          alt={event.title}
          fill
          className="object-cover object-center transition-transform duration-300 group-hover:scale-102"
          priority
          style={{
            transform: "scale(1.1)",
            animation: "zoomOut 1.5s ease-out forwards",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 sm:from-black/80 via-black/60 sm:via-black/40 to-transparent">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 sm:from-black/30 via-transparent to-transparent" />
          <motion.div
            className="absolute bottom-0 left-0 p-2 sm:p-6 md:p-8 w-full backdrop-blur-[2px] sm:backdrop-blur-[1px]"
            variants={containerVariants}
          >
            <motion.div
              className="flex items-center my-4 gap-1.5 sm:gap-3 mb-2 sm:mb-3"
              variants={itemVariants}
            >
              <motion.span
                className="inline-block px-2 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-semibold bg-primary rounded-full text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Featured Event
              </motion.span>
              <motion.span
                className="inline-block px-2 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-semibold bg-white/20 backdrop-blur-sm rounded-full text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
              className="text-base sm:text-lg text-gray-100 max-w-3xl leading-relaxed
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
                {event.performers.map((performer) => (
                  <motion.a
                    key={performer.id}
                    href={performer.spotify_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => handlePerformerClick(performer, e)}
                    className="text-lg sm:text-xl md:text-2xl font-semibold text-white
                      hover:text-primary transition-colors duration-200
                      flex items-center gap-2 drop-shadow-lg
                      [text-shadow:_0_1px_2px_rgba(0,0,0,0.8)]"
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {performer.name}
                    {performer.spotify_url && (
                      <motion.svg
                        className="w-5 h-5 inline-block"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                      </motion.svg>
                    )}
                  </motion.a>
                ))}
              </motion.div>
            )}

            <motion.div
              variants={itemVariants}
              className="mt-4 sm:mt-6 flex items-center gap-2 sm:gap-4 md:justify-start"
            >
              {isFlashSaleActive && activeFlashSale && (
                <motion.div
                  variants={flashSaleVariants}
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

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
      </motion.div>
    </div>
  );
};

export default FeaturedEventBanner;
