import React from "react";
import { LazyLog } from "react-lazylog";

type LogTerminalProps = {
  text: string;
};

const LogTerminal = ({ text }: LogTerminalProps) => {

  return (
    <div className="file-browser__lazyLog">
      <LazyLog extraLines={1} enableSearch text={text} caseInsensitive />;
    </div>
  );
};

export default LogTerminal;
