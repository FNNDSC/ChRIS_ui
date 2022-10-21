import React from "react";
import Marker from "./Marker";

type TransitionGroupWrapperProps = {
  className: string;
  component: string;
  transform: string;
  children: React.ReactNode;
};

const TransitionGroupWrapper = (props: TransitionGroupWrapperProps) => {
  return (
    <g className={props.className} transform={props.transform}>
      <Marker />
      {props.children}
    </g>
  );
};

export default TransitionGroupWrapper;
