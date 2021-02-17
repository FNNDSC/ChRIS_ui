import React from "react";
import { connect } from "react-redux";
import { ApplicationState } from "../../../store/root/applicationState";
import { NodeDetailsProps } from "../../../store/feed/types";
import LogTerminal from "./LogTerminal";
import { isEmpty } from "lodash";
import { getSelectedInstanceResource } from "../../../store/feed/selector";

const PluginLog = ({ pluginInstanceResource, selected }: NodeDetailsProps) => {
  const log =
    pluginInstanceResource && selected && pluginInstanceResource.pluginLog;

  const text =
    log && !isEmpty(log)
      ? log?.compute?.d_ret?.l_logs[0]
      : "Fetching logs ......";

  return <LogTerminal text={text} />;
};

const mapStateToProps = (state: ApplicationState) => ({
  selected: state.feed.selectedPlugin,
  pluginInstanceResource: getSelectedInstanceResource(state),
});

export default connect(mapStateToProps, {})(PluginLog);
