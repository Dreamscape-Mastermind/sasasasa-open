import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export default function CycleText() {
  const words = useMemo(() => ["musicians", "artists", "writers",  "curators", "culturepreneurs", "worldbuilders"], []);
  const [index, setIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const longestWord = useMemo(() => {
    return words.reduce((longest, current) =>
      current.length > longest.length ? current : longest,
      ""
    );
  }, [words]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <span className="relative inline-block whitespace-nowrap align-baseline text-[0.9em] sm:text-[1em]">
      <span className="invisible block whitespace-nowrap leading-none" aria-hidden="true">
        {longestWord}
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -12 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25 }}
          className="absolute left-0 top-0 text-[#CC322D] leading-none"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
