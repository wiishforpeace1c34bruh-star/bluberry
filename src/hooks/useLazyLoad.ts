import { useState, useEffect, useRef, useCallback } from 'react';

interface UseLazyLoadOptions {
  rootMargin?: string;
  threshold?: number;
}

export function useLazyLoad<T extends HTMLElement>(
  options: UseLazyLoadOptions = {}
) {
  const {
    rootMargin = '200px 0px',
    threshold = 0,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const elementRef = useRef<T | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setRef = useCallback((node: T | null) => {
    // Cleanup old observer
    if (observerRef.current && elementRef.current) {
      observerRef.current.unobserve(elementRef.current);
    }

    elementRef.current = node;

    if (node) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          // Once visible, always render (no unloading to prevent jitter)
          if (entry.isIntersecting) {
            setIsVisible(true);
            setShouldRender(true);
          }
        },
        { rootMargin, threshold }
      );
      observerRef.current.observe(node);
    }
  }, [rootMargin, threshold]);

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return { ref: setRef, isVisible, shouldRender };
}

// Hook for batch lazy loading entire grid sections
export function useLazySection(enabled: boolean = true) {
  const [isInView, setIsInView] = useState(!enabled);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setRef = useCallback((node: HTMLDivElement | null) => {
    if (!enabled) {
      setIsInView(true);
      return;
    }

    if (observerRef.current && sectionRef.current) {
      observerRef.current.unobserve(sectionRef.current);
    }

    sectionRef.current = node;

    if (node) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          // Once in view, stay rendered
          if (entry.isIntersecting) {
            setIsInView(true);
          }
        },
        { rootMargin: '400px 0px', threshold: 0 }
      );
      observerRef.current.observe(node);
    }
  }, [enabled]);

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return { ref: setRef, isInView };
}
