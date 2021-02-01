import React from "react";
import { LazyLog } from "react-lazylog";

type LogTerminalProps = {
  text: string;
  className?: string;
};

const LogTerminal = ({ text, className }: LogTerminalProps) => {
  return (
    <div className={`file-browser__lazyLog ${className} preview`}>
      <LazyLog extraLines={1} enableSearch text={text} caseInsensitive />;
    </div>
  );
};

export default LogTerminal;
