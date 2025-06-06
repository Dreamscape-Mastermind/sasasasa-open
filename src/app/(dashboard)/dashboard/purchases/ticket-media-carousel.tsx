"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

interface TicketMediaCarouselProps {
  images: string[];
  autoPlay?: boolean;
  interval?: number;
}

export default function TicketMediaCarousel({
  images = [
    "/placeholder.svg?height=200&width=400",
    "/placeholder.svg?height=200&width=400",
    "/placeholder.svg?height=200&width=400",
  ],
  autoPlay = true,
  interval = 5000,
}: TicketMediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  useEffect(() => {
    if (autoPlay && !isHovering) {
      const timer = setTimeout(() => {
        nextSlide();
      }, interval);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, autoPlay, interval, isHovering]);

  return (
    <div
      className="relative w-full h-48 overflow-hidden rounded-lg bg-background"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${images[currentIndex]})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-70" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation controls - only show on hover */}
      <AnimatePresence>
        {isHovering && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={prevSlide}
                className="rounded-full bg-background/30 backdrop-blur-sm text-foreground hover:bg-background/50 h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={nextSlide}
                className="rounded-full bg-background/30 backdrop-blur-sm text-foreground hover:bg-background/50 h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Indicator dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10">
        {images.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-primary" : "bg-muted"
            }`}
            whileTap={{ scale: 0.9 }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
