import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function CycleText() {
  const words = useMemo(() => ["musicians", "curators", "culturepreneurs", "worldbuilders"], []);
  const [index, setIndex] = useState(0);

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
    <span className="relative inline-block">
      <span className="invisible whitespace-nowrap" aria-hidden="true">
        {longestWord}
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="absolute left-0 top-0 text-[#CC322D]"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
