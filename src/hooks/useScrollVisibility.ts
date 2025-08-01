"use client";

import { useState, useEffect } from "react";

interface UseScrollVisibilityOptions {
  threshold?: number;
  hideDelay?: number;
}

export function useScrollVisibility({ 
  threshold = 50, 
  hideDelay = 10 
}: UseScrollVisibilityOptions = {}) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrollingDown, setIsScrollingDown] = useState(false);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout | null = null;
    
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      // Add minimum scroll delta to prevent false positives
      const scrollDelta = Math.abs(currentScrollY - lastScrollY);
      const isSignificantScroll = scrollDelta > 5;  // Add minimum scroll threshold
      
      // Clear any existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      // Always show when at the very top
      if (currentScrollY < 10) {
        setIsVisible(true);
        setIsScrollingDown(false);
      }
      // Hide when scrolling down (after threshold to avoid accidental triggers)
      else if (isSignificantScroll && currentScrollY > lastScrollY && currentScrollY > threshold) {
        setIsVisible(false);
        setIsScrollingDown(true);
        // Clear scrolling down flag after delay
        scrollTimeout = setTimeout(() => {
          setIsScrollingDown(false);
        }, 200);
      } 
      // Show when scrolling up from anywhere
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
        setIsScrollingDown(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    let inactivityTimeout: NodeJS.Timeout | null = null;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          controlNavbar();
          ticking = false;
        });
        ticking = true;
      }
      
      // Reset scrollingDown after scroll inactivity
      if (inactivityTimeout) {
        clearTimeout(inactivityTimeout);
      }
      inactivityTimeout = setTimeout(() => {
        setIsScrollingDown(false);
      }, 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      if (inactivityTimeout) {
        clearTimeout(inactivityTimeout);
      }
    };
  }, [lastScrollY, threshold]);

  return { isVisible, lastScrollY, isScrollingDown };
} 