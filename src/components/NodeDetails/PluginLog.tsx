import React from "react";
import type { NodeDetailsProps } from "../../store/resources/types";
import LogTerminal from "./LogTerminal";
import { isEmpty } from "lodash";

const PluginLog = ({ text, log }: NodeDetailsProps) => {
  let terminalOutput = text ? text : "";
  terminalOutput +=
    log && !isEmpty(log) ? log.compute.logs : "Fetching logs ......";

  return <LogTerminal text={terminalOutput} />;
};

const PluginLogMemoed = React.memo(PluginLog);

export default PluginLogMemoed;
