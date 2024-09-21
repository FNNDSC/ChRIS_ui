import { LogViewer } from "@patternfly/react-log-viewer";
import { useRef, useEffect, useState } from "react";
import useSize from "../FeedTree/useSize";
import { useTypedSelector } from "../../store/hooks";

type LogTerminalProps = {
  text: string;
};

const LogTerminal = ({ text }: LogTerminalProps) => {
  const divRef = useRef<HTMLDivElement>(null);
  const size = useSize(divRef);
  const isTerminalMaximized = useTypedSelector(
    (state) => state.drawers.node.maximized,
  );
  const [terminalSize, setTerminalSize] = useState({
    width: "100%",
    height: "100%",
  });

  const handleResize = () => {
    if (divRef.current && size) {
      const parentWidth = size.width;
      const parentHeight = size.height;
      const element = document.getElementById("log-viewer");

      if (element) {
        setTerminalSize({
          width: `${parentWidth}px`,
          height: `${parentHeight}px`,
        });
      }
    }
  };

  useEffect(() => {
    // Call handleResize whenever window resizes
    window.addEventListener("resize", handleResize);

    // Initial resize logic when component mounts
    handleResize();

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [size, isTerminalMaximized]); // Ensure the effect runs when size or maximized state changes

  return (
    <div
      id="log-viewer"
      ref={divRef}
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      <LogViewer
        height={terminalSize.height}
        width={terminalSize.width}
        hasLineNumbers={false}
        data={text}
      />
    </div>
  );
};

export default LogTerminal;
