import React from "react";
import { LazyLog } from "react-lazylog";

type LogTerminalProps = {
  text: string;
};

const LogTerminal = ({ text }: LogTerminalProps) => {
  return (
    <>
      <div
        style={{
          height: "100%",
        }}
      >
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
