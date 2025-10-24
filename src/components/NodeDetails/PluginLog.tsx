import { isEmpty } from "lodash";
import React from "react";
import LogTerminal from "./LogTerminal";

type Props = {
  text?: string;
  log?: any;
};
const PluginLog = ({ text, log }: Props) => {
  let terminalOutput = text ? text : "";
  terminalOutput +=
    log && !isEmpty(log) ? log.compute.logs : "Fetching logs ......";

  return <LogTerminal text={terminalOutput} />;
};

const PluginLogMemoed = React.memo(PluginLog);

export default PluginLogMemoed;
