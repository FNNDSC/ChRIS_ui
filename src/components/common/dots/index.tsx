import React from "react";
import Dots from "react-activity/dist/Dots";
import "react-activity/dist/library.css";

export const DotsIndicator = () => {
  return (
    <div>
      <Dots />
      <div
        style={{
          color: "#b8bbbe",
          fontSize: "0.75em",
        }}
      >
        Preparing to Download
      </div>
    </div>
  );
};
