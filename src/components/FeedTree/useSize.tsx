import useResizeObserver from "@react-hook/resize-observer";
import React, { type MutableRefObject, type RefObject } from "react";

const useSize = (
  target:
    | MutableRefObject<HTMLDivElement | SVGSVGElement | null>
    | RefObject<SVGGElement | HTMLDivElement | SVGSVGElement>,
) => {
  // size is of type DOMRectReadOnly or undefined initially
  const [size, setSize] = React.useState<DOMRectReadOnly | undefined>();

  useResizeObserver(target, (entry) => setSize(entry.contentRect));

  return size;
};

export default useSize;
