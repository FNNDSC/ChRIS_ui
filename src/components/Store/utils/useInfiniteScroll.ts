// utils/useInfiniteScroll.ts
import { type RefObject, useEffect } from "react";

interface UseInfiniteScrollOptions {
  fetchNextPage: () => void;
  hasNextPage?: boolean;
  threshold?: number;
}

/**
 * useInfiniteScroll
 * Attaches an IntersectionObserver to the given `ref`.
 * When the observed element is in view and `hasNextPage` is true,
 * calls `fetchNextPage`.
 */
export function useInfiniteScroll(
  ref: RefObject<HTMLElement>,
  { fetchNextPage, hasNextPage, threshold = 0.5 }: UseInfiniteScrollOptions,
) {
  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold },
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, fetchNextPage, hasNextPage, threshold]);
}
