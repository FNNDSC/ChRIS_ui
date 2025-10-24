import { select } from "d3-selection";
import { useEffect, useRef } from "react";

const Marker = () => {
  const markerRef = useRef<SVGMarkerElement>(null);

  useEffect(() => {
    select(markerRef.current)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 6)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#8a8d90");
  }, []);

  return (
    <defs>
      <marker ref={markerRef} id="end-arrow" />
    </defs>
  );
};

export default Marker;
