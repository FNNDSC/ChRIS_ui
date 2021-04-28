import React, { MutableRefObject } from "react";
import useResizeObserver from "@react-hook/resize-observer";

const useSize = (
  target: MutableRefObject<HTMLDivElement | SVGSVGElement | null>
) => {
  const [size, setSize] = React.useState();

  React.useLayoutEffect(() => {
    //@ts-ignore
    setSize(target.current?.getBoundingClientRect());
  }, [target]);
  //@ts-ignore
  useResizeObserver(target, (entry) => setSize(entry.contentRect));
  return size;
};

export default useSize;
