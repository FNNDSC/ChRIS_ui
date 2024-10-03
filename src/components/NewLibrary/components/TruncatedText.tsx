import React, { useRef, useEffect, useState } from "react";
import { Tooltip } from "@patternfly/react-core";

interface TruncatedTextProps {
  text: string;
  className?: string;
}

const TruncatedText: React.FC<TruncatedTextProps> = React.memo(
  ({ text, className }) => {
    const textRef = useRef<HTMLSpanElement>(null);
    const [isTruncated, setIsTruncated] = useState(false);
    useEffect(() => {
      const { current } = textRef;
      /*
        clientWidth: Represents the inner width of an element (excluding borders and scrollbars). It's essentially the width available for the content.
        scrollWidth: Represents the total width of the element's content, including the portion not visible on the screen due to overflow.
 *      */
      if (current) {
        setIsTruncated(current.scrollWidth > current.clientWidth);
      }
    }, []);

    return (
      <Tooltip content={text} isVisible={isTruncated} trigger="mouseenter">
        <span ref={textRef} className={className}>
          {text}
        </span>
      </Tooltip>
    );
  },
);

export default TruncatedText;
