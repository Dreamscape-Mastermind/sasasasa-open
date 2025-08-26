import { useInViewLazy } from '@/hooks/useInViewLazy';

// Viewport-based lazy section component - loads content only when it becomes visible
interface LazyViewportSectionProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

export function LazyViewportSection({ children, fallback }: LazyViewportSectionProps) {
  const { ref, inView } = useInViewLazy({ threshold: 0.1, rootMargin: '100px' });
  
  return (
    <div ref={ref}>
      {inView ? children : fallback}
    </div>
  );
} 