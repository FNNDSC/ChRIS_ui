import React, { RefObject, MutableRefObject } from "react";
import useResizeObserver from "@react-hook/resize-observer";

const useSize = (
  target:
    | MutableRefObject<HTMLDivElement | SVGSVGElement | null>
    | RefObject<SVGGElement>,
) => {
  const [size, setSize] = React.useState();

  React.useLayoutEffect(() => {
    if (target.current) {
      //@ts-ignore
      setSize(target.current.getBoundingClientRect());
    }
  }, [target]);
  //@ts-ignore
  useResizeObserver(target, (entry) => setSize(entry.contentRect));

  return size;
};

export default useSize;
