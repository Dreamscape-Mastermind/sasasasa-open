"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Event } from "@/types";
import Image from "next/image";
import moment from "moment-timezone";
import { useRouter } from "next/navigation";

interface FeaturedEventBannerProps {
  event?: Event; // Made optional
}

const FeaturedEventBanner = ({ event }: FeaturedEventBannerProps) => {
  const [isFlashSaleActive, setIsFlashSaleActive] = useState(false);
  const router = useRouter();

  const DEFAULT_TIMEZONE = "Africa/Nairobi";

  const activeFlashSale = event?.available_tickets?.[0]?.flash_sale;

  useEffect(() => {
    const checkTimeWindow = () => {
      const now = Date.now();

      if (activeFlashSale) {
        const startTime = new Date(activeFlashSale.start_date).getTime();
        const endTime = new Date(activeFlashSale.end_date).getTime();
        const hasStarted = now >= startTime;
        const hasEnded = now > endTime;
        setIsFlashSaleActive(
          hasStarted && !hasEnded && activeFlashSale.status === "ACTIVE"
        );
      } else {
        setIsFlashSaleActive(false);
      }
    };

    checkTimeWindow();
    const timer = setInterval(checkTimeWindow, 1000);
    return () => clearInterval(timer);
  }, [activeFlashSale]);

  const formatEventDateTime = () => {
    if (!event?.start_date || !event?.end_date) {
      return "TBD"; // Default fallback
    }

    const startDate = moment(event.start_date).tz(DEFAULT_TIMEZONE);
    const endDate = moment(event.end_date).tz(DEFAULT_TIMEZONE);

    // If same day event
    if (startDate.isSame(endDate, "day")) {
      return `${startDate.format("MMM Do")}, ${startDate.format(
        "h:mmA"
      )} - ${endDate.format("h:mmA")}`;
    }

    // Different day event
    return `${startDate.format("MMM Do h:mmA")} - ${endDate.format(
      "MMM Do h:mmA"
    )}`;
  };

  // Add this function to truncate description
  const truncateDescription = (text?: string, maxLength = 2000) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  const handleMainClick = () => {
    if (event?.short_url) {
      router.push(`/e/${event.short_url}`);
    }
  };

  return (
    <div
      onClick={handleMainClick}
      className="block group relative cursor-pointer"
    >
      <div className="relative w-full h-[450px] sm:h-[450px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-xl mb-8 animate-fadeIn">
        <Image
          src={
            event?.cover_image ||
            "https://sasasasa.co/_next/image?url=http%3A%2F%2Fra.sasasasa.co%2Fmedia%2Fevent_covers%2Fsass-02-p1.jpg&w=1080&q=75"
          }
          alt={event?.title || "Untitled Event"}
          fill
          className="object-cover object-center transition-transform duration-300 group-hover:scale-102 animate-zoomOut"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 sm:from-black/80 via-black/60 sm:via-black/40 to-transparent">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 sm:from-black/30 via-transparent to-transparent" />

          {/* Title at top for tablet and desktop */}
          <div className="hidden sm:block absolute top-0 left-0 w-full p-6 md:p-8 animate-fadeIn">
            <div className="flex items-center gap-3 mb-3 animate-slideUp">
              <span className="inline-block px-4 py-1.5 text-sm font-semibold bg-primary rounded-full text-white transition-transform hover:scale-105 active:scale-95">
                Featured Event
              </span>
              <span className="inline-block px-4 py-1.5 text-sm font-semibold bg-white/20 backdrop-blur-sm rounded-full text-white transition-transform hover:scale-105 active:scale-95">
                {formatEventDateTime()}
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg animate-slideUp animation-delay-100">
              {event?.title || "Untitled Awesomeness"}
            </h2>

            <p className="text-lg max-w-3xl leading-relaxed drop-shadow-lg text-shadow-sm mt-2 font-medium text-white animate-slideUp animation-delay-200">
              {event?.title} at {event?.venue}
            </p>

            {/* Add description for tablet and desktop */}
            {event?.description ? (
              <p className="hidden sm:block text-sm md:text-base max-w-3xl mt-4 text-white/90 leading-relaxed drop-shadow-lg text-shadow-sm animate-slideUp animation-delay-300">
                {truncateDescription(event.description)}
              </p>
            ) : null}
          </div>

          {/* Bottom content section - mobile has title here, desktop doesn't */}
          <div className="absolute bottom-0 left-0 p-2 sm:p-6 md:p-8 w-full backdrop-blur-[2px] sm:backdrop-blur-[1px] pb-8 sm:pb-12 md:pb-16 animate-fadeIn">
            {/* Title at bottom for mobile only */}
            <div className="sm:hidden">
              <div className="flex items-center my-4 gap-1.5 mb-2 animate-slideUp">
                <span className="inline-block px-2 py-1 text-xs font-semibold bg-primary rounded-full text-white transition-transform hover:scale-105 active:scale-95">
                  Featured Event
                </span>
                <span className="inline-block px-2 py-1 text-xs font-semibold bg-white/20 backdrop-blur-sm rounded-full text-white transition-transform hover:scale-105 active:scale-95">
                  {formatEventDateTime()}
                </span>
              </div>

              <h2 className="text-2xl font-bold mb-2 text-white drop-shadow-lg mt-4 animate-slideUp animation-delay-100">
                {event?.title || "Untitled Event"}
              </h2>

              <p className="text-base max-w-3xl leading-relaxed drop-shadow-lg text-shadow-sm mb-4 font-medium text-white animate-slideUp animation-delay-200">
                {event?.title} at {event?.venue}
              </p>
            </div>

            {event?.performers && event.performers.length > 0 && (
              <div className="flex flex-wrap justify-between gap-2 sm:gap-3 mt-2 w-full animate-fadeIn">
                {event.performers.map((performer, index) => (
                  <div
                    key={performer.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (performer.spotify_url) {
                        window.open(
                          performer.spotify_url,
                          "_blank",
                          "noopener,noreferrer"
                        );
                      }
                    }}
                    className={`text-lg sm:text-xl md:text-2xl font-semibold text-white
                      hover:text-primary transition-colors duration-200
                      flex items-center gap-2 drop-shadow-lg
                      [text-shadow:_0_1px_2px_rgba(0,0,0,0.8)]
                      transition-transform hover:scale-105 active:scale-95
                      cursor-pointer
                      animate-slideUp animation-delay-${index * 100}`}
                  >
                    {performer.name}
                    <svg
                      className="w-5 h-5 inline-block hover:animate-spin"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                    </svg>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 sm:mt-6 flex items-center gap-2 sm:gap-4 md:justify-start animate-slideUp animation-delay-300">
              {isFlashSaleActive && activeFlashSale && (
                <div className="flex-shrink-0 animate-shake">
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
                </div>
              )}
            </div>
            <div className="mt-4 sm:mt-6 flex items-center gap-2 sm:gap-4 md:justify-start animate-slideUp animation-delay-400">
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
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
      </div>
    </div>
  );
};

export default FeaturedEventBanner;
