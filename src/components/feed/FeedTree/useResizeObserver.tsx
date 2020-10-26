import { useEffect, useState, RefObject } from "react";
import ResizeObserver from "resize-observer-polyfill";

interface DOMRectReadOnly {
  readonly bottom: number;
  readonly height: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

const useResizeObserver = (ref: RefObject<HTMLDivElement>) => {
  const [dimensions, setDimensions] = useState<DOMRectReadOnly>({
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const observeTarget = ref.current;
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        setDimensions(entry.contentRect);
      });
    });
    if (observeTarget) resizeObserver.observe(observeTarget);
    return () => {
      if (observeTarget) resizeObserver.unobserve(observeTarget);
    };
  }, [ref]);
  return dimensions;
};

export default useResizeObserver;
