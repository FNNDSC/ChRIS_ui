import React, { type RefObject, type MutableRefObject } from "react";
import useResizeObserver from "@react-hook/resize-observer";

const useSize = (
  target:
    | MutableRefObject<HTMLDivElement | SVGSVGElement | null>
    | RefObject<SVGGElement | HTMLDivElement | SVGSVGElement>,
) => {
  // size is of type DOMRectReadOnly or undefined initially
  const [size, setSize] = React.useState<DOMRectReadOnly | undefined>();

  React.useLayoutEffect(() => {
    if (target.current) {
      // Safely access getBoundingClientRect() method
      const rect = target.current.getBoundingClientRect();
      setSize(rect);
    }
  }, [target]);

  useResizeObserver(target, (entry) => setSize(entry.contentRect));

  return size;
};

export default useSize;
