import React from "react";
import { Button } from "@patternfly/react-core";
import { LazyLog } from "react-lazylog";
import { AiOutlineExpandAlt } from "react-icons/ai";
import { useFeedBrowser } from "../FeedOutputBrowser/useFeedBrowser";

type LogTerminalProps = {
  text: string;
};

const LogTerminal = ({ text }: LogTerminalProps) => {
  const { handleTerminalViewerOpen } = useFeedBrowser();
  return (
    <>
      <div
        style={{
          height: "40vh",
        }}
      >
        <Button
          style={{
            position: "absolute",
            top: "0",
            right: "0",
          }}
          onClick={handleTerminalViewerOpen}
          variant="link"
          icon={
            <AiOutlineExpandAlt
              style={{
                color: "white",
                height: "18px",
                width: "18px",
              }}
            />
          }
        />
        <LazyLog
          selectableLines={true}
          extraLines={1}
          enableSearch
          text={text}
          caseInsensitive
          lineHeight={21}
        />
      </div>
    </>
  );
};

export default LogTerminal;
