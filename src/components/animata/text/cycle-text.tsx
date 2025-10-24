import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export default function CycleText({ words: propWords }: { words?: string[] } = {}) {
  const words = useMemo(
    () =>
      propWords && propWords.length
        ? propWords
        : ["Artists", "Musicians", "Writers", "Worldbuilders", "Curators", "Culture."],
    [propWords]
  );

  const specialWords = useMemo(
    () => ({
      Artists: "Artists",
      Writers: "Writers",
      Curators: "Curators",
      Musicians: "Musicians",
      "Culture.": "Culture."
    }),
    []
  );
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
    <span className="relative whitespace-nowrap align-baseline">
      <span className="invisible block whitespace-nowrap leading-none" aria-hidden="true">
        {longestWord}
      </span>
      <div className="flex justify-center items-center">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -12 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25 }}
          className={`align-center text-center absolute top-0 text-[#CC322D] leading-none${
            specialWords[words[index]]
              ? " "
              : " "
          }`}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
      </div>

    </span>
  );
}
