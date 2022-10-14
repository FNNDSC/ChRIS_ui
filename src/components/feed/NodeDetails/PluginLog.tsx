import React from "react";
import { isEmpty } from "lodash";
import { NodeDetailsProps } from "../../../store/resources/types";
import LogTerminal from "./LogTerminal";

import usePluginInstanceResource from "./usePluginInstanceResource";

const PluginLog = ({ text }: NodeDetailsProps) => {
  const pluginInstanceResource = usePluginInstanceResource();
  const log = pluginInstanceResource && pluginInstanceResource.pluginLog;

  let terminalOutput = text || "";
  terminalOutput +=
    log && !isEmpty(log) ? log.compute.logs : "Fetching logs ......";

  return <LogTerminal text={terminalOutput} />;
};

export default React.memo(PluginLog);
