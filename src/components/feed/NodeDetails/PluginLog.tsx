import React from "react";
import { connect } from "react-redux";
import { ApplicationState } from "../../../store/root/applicationState";
import { NodeDetailsProps } from "../../../store/feed/types";
import LogTerminal from "./LogTerminal";
import { isEmpty } from "lodash";
import { getSelectedInstanceResource } from "../../../store/feed/selector";

const PluginLog = ({
  pluginInstanceResource,
  selected,
  text,
}: NodeDetailsProps) => {
  const log =
    pluginInstanceResource && selected && pluginInstanceResource.pluginLog;

  let terminalOutput  = text ? text : "";
  terminalOutput +=
    log && !isEmpty(log) ? log.compute.logs : "Fetching logs ......";

  return <LogTerminal text={terminalOutput} />;
};

const mapStateToProps = (state: ApplicationState) => ({
  selected: state.feed.selectedPlugin,
  pluginInstanceResource: getSelectedInstanceResource(state),
});

export default connect(mapStateToProps, {})(PluginLog);
