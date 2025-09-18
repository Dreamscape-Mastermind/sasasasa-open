"use client";

import { Calendar, Clock, MapPin, Tag } from "lucide-react";
import { useMemo, useState } from "react";

import { HomepageEvent } from "@/types/event";
import Image from "next/image";
import Link from "next/link";
import moment from "moment-timezone";
import { truncateText } from "@/lib/utils";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLogger } from "@/hooks/useLogger";

interface HomepageEventCardProps {
  item: HomepageEvent;
  className?: string;
}

// Helper function to truncate description
const truncateDescription = (
  description: string,
  maxLength: number = 150
): string => {
  return truncateText(description, maxLength);
};

export default function HomepageEventCard({
  item,
  className = "",
}: HomepageEventCardProps) {
  const [hasError, setHasError] = useState(false);
  const analytics = useAnalytics();
  const logger = useLogger({ context: "HomepageEventCard" });

  // Memoize price formatting
  const formattedPrice = useMemo(() => {
    const price = parseFloat(item.price);
    if (price === 0) return "Free";
    return `KES ${price.toLocaleString()}`;
  }, [item.price]);

  // Memoize flash sale discount calculation
  const flashSaleInfo = useMemo(() => {
    if (!item.flash_sale || !item.has_flash_sale) return null;

    const originalPrice = parseFloat(item.price);
    const discountAmount = parseFloat(item.flash_sale.discount_amount);

    let discountedPrice = originalPrice;
    if (item.flash_sale.discount_type === "PERCENTAGE") {
      discountedPrice = originalPrice * (1 - discountAmount / 100);
    } else {
      discountedPrice = Math.max(0, originalPrice - discountAmount);
    }

    return {
      originalPrice,
      discountedPrice,
      discountAmount,
      discountType: item.flash_sale.discount_type,
      isActive: moment().isBetween(
        moment(item.flash_sale.start_date),
        moment(item.flash_sale.end_date)
      ),
    };
  }, [item.flash_sale, item.price, item.has_flash_sale]);

  const handleClick = () => {
    try {
      analytics.trackUserAction("view_homepage_event", "event", item.title);
      logger.info("User viewed homepage event details", {
        eventId: item.id,
        eventTitle: item.title,
        eventDate: item.start_date,
        eventLocation: item.location?.name || item.venue,
        eventPrice: item.price,
        isFeatured: item.featured,
        hasFlashSale: item.has_flash_sale,
        flashSaleActive: flashSaleInfo?.isActive,
      });
    } catch (error) {
      logger.error("Failed to handle homepage event selection", error);
      analytics.trackError(error as Error, {
        eventId: item.id,
        eventTitle: item.title,
      });
    }
  };

  // Default poster image if no cover image is provided
  const defaultPoster = "/images/placeholdere.jpeg";

  return (
    <Link
      href={`/e/${item.short_url || item.id}`}
      className={`block ${className}`}
      onClick={handleClick}
    >
      <div className="h-[220px] w-full overflow-hidden relative group">
        <Image
          src={hasError ? defaultPoster : item.cover_image || defaultPoster}
          height={560}
          width={560}
          alt={`${item.title} poster`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            setHasError(true);
          }}
        />
        <div className="absolute top-3 right-3 flex flex-col gap-1">
          {item.featured && (
            <div className="bg-red-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full animate-fadeIn animation-delay-300">
              Featured
            </div>
          )}
          {flashSaleInfo?.isActive && (
            <div className="bg-orange-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full animate-pulse">
              🔥 Flash Sale
            </div>
          )}
        </div>

        {/* Description overlay */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 overflow-y-auto">
          <div className="text-center">
            <p className="text-white text-sm leading-relaxed max-h-full overflow-y-auto mb-2">
              {item.title}
            </p>
            {flashSaleInfo?.isActive && (
              <div className="text-orange-400 text-xs font-semibold">
                {flashSaleInfo.discountType === "PERCENTAGE"
                  ? `${flashSaleInfo.discountAmount}% OFF`
                  : `KES ${flashSaleInfo.discountAmount} OFF`}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 text-left relative">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-lg mb-2 line-clamp-2 hover:text-red-600 transition-colors duration-150">
          {item.title}
        </h3>

        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2 opacity-0 animate-fadeIn animation-delay-400">
          <Calendar
            size={15}
            strokeWidth={1.5}
            className="mr-1.5 text-red-600"
          />
          <span className="text-sm">
            {moment(item.start_date).format("MMM D")}
            {item.end_date && ` - ${moment(item.end_date).format("MMM D")}`}
          </span>
        </div>

        {item.venue && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2 opacity-0 animate-fadeIn animation-delay-300">
            <MapPin
              size={15}
              strokeWidth={1.5}
              className="mr-1.5 text-red-600"
            />
            <span className="text-sm line-clamp-1">{item.venue}</span>
          </div>
        )}

        {/* Price Display */}
        <div className="flex items-center justify-between mb-2 opacity-0 animate-fadeIn animation-delay-200">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Tag size={15} strokeWidth={1.5} className="mr-1.5 text-red-600" />
            <span className="text-sm font-medium">
              {flashSaleInfo?.isActive ? (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 line-through">
                    KES {flashSaleInfo.originalPrice.toLocaleString()}
                  </span>
                  <span className="text-orange-600 font-bold">
                    KES {flashSaleInfo.discountedPrice.toLocaleString()}
                  </span>
                </div>
              ) : (
                formattedPrice
              )}
            </span>
          </div>
        </div>

        {item.start_date && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 opacity-0 animate-fadeIn animation-delay-200">
            <Clock
              size={15}
              strokeWidth={1.5}
              className="mr-1.5 text-red-600"
            />
            <span className="text-sm">
              {moment(item.start_date).format("h:mm A")}
            </span>
          </div>
        )}

        {/* Flash Sale Countdown */}
        {flashSaleInfo?.isActive && (
          <div className="mt-2 opacity-0 animate-fadeIn animation-delay-100">
            <div className="text-xs text-orange-600 font-medium">
              Sale ends {moment(item.flash_sale?.end_date).fromNow()}
            </div>
          </div>
        )}

        <div className="mt-4 opacity-0 animate-fadeIn animation-delay-100">
          <span className="inline-block text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-5 py-1.5 rounded-full transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
}

// Named export for convenience
export { HomepageEventCard };
