import React from "react";
import Marker from "./Marker";

type TransitionGroupWrapperProps = {
  className: string;
  component: string;
  transform: string;
  children: React.ReactNode;
};

const TransitionGroupWrapper = React.forwardRef(
  (props: TransitionGroupWrapperProps, ref: React.Ref<SVGGElement>) => {
    const innerRef = React.useRef<SVGGElement>(null);

    React.useImperativeHandle(ref, () => innerRef?.current);

    return (
      <g ref={innerRef} className={props.className} transform={props.transform}>
        <Marker />
        {props.children}
      </g>
    );
  },
);

export default TransitionGroupWrapper;
