import React, { useRef, useEffect } from "react";
import { select } from "d3-selection";

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
      .attr("fill", "#fff");
  }, []);

  return (
    <defs>
      <marker ref={markerRef} id="end-arrow"></marker>
    </defs>
  );
};

export default React.memo(Marker);
