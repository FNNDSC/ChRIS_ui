import React from 'react';
import Moment from "react-moment";
import { connect } from "react-redux";
import { ApplicationState } from "../../../store/root/applicationState";

import { Button, Grid, GridItem, Title } from "@patternfly/react-core";
import {
  Plugin,
  PluginInstance,
  PluginInstanceDescendantList,
  PluginParameterList
} from "@fnndsc/chrisapi";
import {
  TerminalIcon,
  CaretDownIcon,
  CalendarDayIcon,
  CheckIcon,
  ErrorCircleOIcon,
  MixcloudIcon,
  CloudUploadAltIcon,
  DockerIcon,
  StorageDomainIcon,
  OnRunningIcon,
  ServicesIcon,
  FileArchiveIcon,
  OutlinedClockIcon,
  InProgressIcon,
} from "@patternfly/react-icons";

import AddNode from "../AddNode/AddNode";
import DeleteNode from "../DeleteNode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PluginStatus } from "../../../store/plugin/types";
import { displayDescription } from "../FeedOutputBrowser/utils";
import "./NodeDetails.scss";
import TextCopyPopover from "../../common/textcopypopover/TextCopyPopover";

interface INodeProps {
  selected: PluginInstance;
  descendants: PluginInstance[];
  pluginStatus?: PluginStatus[];
  pluginLog?: {};
  isComputeError?: boolean;
}

interface INodeState {
  plugin?: Plugin;
  instanceParameters?: PluginInstanceDescendantList;
  pluginParameters?: PluginParameterList;
}

function getInitialState(){
  return {
    plugin: undefined,
    instanceParameters:undefined,
    pluginParameters: undefined,
  };
}


const NodeDetails: React.FC<INodeProps> = ({ selected, pluginStatus }) => {
  const [nodeState, setNodeState] = React.useState<INodeState>(getInitialState);
  const { plugin, instanceParameters, pluginParameters } = nodeState;

  React.useEffect(() => {
    async function fetchData() {
      const instanceParameters = await selected.getParameters({
        limit: 100,
        offset: 0,
      });

      const plugin = await selected.getPlugin();
      const pluginParameters = await plugin.getPluginParameters({
        limit: 100,
        offset: 0,
      });

      setNodeState({
        plugin,
        instanceParameters,
        pluginParameters,
      });
    }
    fetchData();
  }, [selected]);

  const command = React.useCallback(getCommand, [
    plugin,
    instanceParameters,
    pluginParameters,
  ]);
  const title = React.useCallback(getCurrentTitleFromStatus, [pluginStatus]);
  const runTime = React.useCallback(getRuntimeString, [selected, pluginStatus]);
  const pluginTitle = React.useMemo(() => {
    return `${selected.data.plugin_name} v. ${selected.data.plugin_version}`;
  }, [selected]);

  return (
    <>
      <div className="details-header-wrap">
        <div>
          Selected Node:
          <Title headingLevel="h2" size="xl">
            {pluginTitle}
          </Title>
        </div>
        <div>
          <TextCopyPopover
            text={
              plugin && instanceParameters && pluginParameters
                ? command(plugin, instanceParameters, pluginParameters)
                : ""
            }
            headerContent={`Docker Command for ${pluginTitle}`}
            max-width="50rem"
            className="view-command-wrap"
          >
            <Button>
              <TerminalIcon />
              View Command
              <CaretDownIcon />
            </Button>
          </TextCopyPopover>
        </div>
      </div>
      <Grid className="node-details-grid">
        <GridItem span={2} className="title">
          Status
        </GridItem>
        <GridItem span={10} className="value">
          {selected.data.status === "waitingForPrevious" ? (
            <>
              <OutlinedClockIcon />
              <span>Waiting for Previous</span>
            </>
          ) : selected.data.status === "scheduled" ? (
            <>
              <InProgressIcon />
              <span>Scheduled</span>
            </>
          ) : selected.data.status === "registeringFiles" ? (
            <>
              <FileArchiveIcon />
              <span>Registering Files</span>
            </>
          ) : selected.data.status === "finishedWithError" ? (
            <>
              <ErrorCircleOIcon />
              <span>FinishedWithError</span>
            </>
          ) : selected.data.status === "finishedSuccessfully" ? (
            <>
              <CheckIcon />
              <span>FinishedSuccessfully</span>
            </>
          ) : pluginStatus ? (
            <div className="node-details-grid__title">
              <h3
                className="node-details-grid__title-label"
                style={{ color: "white" }}
              >
                {title(pluginStatus)}
              </h3>
            </div>
          ) : (
            <>
              <OnRunningIcon />
              <span>Started</span>
            </>
          )}
        </GridItem>

        <GridItem span={2} className="title">
          Created
        </GridItem>
        <GridItem span={10} className="value">
          <CalendarDayIcon />
          <Moment format="DD MMM YYYY @ HH:mm">
            {selected.data.start_date}
          </Moment>
        </GridItem>

        <GridItem span={2} className="title">
          Node ID
        </GridItem>
        <GridItem span={10} className="value">
          {selected.data.id}
        </GridItem>
        {runTime && (
          <>
            <GridItem span={2} className="title">
              <FontAwesomeIcon icon={["far", "calendar-alt"]} />
              Total Runtime:
            </GridItem>
            <GridItem span={10} className="value">
              {runTime(selected)}
            </GridItem>
          </>
        )}
        <GridItem span={2}>
          <div className="btn-div">
            <AddNode />
          </div>
        </GridItem>

        <GridItem span={2}>
          <div className="btn-div">
            {!selected.data.plugin_name.includes("dircopy") && <DeleteNode />}
          </div>
        </GridItem>
      </Grid>
      <br />
      <br />
      <label style={{ color: "white", fontWeight: "bold" }}>
        Plugin output may be viewed below.
      </label>
    </>
  );
};

const mapStateToProps = (state: ApplicationState) => ({
  pluginStatus: state.plugin.pluginStatus,
  pluginLog: state.plugin.pluginLog,
  isComputeError: state.plugin.computeError,
});

export default connect(mapStateToProps, null)(NodeDetails);


function getCurrentTitleFromStatus(statusLabels: PluginStatus[]) {
  const currentTitle = statusLabels
    .map((label) => {
      const computedTitle = displayDescription(label);
      switch (computedTitle) {
        case "Transmitting data to compute environment":
          return (
            <>
              <CloudUploadAltIcon />
              <span>Transmitting Data</span>
            </>
          );
        case "Setting compute environment":
          return (
            <>
              <DockerIcon />
              <span>Setting Compute Environment</span>
            </>
          );

        case "Computing":
          return (
            <>
              <ServicesIcon />
              <span>Computing</span>
            </>
          );

        case "Syncing data from compute environment":
          return (
            <>
              <MixcloudIcon />
              <span>Syncing Data</span>
            </>
          );

        case "Finishing up":
          return (
            <>
              <StorageDomainIcon />
              <span>Finishing up</span>
            </>
          );

        default:
          return undefined;
      }
    })
    .filter((title) => title !== undefined);
  return currentTitle[0];
}

function getRuntimeString(selected:PluginInstance) {
  let runtime = 0;
  const start = new Date(selected.data.start_date);
  const end = new Date(selected.data.end_date);
  const elapsed = end.getTime() - start.getTime(); // milliseconds between start and end
  runtime += elapsed;

  // format millisecond amount into human-readable string
  let runtimeStrings = [];
  const timeParts = [
    ["day", Math.floor(runtime / (1000 * 60 * 60 * 24))],
    ["hr", Math.floor((runtime / (1000 * 60 * 60)) % 24)],
    ["min", Math.floor((runtime / 1000 / 60) % 60)],
    ["sec", Math.floor((runtime / 1000) % 60)],
  ];
  for (const part of timeParts) {
    const [name, value] = part;
    if (value > 0) {
      runtimeStrings.push(`${value} ${name}`);
    }
  }
  return runtimeStrings.join(", ");
}

function getCommand(
  plugin: Plugin,
  params: PluginInstanceDescendantList,
  parameters: PluginParameterList
) {
  const { dock_image, selfexec } = plugin.data;
  let modifiedParams: {
    name?: string;
    value?: string;
  }[] = [];

  let instanceParameters=params.getItems();
  let pluginParameters=parameters.getItems();
  

    for (let i = 0; i < instanceParameters.length; i++) {
      for (let j = 0; j < pluginParameters.length; j++) {
        if (instanceParameters[i].data.param_name === pluginParameters[j].data.name) {
          modifiedParams.push({
            name: pluginParameters[j].data.flag,
            value: instanceParameters[i].data.value,
          });
        }
      }
    }

    let command = `docker run --rm -v $(pwd)/in:/incoming -v $(pwd)/out:/outgoing ${dock_image} ${selfexec}`;
    if (modifiedParams.length) {
      command +=
        "\n" +
        modifiedParams
          .map((param) => `${param.name} ${param.value}`)
          .join("\n");
    }
    command = `${command}\n /incoming/outgoing`.trim();
    const lines = command.split("\n");
    const longest = lines.reduce((a, b) => (a.length > b.length ? a : b))
      .length;
    return lines
      .map((line) => `${line.padEnd(longest)} \\`)
      .join("\n")
      .slice(0, -1);
    
}