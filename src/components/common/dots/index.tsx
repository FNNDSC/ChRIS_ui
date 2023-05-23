import React from "react";
import Dots from "react-activity/dist/Dots";
import "react-activity/dist/library.css";

export const DotsIndicator = () => {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Dots />
      <div
        style={{
          color: "#b8bbbe",
          fontSize: "0.75rem",
          marginLeft: "0.75rem",
        }}
      >
        Preparing to Download
      </div>
    </div>
  );
};
