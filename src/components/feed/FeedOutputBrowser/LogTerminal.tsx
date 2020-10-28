import React from "react";
import { LazyLog } from "react-lazylog";

type LogTerminalProps = {
  text: string;
};

const LogTerminal = ({ text }: LogTerminalProps) => {
  return <LazyLog extraLines={1} enableSearch text={text} caseInsensitive />;
};

export default LogTerminal;
