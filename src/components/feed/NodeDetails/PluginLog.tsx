import React from "react";
import { NodeDetailsProps } from "../../../store/resources/types";
import LogTerminal from "./LogTerminal";
import { isEmpty } from "lodash";

import usePluginInstanceResource from "./usePluginInstanceResource";

const PluginLog = ({ text }: NodeDetailsProps) => {
  const pluginInstanceResource = usePluginInstanceResource();
  const log = pluginInstanceResource && pluginInstanceResource.pluginLog;

  let terminalOutput = text ? text : "";
  terminalOutput +=
    log && !isEmpty(log) ? log.compute.logs : "Fetching logs ......";

  return <LogTerminal text={terminalOutput} />;
};

export default React.memo(PluginLog);
