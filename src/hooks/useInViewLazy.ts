import { useEffect, useRef, useState } from 'react';

interface UseInViewLazyProps {
  threshold?: number;
  rootMargin?: string;
}

export function useInViewLazy({ threshold = 0.1, rootMargin = '50px' }: UseInViewLazyProps = {}) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // Only trigger once
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, inView };
} 