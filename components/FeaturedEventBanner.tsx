"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { SasasasaEvent } from '@/utils/dataStructures';
import {Button} from '@/components/ui/button';

interface FeaturedEventBannerProps {
  event?: SasasasaEvent;  // Made optional
}

const FeaturedEventBanner = ({ event }: FeaturedEventBannerProps) => {
  const [isFlashSaleActive, setIsFlashSaleActive] = useState(false);
  
  const activeFlashSale = event?.available_tickets?.[0]?.flash_sale;
  
  useEffect(() => {
    const checkTimeWindow = () => {
      const now = Date.now();
      
      if (activeFlashSale) {
        const startTime = new Date(activeFlashSale.start_date).getTime();
        const endTime = new Date(activeFlashSale.end_date).getTime();
        const hasStarted = now >= startTime;
        const hasEnded = now > endTime;
        setIsFlashSaleActive(hasStarted && !hasEnded && activeFlashSale.status === 'ACTIVE');
      } else {
        setIsFlashSaleActive(false);
      }
    };

    checkTimeWindow();
    const timer = setInterval(checkTimeWindow, 1000);
    return () => clearInterval(timer);
  }, [activeFlashSale]);

  const performers = [
    { name: 'M. Rumbi', spotify: 'https://open.spotify.com/artist/6ToQowXRJ5GkBPHDECCEoP' },
    { name: 'Kinoti', spotify: 'https://open.spotify.com/artist/45KLKfGTZLK4BUZAv2l5sm' },
    { name: 'Clark Keeng', spotify: 'https://open.spotify.com/artist/3trMdyvF4qVEceHElT1oAP' },
    { name: 'Matt Ngesa', spotify: 'https://open.spotify.com/artist/38jStfZwiNvdn1PKt9ma35' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100
      }
    }
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
        times: [0, 0.2, 0.4, 0.6, 0.8, 1]
      }
    }
  };

  return (
    <Link href={event?.short_url ? `/e/${event.short_url}` : "/sunday-acoustic-soul-sessions"} className="block group relative">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative w-full h-[450px] sm:h-[450px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-xl mb-8"
      >
        <Image
          src={event?.cover_image || "https://sasasasa.co/_next/image?url=http%3A%2F%2Fra.sasasasa.co%2Fmedia%2Fevent_covers%2Fsass-02-p1.jpg&w=1080&q=75"}
          alt={event?.title || "Sunday Acoustic Soul Session"}
          fill
          className="object-cover object-center transition-transform duration-300 group-hover:scale-102"
          priority
          style={{
            transform: 'scale(1.1)',  // Start slightly zoomed in
            animation: 'zoomOut 1.5s ease-out forwards'  // Animate to normal size
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
                15th Dec, 3PM
              </motion.span>
            </motion.div>
            
            <motion.h2 
              variants={itemVariants}
              className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-white drop-shadow-lg"
            >
              {event?.title || "Sunday Acoustic Soul Session"}
            </motion.h2>
            
            <motion.p 
              variants={itemVariants}
              className="text-base sm:text-lg text-gray-100 max-w-3xl leading-relaxed 
                drop-shadow-lg text-shadow-sm mb-4 font-medium
                [text-shadow:_0_1px_2px_rgba(0,0,0,0.8)]"
            >
              Join us at Moov Cafe & Bistro for an unforgettable afternoon of soulful live music featuring:
            </motion.p>

            <motion.div 
              className="flex flex-wrap justify-between gap-2 sm:gap-3 mt-2 w-full"
              variants={containerVariants}
            >
              {performers.map((performer, index) => (
                <motion.a
                  key={performer.name}
                  href={performer.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-lg sm:text-xl md:text-2xl font-semibold text-white 
                    hover:text-primary transition-colors duration-200 
                    flex items-center gap-2 drop-shadow-lg
                    [text-shadow:_0_1px_2px_rgba(0,0,0,0.8)]"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {performer.name}
                  <motion.svg
                    className="w-5 h-5 inline-block"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </motion.svg>
                </motion.a>
              ))}
            </motion.div>

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
                    <p className="font-bold text-sm sm:text-base md:text-lg">FLASH SALE!</p>
                    <p className="text-xs sm:text-sm md:text-base">
                      {activeFlashSale.discount_type === 'PERCENTAGE' 
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
      </motion.div>
    </Link>
  );
};

export default FeaturedEventBanner;   