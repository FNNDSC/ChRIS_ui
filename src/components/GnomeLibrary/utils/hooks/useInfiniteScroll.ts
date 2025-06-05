import { useEffect, useRef, useState, useCallback } from "react";
import { debounce } from "lodash";

interface UseInfiniteScrollOptions {
  /**
   * Function to call when more data should be loaded
   */
  onLoadMore: () => void;

  /**
   * Whether there is more data available to load
   */
  hasMore: boolean;

  /**
   * Whether data is currently being loaded
   */
  isLoading: boolean;

  /**
   * Root element to use for intersection observer (default: null = viewport)
   * Can be a ref object or a direct DOM element
   */
  root?: React.RefObject<HTMLElement> | Element | null;

  /**
   * Distance from the bottom at which to trigger loading more (in pixels)
   */
  threshold?: number;

  /**
   * Delay after loading completes before allowing another load (in ms)
   */
  loadingDelay?: number;

  /**
   * Threshold in pixels to determine if user is at bottom of container
   */
  bottomThreshold?: number;

  /**
   * Debounce delay for scroll events (in ms)
   */
  scrollDebounce?: number;
}

interface UseInfiniteScrollReturn {
  /**
   * Ref to attach to the sentinel element at the bottom of your list
   */
  sentinelRef: React.RefObject<HTMLElement>;

  /**
   * Whether the user is near the bottom of the list
   */
  isNearBottom: boolean;

  /**
   * Manually trigger loading more data
   */
  loadMore: () => void;
}

/**
 * Hook for implementing infinite scrolling
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  root = null,
  threshold = 200,
  loadingDelay = 200,
  bottomThreshold = 10,
  scrollDebounce = 100,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  // Ref to the sentinel element
  const sentinelRef = useRef<HTMLElement>(null);

  // Track if we're near the bottom
  const [isNearBottom, setIsNearBottom] = useState(false);

  // Prevent multiple simultaneous loads
  const canLoadMoreRef = useRef(true);

  // Observer reference
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Get the actual DOM element from the root (could be a ref or direct element)
  const getRootElement = useCallback((): Element | null => {
    if (!root) return null;

    // If root is a ref object (has 'current' property)
    if ("current" in root) {
      return root.current;
    }

    // Otherwise it's a direct DOM element
    return root;
  }, [root]);

  /**
   * Check if the container is at the bottom within the specified threshold
   */
  const isAtBottomOfContainer = useCallback(
    (container: Element): boolean => {
      return (
        Math.abs(
          container.scrollHeight - container.scrollTop - container.clientHeight,
        ) < bottomThreshold
      );
    },
    [bottomThreshold],
  );

  /**
   * Check if we should load more data based on current state
   */
  const shouldLoadMore = useCallback((): boolean => {
    return hasMore && !isLoading && canLoadMoreRef.current;
  }, [hasMore, isLoading]);

  /**
   * Check if at bottom and load more if conditions are met
   */
  const checkIfAtBottomAndLoadMore = useCallback(() => {
    const rootElement = getRootElement();
    if (!rootElement || !shouldLoadMore()) return;

    if (isAtBottomOfContainer(rootElement)) {
      loadMore();
    }
  }, [getRootElement, shouldLoadMore, isAtBottomOfContainer]);

  // Reset loading state when loading completes
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    if (isLoading) {
      // Prevent loading while already loading
      canLoadMoreRef.current = false;
    } else if (hasMore) {
      // Allow loading after a delay
      timeout = setTimeout(() => {
        canLoadMoreRef.current = true;
      }, loadingDelay);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isLoading, hasMore, loadingDelay]);

  // Load more function
  const loadMore = useCallback(() => {
    if (shouldLoadMore()) {
      canLoadMoreRef.current = false;
      onLoadMore();
    }
  }, [shouldLoadMore, onLoadMore]);

  // Setup intersection observer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const rootElement = getRootElement();

    if (!sentinel) return;

    const handleIntersection: IntersectionObserverCallback = (entries) => {
      const entry = entries[0];

      // Update near bottom state
      setIsNearBottom(hasMore && !isLoading && entry.isIntersecting);

      // Auto-load more when sentinel is visible
      if (entry.isIntersecting && shouldLoadMore()) {
        loadMore();
      }
    };

    const observer = new IntersectionObserver(handleIntersection, {
      root: rootElement,
      rootMargin: `0px 0px ${threshold}px 0px`,
      threshold: 0.1,
    });

    observer.observe(sentinel);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [hasMore, isLoading, loadMore, getRootElement, threshold, shouldLoadMore]);

  // Handle scroll events for the edge case when user is already at the bottom
  useEffect(() => {
    const rootElement = getRootElement();
    if (!rootElement) return;

    // Track last scroll position to detect scroll direction
    let lastScrollTop = rootElement.scrollTop;

    // Type-safe event handlers
    const handleScroll = (event: Event): void => {
      // Detect scroll direction (down = positive delta)
      const currentScrollTop = rootElement.scrollTop;
      const scrollDelta = currentScrollTop - lastScrollTop;
      lastScrollTop = currentScrollTop;

      // Only proceed if trying to scroll down (or no movement, which can happen at the bottom)
      if (scrollDelta >= 0) {
        // Check if we're at the bottom and load more if needed
        if (isAtBottomOfContainer(rootElement) && shouldLoadMore()) {
          loadMore();
        }
      }
    };

    // Create debounced version of scroll handler for better performance
    const debouncedHandleScroll = debounce(handleScroll, scrollDebounce);

    // Type-safe wheel event handler
    const handleWheel = (event: Event): void => {
      const wheelEvent = event as WheelEvent;
      // Only handle scroll down attempts (positive deltaY means scrolling down)
      if (
        wheelEvent.deltaY > 0 &&
        isAtBottomOfContainer(rootElement) &&
        shouldLoadMore()
      ) {
        loadMore();
      }
    };

    // Type-safe keyboard event handler
    const handleKeyDown = (event: Event): void => {
      const keyEvent = event as KeyboardEvent;

      // Only handle keyboard events when the element has focus
      const activeElement = document.activeElement;
      if (
        activeElement === rootElement ||
        (activeElement && rootElement.contains(activeElement))
      ) {
        if (
          keyEvent.key === "ArrowDown" ||
          keyEvent.key === "PageDown" ||
          keyEvent.key === "End"
        ) {
          // Wait a tiny bit for the scroll to complete
          setTimeout(checkIfAtBottomAndLoadMore, 100);
        }
      }
    };

    // Add event listeners with proper type handling
    rootElement.addEventListener("scroll", debouncedHandleScroll, {
      passive: true,
    });
    rootElement.addEventListener("wheel", handleWheel, { passive: true });

    // Add keyboard event listener to document for better keyboard navigation support
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      // Clean up all event listeners
      rootElement.removeEventListener("scroll", debouncedHandleScroll);
      rootElement.removeEventListener("wheel", handleWheel);
      document.removeEventListener("keydown", handleKeyDown);
      // Cancel any pending debounced calls
      debouncedHandleScroll.cancel();
    };
  }, [
    getRootElement,
    shouldLoadMore,
    loadMore,
    isAtBottomOfContainer,
    checkIfAtBottomAndLoadMore,
    scrollDebounce,
  ]);

  return {
    sentinelRef,
    isNearBottom,
    loadMore,
  };
}
